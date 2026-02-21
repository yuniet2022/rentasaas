const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const { query } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-min-32-chars!!';

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later' },
  skipSuccessfulRequests: true,
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 payment attempts per 5 minutes
  message: { error: 'Too many payment attempts, please try again later' },
});

app.use(generalLimiter);

// Encryption Helpers
const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ==================== STRIPE SETUP ====================
let stripe;
try {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (stripeSecret && stripeSecret.startsWith('sk_')) {
    stripe = require('stripe')(stripeSecret);
  }
} catch (e) {
  console.log('Stripe not configured');
}

// ==================== PAYPAL SETUP ====================
const paypal = require('@paypal/checkout-server-sdk');
let paypalEnvironment;
let paypalClient;

const initPayPal = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  
  if (clientId && clientSecret) {
    paypalEnvironment = mode === 'live' 
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);
    return true;
  }
  return false;
};

initPayPal();

// ==================== WEBPAY SETUP ====================
const { WebpayPlus } = require('transbank-sdk');
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk');

let webpayConfigured = false;
let webpayCommerceCode = process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
let webpayApiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY;
let webpayEnvironment = process.env.WEBPAY_ENVIRONMENT || 'integration';

const initWebPay = () => {
  try {
    if (process.env.WEBPAY_ENABLED === 'true') {
      // Configurar WebPay según el entorno
      if (webpayEnvironment === 'production') {
        WebpayPlus.configureForProduction(webpayCommerceCode, webpayApiKey);
      } else if (webpayEnvironment === 'test') {
        WebpayPlus.configureForTesting();
      } else {
        // integration (desarrollo)
        WebpayPlus.configureForTesting();
      }
      webpayConfigured = true;
      console.log('✅ WebPay configured:', webpayEnvironment);
      return true;
    }
  } catch (e) {
    console.error('WebPay configuration error:', e);
  }
  return false;
};

