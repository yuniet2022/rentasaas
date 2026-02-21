-- Lifty Life Database Schema

-- Drop tables if exist
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS supplies CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
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

-- Properties table
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

-- Supplies table (insumos por alojamiento)
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
    frequency VARCHAR(50), -- semanal, mensual, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
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

-- Expenses table (gastos reales)
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

-- Cleaner assignments table
CREATE TABLE cleaner_assignments (
    id SERIAL PRIMARY KEY,
    cleaner_id INTEGER REFERENCES users(id),
    property_id INTEGER REFERENCES properties(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (configuración del sistema - API keys, etc.)
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(50) NOT NULL, -- 'payment', 'integration', 'general'
    is_encrypted BOOLEAN DEFAULT false,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Payments table (registro de todos los pagos)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CAD',
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal', 'cash', 'transfer')),
    provider_transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_method VARCHAR(50), -- 'card', 'paypal_balance', etc.
    payment_details JSONB, -- datos seguros encriptados o tokenizados
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
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

-- Insert default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, phone, role, avatar)
VALUES (
    'Administrador',
    'LiftyLife',
    'admin@liftylife.com',
    '$2a$10$YourHashedPasswordHere', -- Will be updated
    '+1 (604) 123-4567',
    'admin',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
);

-- Insert sample owner (password: owner123)
INSERT INTO users (first_name, last_name, email, password, phone, role, avatar)
VALUES (
    'Roberto',
    'Fernández',
    'owner@liftylife.com',
    '$2a$10$YourHashedPasswordHere',
    '+1 (604) 456-7890',
    'owner',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'
);

-- Insert sample properties
INSERT INTO properties (title, description, location, address, category, guests, bedrooms, bathrooms, price_per_night, images, amenities, featured, owner_id)
VALUES (
    'El Après | Estudio Village con bañera de hidromasaje',
    'Hermoso estudio en el corazón de Whistler Village con vistas a las montañas.',
    'Whistler',
    '123 Village St, Whistler, BC',
    'Vida de Montaña',
    4, 1, 1, 189,
    ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
    ARRAY['hot-tub', 'kitchen', 'pets', 'wifi'],
    true,
    2
);

INSERT INTO properties (title, description, location, address, category, guests, bedrooms, bathrooms, price_per_night, images, amenities, featured, owner_id)
VALUES (
    'Harrison en el lago | Casa junto a la playa',
    'Casa familiar a pasos del lago Harrison con acceso privado a la playa.',
    'Harrison & Cascadas',
    '456 Lakeview Dr, Harrison Hot Springs, BC',
    'Vida Junto al Lago',
    4, 1, 1, 145,
    ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'],
    ARRAY['kitchen', 'ac', 'washer', 'wifi'],
    true,
    2
);

-- Insert sample supplies
INSERT INTO supplies (property_id, name, category, description, unit_cost, quantity, unit, supplier, is_recurring, frequency)
VALUES 
(1, 'Toallas de baño', 'Limpieza', 'Juego de toallas premium', 25.00, 10, 'unidad', 'Costco', true, 'mensual'),
(1, 'Sábanas king size', 'Limpieza', 'Sábanas de algodón egipcio', 45.00, 4, 'juego', 'Amazon', true, 'trimestral'),
(1, 'Jabón líquido', 'Amenities', 'Jabón para manos y cuerpo', 8.50, 12, 'botella', 'Walmart', true, 'mensual'),
(1, 'Papel higiénico', 'Amenities', 'Papel higiénico premium', 15.00, 24, 'rollo', 'Costco', true, 'mensual'),
(1, 'Detergente', 'Limpieza', 'Detergente para lavadora', 18.00, 6, 'botella', 'Superstore', true, 'mensual'),
(2, 'Toallas de playa', 'Limpieza', 'Toallas grandes para playa', 20.00, 8, 'unidad', 'Costco', true, 'trimestral'),
(2, 'Champú y acondicionador', 'Amenities', 'Set de amenities para baño', 12.00, 20, 'set', 'Amazon', true, 'mensual');

-- Default settings
INSERT INTO settings (key, value, category, description) VALUES
('stripe_enabled', 'false', 'payment', 'Habilitar pagos con Stripe'),
('stripe_publishable_key', '', 'payment', 'Stripe Publishable Key (pública)'),
('stripe_secret_key', '', 'payment', 'Stripe Secret Key (encriptar)'),
('stripe_webhook_secret', '', 'payment', 'Stripe Webhook Secret (encriptar)'),
('paypal_enabled', 'false', 'payment', 'Habilitar pagos con PayPal'),
('paypal_client_id', '', 'payment', 'PayPal Client ID (pública)'),
('paypal_client_secret', '', 'payment', 'PayPal Client Secret (encriptar)'),
('paypal_mode', 'sandbox', 'payment', 'PayPal mode: sandbox o live'),
('webpay_enabled', 'false', 'payment', 'Habilitar pagos con WebPay (Chile)'),
('webpay_commerce_code', '', 'payment', 'WebPay Código de Comercio'),
('webpay_api_key', '', 'payment', 'WebPay API Key (encriptar)'),
('webpay_environment', 'integration', 'payment', 'WebPay environment: integration, test, production'),
('booking_com_enabled', 'false', 'integration', 'Habilitar integración con Booking.com'),
('booking_com_api_key', '', 'integration', 'Booking.com API Key (encriptar)'),
('booking_com_property_id', '', 'integration', 'Booking.com Property ID'),
('airbnb_enabled', 'false', 'integration', 'Habilitar integración con Airbnb (via Zapier/Make)'),
('airbnb_webhook_url', '', 'integration', 'URL webhook para recibir reservas de Airbnb'),
('security_rate_limit_enabled', 'true', 'security', 'Habilitar rate limiting'),
('security_max_requests_per_minute', '60', 'security', 'Máximo de requests por minuto por IP'),
('payment_currency', 'CAD', 'payment', 'Moneda por defecto'),
('payment_tax_rate', '12', 'payment', 'Porcentaje de impuestos (GST/PST)');

-- ============================================
-- SAAS MULTI-TENANT TABLES
-- ============================================

-- Templates table (plantillas disponibles)
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    default_primary_color VARCHAR(7) DEFAULT '#0D9488',
    default_secondary_color VARCHAR(7) DEFAULT '#14B8A6',
    default_font VARCHAR(50) DEFAULT 'Inter',
    custom_css TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants table (clientes del SaaS)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    admin_email VARCHAR(255) NOT NULL,
    admin_password_hash VARCHAR(255),
    
    -- Estado del tenant
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Configuración visual
    template_id INTEGER REFERENCES templates(id),
    primary_color VARCHAR(7) DEFAULT '#0D9488',
    secondary_color VARCHAR(7) DEFAULT '#14B8A6',
    logo_url TEXT,
    favicon_url TEXT,
    
    -- Información de contacto
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_location VARCHAR(255),
    instagram_url TEXT,
    facebook_url TEXT,
    
    -- Configuración de pagos (de sus clientes)
    payment_currency VARCHAR(3) DEFAULT 'USD',
    stripe_enabled BOOLEAN DEFAULT false,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    paypal_enabled BOOLEAN DEFAULT false,
    paypal_client_id TEXT,
    paypal_client_secret TEXT,
    webpay_enabled BOOLEAN DEFAULT false,
    webpay_commerce_code TEXT,
    webpay_api_key TEXT,
    
    -- Plan y límites
    plan VARCHAR(20) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    max_properties INTEGER DEFAULT 5,
    monthly_price DECIMAL(10,2) DEFAULT 49.00,
    annual_discount_percent INTEGER DEFAULT 20,
    
    -- Fechas importantes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP,
    next_payment_date TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    
    -- Para gestión interna
    notes TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Subscriptions table (pagos de los clientes del SaaS)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Detalles del pago
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    
    -- Método de pago
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('stripe', 'zelle', 'wire_transfer', 'other')),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Referencias
    stripe_payment_intent_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    external_reference VARCHAR(255), -- "Zelle from juan@gmail.com"
    
    -- Aprobación manual
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default templates
INSERT INTO templates (name, description, preview_image_url, default_primary_color, default_secondary_color) VALUES
('Modern', 'Diseño minimalista y limpio, ideal para propiedades de lujo', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80', '#0D9488', '#14B8A6'),
('Cozy', 'Estilo cálido con colores tierra, perfecto para cabañas y montaña', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&q=80', '#D97706', '#B45309'),
('Beach', 'Colores frescos y azules, ideal para propiedades en playa', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', '#0EA5E9', '#0284C7'),
('Urban', 'Diseño oscuro y elegante para apartamentos urbanos', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80', '#1F2937', '#111827');

-- Insert sample tenant (Rylax - Chile)
INSERT INTO tenants (
    company_name, domain, custom_domain, admin_email, status, payment_status,
    template_id, primary_color, secondary_color,
    contact_email, contact_phone, contact_location, instagram_url,
    payment_currency, webpay_enabled, plan, billing_cycle, monthly_price, max_properties
) VALUES (
    'RYLAX',
    'rylax.localhost',
    'rylax.com',
    'rylax@gmail.com',
    'active',
    'paid',
    1,
    '#E74C3C',
    '#C0392B',
    'rylax@gmail.com',
    '+56956284785',
    'Santiago de Chile, Chile',
    'https://www.instagram.com/rylax_ch',
    'CLP',
    true,
    'professional',
    'monthly',
    79.00,
    15
);

-- Indexes for tenant tables
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