initWebPay();

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register (only for clients)
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email exists
    const existing = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (always client role for self-registration)
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5, 'client')
       RETURNING *`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), hashedPassword, phone?.trim()]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== USER ROUTES ====================

// Create user (Admin only - for owners and cleaners)
app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    if (!['owner', 'cleaner'].includes(role)) {
      return res.status(400).json({ error: 'Can only create owner or cleaner roles' });
    }

    const existing = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), hashedPassword, phone?.trim(), role]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, email, phone, role, avatar, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isActive: user.is_active,
      createdAt: user.created_at
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SETTINGS ROUTES (Admin Only) ====================

// Get all settings
app.get('/api/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY category, key');
    res.json(result.rows.map(s => ({
      id: s.id,
      key: s.key,
      value: s.is_encrypted ? decrypt(s.value) : s.value,
      category: s.category,
      isEncrypted: s.is_encrypted,
      description: s.description,
      updatedAt: s.updated_at
    })));
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get settings by category
app.get('/api/settings/:category', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings WHERE category = $1', [req.params.category]);
    res.json(result.rows.map(s => ({
      id: s.id,
      key: s.key,
      value: s.is_encrypted ? decrypt(s.value) : s.value,
      category: s.category,
      isEncrypted: s.is_encrypted,
      description: s.description
    })));
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update setting
app.put('/api/settings/:key', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { value, isEncrypted } = req.body;
    const finalValue = isEncrypted ? encrypt(value) : value;

    const result = await query(
      `UPDATE settings 
       SET value = $1, is_encrypted = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $3
       WHERE key = $4
       RETURNING *`,
      [finalValue, isEncrypted, req.user.id, req.params.key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const s = result.rows[0];
    res.json({
      id: s.id,
      key: s.key,
      value: isEncrypted ? decrypt(s.value) : s.value,
      category: s.category,
      isEncrypted: s.is_encrypted,
      description: s.description
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get public payment config (for frontend)
app.get('/api/config/payments', async (req, res) => {
  try {
    const result = await query(
      "SELECT key, value FROM settings WHERE key IN ('stripe_enabled', 'stripe_publishable_key', 'paypal_enabled', 'paypal_client_id', 'paypal_mode', 'webpay_enabled', 'payment_currency', 'payment_tax_rate')"
    );
    
    const config = {};
    result.rows.forEach(row => {
      if (row.key === 'stripe_enabled' || row.key === 'paypal_enabled') {
        config[row.key] = row.value === 'true';
      } else if (row.key === 'payment_tax_rate') {
        config[row.key] = parseFloat(row.value) || 0;
      } else {
        config[row.key] = row.value;
      }
    });
    
    res.json(config);
  } catch (error) {
    console.error('Get payment config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROPERTY ROUTES ====================

// Get all properties (Public)
app.get('/api/properties', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.first_name as owner_first_name, u.last_name as owner_last_name
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.is_active = true
       ORDER BY p.featured DESC, p.created_at DESC`
    );
    res.json(result.rows.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      address: p.address,
      category: p.category,
      rating: p.rating,
      guests: p.guests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      pricePerNight: p.price_per_night,
      images: p.images || [],
      amenities: p.amenities || [],
      featured: p.featured,
      isActive: p.is_active,
      ownerId: p.owner_id,
      ownerName: p.owner_first_name ? `${p.owner_first_name} ${p.owner_last_name}` : null,
      createdAt: p.created_at
    })));
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get property by ID (Public)
app.get('/api/properties/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.first_name as owner_first_name, u.last_name as owner_last_name
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const p = result.rows[0];
    res.json({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      address: p.address,
      category: p.category,
      rating: p.rating,
      guests: p.guests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      pricePerNight: p.price_per_night,
      images: p.images || [],
      amenities: p.amenities || [],
      featured: p.featured,
      isActive: p.is_active,
      ownerId: p.owner_id,
      ownerName: p.owner_first_name ? `${p.owner_first_name} ${p.owner_last_name}` : null,
      createdAt: p.created_at
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create property (Admin only)
app.post('/api/properties', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      title, description, location, address, category,
      guests, bedrooms, bathrooms, pricePerNight,
      images, amenities, featured, ownerId
    } = req.body;

    const result = await query(
      `INSERT INTO properties (title, description, location, address, category, guests, bedrooms, bathrooms, price_per_night, images, amenities, featured, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, description, location, address, category, guests, bedrooms, bathrooms, pricePerNight, images, amenities, featured, ownerId]
    );

    const p = result.rows[0];
    res.status(201).json({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      address: p.address,
      category: p.category,
      rating: p.rating,
      guests: p.guests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      pricePerNight: p.price_per_night,
      images: p.images || [],
      amenities: p.amenities || [],
      featured: p.featured,
      isActive: p.is_active,
      ownerId: p.owner_id,
      createdAt: p.created_at
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update property (Admin only)
app.put('/api/properties/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      title, description, location, address, category,
      guests, bedrooms, bathrooms, pricePerNight,
      images, amenities, featured, isActive, ownerId
    } = req.body;

    const result = await query(
      `UPDATE properties 
       SET title = $1, description = $2, location = $3, address = $4, category = $5,
           guests = $6, bedrooms = $7, bathrooms = $8, price_per_night = $9,
           images = $10, amenities = $11, featured = $12, is_active = $13, owner_id = $14,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING *`,
      [title, description, location, address, category, guests, bedrooms, bathrooms, 
       pricePerNight, images, amenities, featured, isActive, ownerId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const p = result.rows[0];
    res.json({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      address: p.address,
      category: p.category,
      rating: p.rating,
      guests: p.guests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      pricePerNight: p.price_per_night,
      images: p.images || [],
      amenities: p.amenities || [],
      featured: p.featured,
      isActive: p.is_active,
      ownerId: p.owner_id,
      createdAt: p.created_at
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete property (Admin only)
app.delete('/api/properties/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM properties WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BOOKING ROUTES ====================

// Get all bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, p.title as property_title, p.location as property_location
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       ORDER BY b.check_in DESC`
    );
    res.json(result.rows.map(b => ({
      id: b.id,
      propertyId: b.property_id,
      propertyTitle: b.property_title,
      propertyLocation: b.property_location,
      clientId: b.client_id,
      checkIn: b.check_in,
      checkOut: b.check_out,
      guests: b.guests,
      totalPrice: b.total_price,
      status: b.status,
      source: b.source,
      externalId: b.external_id,
      guestName: b.guest_name,
      guestEmail: b.guest_email,
      guestPhone: b.guest_phone,
      specialRequests: b.special_requests,
      createdAt: b.created_at
    })));
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const {
      propertyId, checkIn, checkOut, guests, totalPrice,
      guestName, guestEmail, guestPhone, specialRequests, source = 'direct'
    } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    // Check if property is available for these dates
    const availabilityCheck = await query(
      `SELECT * FROM bookings 
       WHERE property_id = $1 
       AND status IN ('confirmed', 'pending')
       AND (
         (check_in <= $2 AND check_out > $2) OR
         (check_in < $3 AND check_out >= $3) OR
         (check_in >= $2 AND check_out <= $3)
       )`,
      [propertyId, checkIn, checkOut]
    );

    if (availabilityCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Property is not available for the selected dates' });
    }

    const result = await query(
      `INSERT INTO bookings (property_id, client_id, check_in, check_out, guests, total_price, guest_name, guest_email, guest_phone, special_requests, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
       RETURNING *`,
      [propertyId, req.user.id, checkIn, checkOut, guests, totalPrice, guestName, guestEmail, guestPhone, specialRequests, source]
    );

    const b = result.rows[0];
    res.status(201).json({
      id: b.id,
      propertyId: b.property_id,
      clientId: b.client_id,
      checkIn: b.check_in,
      checkOut: b.check_out,
      guests: b.guests,
      totalPrice: b.total_price,
      status: b.status,
      source: b.source,
      guestName: b.guest_name,
      guestEmail: b.guest_email,
      guestPhone: b.guest_phone,
      specialRequests: b.special_requests,
      createdAt: b.created_at
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== STRIPE PAYMENT ROUTES ====================

// Create Stripe Payment Intent
app.post('/api/payments/stripe/create-intent', authenticateToken, paymentLimiter, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { bookingId, amount, currency = 'cad' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'Booking ID and amount are required' });
    }

    // Verify booking exists and belongs to user
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND client_id = $2',
      [bookingId, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user.id.toString(),
        propertyId: booking.property_id.toString()
      }
    });

    // Create payment record
    await query(
      `INSERT INTO payments (booking_id, amount, currency, provider, provider_transaction_id, status)
       VALUES ($1, $2, $3, 'stripe', $4, 'pending')`,
      [bookingId, amount, currency.toUpperCase(), paymentIntent.id]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Stripe Webhook
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await query(
          `UPDATE payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP 
           WHERE provider_transaction_id = $1`,
          [paymentIntent.id]
        );
        // Update booking status
        if (paymentIntent.metadata?.bookingId) {
          await query(
            `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
            [paymentIntent.metadata.bookingId]
          );
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await query(
          `UPDATE payments SET status = 'failed' WHERE provider_transaction_id = $1`,
          [failedPayment.id]
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ==================== PAYPAL PAYMENT ROUTES ====================

// Create PayPal Order
app.post('/api/payments/paypal/create-order', authenticateToken, paymentLimiter, async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ error: 'PayPal is not configured' });
    }

    const { bookingId, amount, currency = 'CAD' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'Booking ID and amount are required' });
    }

    // Verify booking exists
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND client_id = $2',
      [bookingId, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2)
        },
        custom_id: bookingId.toString(),
        description: `Booking #${bookingId}`
      }]
    });

    const order = await paypalClient.execute(request);

    // Create payment record
    await query(
      `INSERT INTO payments (booking_id, amount, currency, provider, provider_transaction_id, status)
       VALUES ($1, $2, $3, 'paypal', $4, 'pending')`,
      [bookingId, amount, currency.toUpperCase(), order.result.id]
    );

    res.json({
      orderId: order.result.id,
      status: order.result.status
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Capture PayPal Order
app.post('/api/payments/paypal/capture-order', authenticateToken, paymentLimiter, async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ error: 'PayPal is not configured' });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);

    if (capture.result.status === 'COMPLETED') {
      // Update payment record
      await query(
        `UPDATE payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP, payment_details = $1
         WHERE provider_transaction_id = $2`,
        [JSON.stringify(capture.result), orderId]
      );

      // Update booking status
      const bookingId = capture.result.purchase_units[0]?.payments?.captures[0]?.custom_id;
      if (bookingId) {
        await query(
          `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
          [bookingId]
        );
      }

      res.json({
        status: 'completed',
        captureId: capture.result.id
      });
    } else {
      await query(
        `UPDATE payments SET status = 'failed' WHERE provider_transaction_id = $1`,
        [orderId]
      );
      res.status(400).json({ error: 'Payment capture failed' });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

// ==================== WEBPAY PAYMENT ROUTES (Chile) ====================

// Create WebPay Transaction
app.post('/api/payments/webpay/create', authenticateToken, paymentLimiter, async (req, res) => {
  try {
    if (!webpayConfigured) {
      return res.status(503).json({ error: 'WebPay is not configured' });
    }

    const { bookingId, amount, returnUrl } = req.body;

    if (!bookingId || !amount || !returnUrl) {
      return res.status(400).json({ error: 'Booking ID, amount and return URL are required' });
    }

    // Verify booking exists
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND client_id = $2',
      [bookingId, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const buyOrder = `BOOKING-${bookingId}-${Date.now()}`;
    const sessionId = `SESSION-${req.user.id}-${Date.now()}`;

    // Create WebPay transaction
    const createResponse = await WebpayPlus.Transaction.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    // Create payment record
    await query(
      `INSERT INTO payments (booking_id, amount, currency, provider, provider_transaction_id, status)
       VALUES ($1, $2, $3, 'webpay', $4, 'pending')`,
      [bookingId, amount, 'CLP', createResponse.token]
    );

    res.json({
      token: createResponse.token,
      url: createResponse.url,
      buyOrder: buyOrder
    });
  } catch (error) {
    console.error('WebPay create transaction error:', error);
    res.status(500).json({ error: 'Failed to create WebPay transaction' });
  }
});

// Confirm WebPay Transaction
app.post('/api/payments/webpay/confirm', authenticateToken, async (req, res) => {
  try {
    if (!webpayConfigured) {
      return res.status(503).json({ error: 'WebPay is not configured' });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Confirm transaction
    const confirmResponse = await WebpayPlus.Transaction.commit(token);

    // Get payment record
    const paymentResult = await query(
      'SELECT * FROM payments WHERE provider_transaction_id = $1',
      [token]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Update payment status based on response
    if (confirmResponse.status === 'AUTHORIZED' && confirmResponse.response_code === 0) {
      await query(
        `UPDATE payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP, payment_details = $1
         WHERE provider_transaction_id = $2`,
        [JSON.stringify(confirmResponse), token]
      );

      // Update booking status
      await query(
        `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
        [payment.booking_id]
      );

      res.json({
        status: 'completed',
        amount: confirmResponse.amount,
        authorizationCode: confirmResponse.authorization_code,
        paymentType: confirmResponse.payment_type_code,
        cardNumber: confirmResponse.card_detail?.card_number,
        transactionDate: confirmResponse.transaction_date
      });
    } else {
      await query(
        `UPDATE payments SET status = 'failed', payment_details = $1
         WHERE provider_transaction_id = $2`,
        [JSON.stringify(confirmResponse), token]
      );

      res.status(400).json({
        status: 'failed',
        responseCode: confirmResponse.response_code,
        message: 'Payment was not authorized'
      });
    }
  } catch (error) {
    console.error('WebPay confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm WebPay transaction' });
  }
});

// Get WebPay Transaction Status
app.get('/api/payments/webpay/status/:token', authenticateToken, async (req, res) => {
  try {
    if (!webpayConfigured) {
      return res.status(503).json({ error: 'WebPay is not configured' });
    }

    const { token } = req.params;

    const statusResponse = await WebpayPlus.Transaction.status(token);

    res.json({
      status: statusResponse.status,
      amount: statusResponse.amount,
      buyOrder: statusResponse.buy_order,
      sessionId: statusResponse.session_id,
      cardNumber: statusResponse.card_detail?.card_number,
      accountingDate: statusResponse.accounting_date,
      transactionDate: statusResponse.transaction_date,
      authorizationCode: statusResponse.authorization_code,
      paymentType: statusResponse.payment_type_code,
      responseCode: statusResponse.response_code,
      installments: statusResponse.installments,
      installmentsAmount: statusResponse.installments_amount
    });
  } catch (error) {
    console.error('WebPay status error:', error);
    res.status(500).json({ error: 'Failed to get WebPay status' });
  }
});

// Refund WebPay Transaction (Admin only)
app.post('/api/payments/webpay/refund', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    if (!webpayConfigured) {
      return res.status(503).json({ error: 'WebPay is not configured' });
    }

    const { token, amount } = req.body;

    if (!token || !amount) {
      return res.status(400).json({ error: 'Token and amount are required' });
    }

    const refundResponse = await WebpayPlus.Transaction.refund(token, amount);

    // Update payment status
    await query(
      `UPDATE payments SET status = 'refunded', payment_details = payment_details || $1::jsonb
       WHERE provider_transaction_id = $2`,
      [JSON.stringify({ refund: refundResponse }), token]
    );

    res.json({
      type: refundResponse.type,
      balance: refundResponse.balance,
      authorizationCode: refundResponse.authorization_code,
      responseCode: refundResponse.response_code,
      authorizationDate: refundResponse.authorization_date,
      nullifiedAmount: refundResponse.nullified_amount
    });
  } catch (error) {
    console.error('WebPay refund error:', error);
    res.status(500).json({ error: 'Failed to refund WebPay transaction' });
  }
});

// ==================== PAYMENT RECORDS ROUTES ====================

// Get payments for a booking
app.get('/api/bookings/:bookingId/payments', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, b.client_id 
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.booking_id = $1`,
      [req.params.bookingId]
    );

    // Check if user owns this booking or is admin
    const booking = result.rows[0];
    if (!booking || (booking.client_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result.rows.map(p => ({
      id: p.id,
      bookingId: p.booking_id,
      amount: p.amount,
      currency: p.currency,
      provider: p.provider,
      status: p.status,
      paymentMethod: p.payment_method,
      paidAt: p.paid_at,
      createdAt: p.created_at
    })));
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SUPPLIES ROUTES ====================

// Get all supplies
app.get('/api/supplies', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, p.title as property_title, p.location as property_location
       FROM supplies s
       JOIN properties p ON s.property_id = p.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows.map(s => ({
      id: s.id,
      propertyId: s.property_id,
      propertyTitle: s.property_title,
      propertyLocation: s.property_location,
      name: s.name,
      category: s.category,
      description: s.description,
      unitCost: s.unit_cost,
      quantity: s.quantity,
      unit: s.unit,
      supplier: s.supplier,
      purchaseDate: s.purchase_date,
      isRecurring: s.is_recurring,
      frequency: s.frequency,
      createdAt: s.created_at
    })));
  } catch (error) {
    console.error('Get supplies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create supply (Admin only)
app.post('/api/supplies', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      propertyId, name, category, description,
      unitCost, quantity, unit, supplier,
      purchaseDate, isRecurring, frequency
    } = req.body;

    const result = await query(
      `INSERT INTO supplies (property_id, name, category, description, unit_cost, quantity, unit, supplier, purchase_date, is_recurring, frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [propertyId, name, category, description, unitCost, quantity, unit, supplier, purchaseDate, isRecurring, frequency]
    );

    const s = result.rows[0];
    res.status(201).json({
      id: s.id,
      propertyId: s.property_id,
      name: s.name,
      category: s.category,
      description: s.description,
      unitCost: s.unit_cost,
      quantity: s.quantity,
      unit: s.unit,
      supplier: s.supplier,
      purchaseDate: s.purchase_date,
      isRecurring: s.is_recurring,
      frequency: s.frequency,
      createdAt: s.created_at
    });
  } catch (error) {
    console.error('Create supply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== STATS ROUTES ====================

// Get dashboard stats (Admin)
app.get('/api/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const propertiesCount = await query('SELECT COUNT(*) FROM properties WHERE is_active = true');
    const bookingsCount = await query('SELECT COUNT(*) FROM bookings');
    const revenueResult = await query('SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status IN (\'confirmed\', \'completed\')');
    
    res.json({
      totalProperties: parseInt(propertiesCount.rows[0].count),
      totalBookings: parseInt(bookingsCount.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      occupancyRate: 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== SETUP ENDPOINT (TEMPORAL) ====================
// Este endpoint es temporal para inicializar la base de datos
// Después de usarlo, deberías eliminarlo

app.get('/api/setup/init-database', async (req, res) => {
  try {
    // Verificar si las tablas ya existen
    const checkTable = await query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')");
    
    if (checkTable.rows[0].exists) {
      return res.json({ 
        message: 'Database already initialized',
        status: 'Tables already exist'
      });
    }
    
    // Crear todas las tablas
    await query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'owner', 'cleaner', 'client')),
        avatar VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        category VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 4.5,
        guests INTEGER DEFAULT 2,
        bedrooms INTEGER DEFAULT 1,
        bathrooms INTEGER DEFAULT 1,
        price_per_night DECIMAL(10,2) NOT NULL,
        images TEXT[],
        amenities TEXT[],
        featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE supplies (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        unit_cost DECIMAL(10,2) NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit VARCHAR(50) DEFAULT 'unidad',
        supplier VARCHAR(255),
        purchase_date DATE,
        is_recurring BOOLEAN DEFAULT false,
        frequency VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id),
        client_id INTEGER REFERENCES users(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INTEGER DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
        source VARCHAR(20) DEFAULT 'direct' CHECK (source IN ('direct', 'booking', 'airbnb', 'vrbo')),
        external_id VARCHAR(100),
        guest_name VARCHAR(255),
        guest_email VARCHAR(255),
        guest_phone VARCHAR(20),
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id),
        supply_id INTEGER REFERENCES supplies(id),
        category VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        receipt_url VARCHAR(500),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE cleaner_assignments (
        id SERIAL PRIMARY KEY,
        cleaner_id INTEGER REFERENCES users(id),
        property_id INTEGER REFERENCES properties(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        category VARCHAR(50) NOT NULL,
        is_encrypted BOOLEAN DEFAULT false,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES users(id)
      );

      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'CAD',
        provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal', 'cash', 'transfer')),
        provider_transaction_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
        payment_method VARCHAR(50),
        payment_details JSONB,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role ON users(role);
      CREATE INDEX idx_properties_owner ON properties(owner_id);
      CREATE INDEX idx_bookings_property ON bookings(property_id);
      CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
      CREATE INDEX idx_bookings_status ON bookings(status);
      CREATE INDEX idx_supplies_property ON supplies(property_id);
      CREATE INDEX idx_expenses_property ON expenses(property_id);
      CREATE INDEX idx_expenses_date ON expenses(date);
      CREATE INDEX idx_payments_booking ON payments(booking_id);
      CREATE INDEX idx_payments_provider ON payments(provider);
      CREATE INDEX idx_payments_status ON payments(status);
      CREATE INDEX idx_settings_category ON settings(category);
    `);

    // Crear admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['Admin', 'Super', 'admin@liftylife.com', hashedPassword, '+1234567890', 'admin', true]
    );

    // Crear owner
    const ownerPassword = await bcrypt.hash('owner123', 12);
    
    await query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['Roberto', 'Fernández', 'owner@liftylife.com', ownerPassword, '+1234567890', 'owner', true]
    );

    // Insertar propiedades de ejemplo
    await query(`
      INSERT INTO properties (title, description, location, address, category, guests, bedrooms, bathrooms, price_per_night, images, amenities, featured, owner_id)
      VALUES 
      ('El Après | Estudio Village con bañera de hidromasaje', 'Hermoso estudio en el corazón de Whistler Village con vistas a las montañas.', 'Whistler', '123 Village St, Whistler, BC', 'Vida de Montaña', 4, 1, 1, 189, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], ARRAY['hot-tub', 'kitchen', 'pets', 'wifi'], true, 2),
      ('Harrison en el lago | Casa junto a la playa', 'Casa familiar a pasos del lago Harrison con acceso privado a la playa.', 'Harrison & Cascadas', '456 Lakeview Dr, Harrison Hot Springs, BC', 'Vida Junto al Lago', 4, 1, 1, 145, ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'], ARRAY['kitchen', 'ac', 'washer', 'wifi'], true, 2)
    `);

    // Insertar settings por defecto
    await query(`
      INSERT INTO settings (key, value, category, description) VALUES
      ('stripe_enabled', 'false', 'payment', 'Habilitar pagos con Stripe'),
      ('paypal_enabled', 'false', 'payment', 'Habilitar pagos con PayPal'),
      ('webpay_enabled', 'false', 'payment', 'Habilitar pagos con WebPay (Chile)'),
      ('payment_currency', 'CAD', 'payment', 'Moneda por defecto'),
      ('payment_tax_rate', '12', 'payment', 'Porcentaje de impuestos')
    `);
    
    res.json({
      message: 'Database initialized successfully',
      credentials: {
        admin: { email: 'admin@liftylife.com', password: 'admin123' },
        owner: { email: 'owner@liftylife.com', password: 'owner123' }
      }
    });
  } catch (error) {
    console.error('Database init error:', error);
    res.status(500).json({ error: 'Failed to initialize database', details: error.message });
  }
});

// ==================== CALENDAR ROUTE ====================

// Get calendar data for all properties
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (month && year) {
      dateFilter = 'AND EXTRACT(MONTH FROM b.check_in) = $1 AND EXTRACT(YEAR FROM b.check_in) = $2';
      params.push(month, year);
    }

    const result = await query(
      `SELECT b.*, p.title as property_title, p.location as property_location
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.status IN ('confirmed', 'pending', 'completed')
       ${dateFilter}
       ORDER BY b.check_in`,
      params
    );

    res.json(result.rows.map(b => ({
      id: b.id,
      propertyId: b.property_id,
      propertyTitle: b.property_title,
      propertyLocation: b.property_location,
      checkIn: b.check_in,
      checkOut: b.check_out,
      guests: b.guests,
      totalPrice: b.total_price,
      status: b.status,
      source: b.source,
      guestName: b.guest_name,
      guestEmail: b.guest_email,
      guestPhone: b.guest_phone
    })));
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SAAS MULTI-TENANT ROUTES ====================

// Middleware para detectar tenant por dominio
const detectTenant = async (req, res, next) => {
  try {
    const hostname = req.headers.host || req.hostname;
    
    // Buscar tenant por dominio
    const result = await query(
      'SELECT * FROM tenants WHERE domain = $1 OR custom_domain = $1',
      [hostname]
    );
    
    if (result.rows.length > 0) {
      req.tenant = result.rows[0];
    }
    
    next();
  } catch (error) {
    console.error('Tenant detection error:', error);
    next();
  }
};

// Get tenant config by domain (public)
app.get('/api/tenant/config', async (req, res) => {
  try {
    const hostname = req.headers.host || req.hostname;
    
    const result = await query(
      `SELECT t.*, tpl.name as template_name, tpl.preview_image_url 
       FROM tenants t
       LEFT JOIN templates tpl ON t.template_id = tpl.id
       WHERE t.domain = $1 OR t.custom_domain = $1`,
      [hostname]
    );
    
    if (result.rows.length === 0) {
      // Return default config for master site
      return res.json({
        isClientSite: false,
        companyName: 'LIFTYLIFE',
        showDestination: true,
        searchButtonText: 'Buscar propiedades'
      });
    }
    
    const tenant = result.rows[0];
    
    // Don't expose sensitive data
    res.json({
      isClientSite: true,
      companyName: tenant.company_name,
      logoUrl: tenant.logo_url,
      primaryColor: tenant.primary_color,
      secondaryColor: tenant.secondary_color,
      contactEmail: tenant.contact_email,
      contactPhone: tenant.contact_phone,
      contactLocation: tenant.contact_location,
      instagramUrl: tenant.instagram_url,
      showDestination: false,
      searchButtonText: 'Buscar disponibilidad',
      paymentCurrency: tenant.payment_currency,
      stripeEnabled: tenant.stripe_enabled,
      paypalEnabled: tenant.paypal_enabled,
      webpayEnabled: tenant.webpay_enabled,
      status: tenant.status
    });
  } catch (error) {
    console.error('Get tenant config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SUPER ADMIN ROUTES ====================

// Get all tenants (Super Admin only)
app.get('/api/admin/tenants', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, u.first_name as approved_by_name
       FROM tenants t
       LEFT JOIN users u ON t.approved_by = u.id
       ORDER BY t.created_at DESC`
    );
    
    res.json(result.rows.map(t => ({
      id: t.id,
      companyName: t.company_name,
      domain: t.domain,
      customDomain: t.custom_domain,
      adminEmail: t.admin_email,
      status: t.status,
      paymentStatus: t.payment_status,
      plan: t.plan,
      billingCycle: t.billing_cycle,
      monthlyPrice: t.monthly_price,
      maxProperties: t.max_properties,
      createdAt: t.created_at,
      activatedAt: t.activated_at,
      nextPaymentDate: t.next_payment_date,
      notes: t.notes,
      approvedBy: t.approved_by_name,
      approvedAt: t.approved_at
    })));
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new tenant (from landing page)
app.post('/api/admin/tenants', async (req, res) => {
  try {
    const {
      companyName,
      domain,
      adminEmail,
      plan = 'starter',
      billingCycle = 'monthly'
    } = req.body;
    
    // Check if domain exists
    const existing = await query(
      'SELECT * FROM tenants WHERE domain = $1 OR custom_domain = $1',
      [domain]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Domain already registered' });
    }
    
    // Set price based on plan
    const prices = {
      starter: { monthly: 49, annual: 470 },
      professional: { monthly: 79, annual: 758 },
      enterprise: { monthly: 149, annual: 1430 }
    };
    
    const price = prices[plan][billingCycle];
    const maxProps = { starter: 5, professional: 15, enterprise: 999 };
    
    const result = await query(
      `INSERT INTO tenants (
        company_name, domain, admin_email, status, payment_status,
        plan, billing_cycle, monthly_price, max_properties
      ) VALUES ($1, $2, $3, 'pending', 'pending', $4, $5, $6, $7)
      RETURNING *`,
      [companyName, domain, adminEmail, plan, billingCycle, price, maxProps[plan]]
    );
    
    const tenant = result.rows[0];
    
    // TODO: Send email notification to admin
    
    res.status(201).json({
      id: tenant.id,
      companyName: tenant.company_name,
      domain: tenant.domain,
      status: tenant.status,
      message: 'Tenant created successfully. Awaiting payment approval.'
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve tenant payment (Super Admin)
app.put('/api/admin/tenants/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const result = await query(
      `UPDATE tenants 
       SET status = 'active', 
           payment_status = 'paid',
           activated_at = CURRENT_TIMESTAMP,
           next_payment_date = CURRENT_TIMESTAMP + INTERVAL '1 month',
           approved_by = $1,
           approved_at = CURRENT_TIMESTAMP,
           notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [req.user.id, notes, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Create subscription record
    await query(
      `INSERT INTO subscriptions (tenant_id, amount, currency, billing_cycle, payment_method, status, approved_by, approved_at, description)
       VALUES ($1, $2, 'USD', $3, 'other', 'completed', $4, CURRENT_TIMESTAMP, $5)`,
      [req.params.id, result.rows[0].monthly_price, result.rows[0].billing_cycle, req.user.id, notes || 'Manual approval']
    );
    
    // TODO: Send welcome email to tenant
    
    res.json({
      message: 'Tenant approved successfully',
      tenant: {
        id: result.rows[0].id,
        companyName: result.rows[0].company_name,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Approve tenant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Suspend tenant (Super Admin)
app.put('/api/admin/tenants/:id/suspend', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const result = await query(
      `UPDATE tenants 
       SET status = 'suspended',
           notes = COALESCE(notes || '\n' || $1, $1)
       WHERE id = $2
       RETURNING *`,
      [`Suspended: ${reason}`, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({ message: 'Tenant suspended successfully' });
  } catch (error) {
    console.error('Suspend tenant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending payments (Super Admin dashboard)
app.get('/api/admin/payments/pending', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.company_name, t.domain, t.admin_email, t.monthly_price, 
              t.billing_cycle, t.plan, t.created_at, t.notes
       FROM tenants t
       WHERE t.status = 'pending' OR t.payment_status = 'pending'
       ORDER BY t.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin dashboard stats (Super Admin)
app.get('/api/admin/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants WHERE status = 'active') as active_tenants,
        (SELECT COUNT(*) FROM tenants WHERE status = 'pending') as pending_tenants,
        (SELECT COUNT(*) FROM tenants WHERE status = 'suspended') as suspended_tenants,
        (SELECT COALESCE(SUM(monthly_price), 0) FROM tenants WHERE status = 'active' AND billing_cycle = 'monthly') as monthly_revenue,
        (SELECT COALESCE(SUM(monthly_price), 0) FROM tenants WHERE status = 'active' AND billing_cycle = 'annual') as annual_revenue,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'completed' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) as payments_this_month
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all templates (Super Admin)
app.get('/api/admin/templates', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM templates WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Lifty Life Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔒 Security: Rate limiting enabled`);
  console.log(`💳 Stripe: ${stripe ? 'Configured' : 'Not configured'}`);
  console.log(`💰 PayPal: ${paypalClient ? 'Configured' : 'Not configured'}`);
  console.log(`🇨🇱 WebPay: ${webpayConfigured ? 'Configured' : 'Not configured'}`);
});

module.exports = app;
