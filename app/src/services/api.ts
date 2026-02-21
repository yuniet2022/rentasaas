// API Service for Lifty Life Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('liftylife_token');

// Helper for API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH API ====================

export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== USERS API ====================

export const usersAPI = {
  getAll: () => fetchAPI('/users'),
  
  getById: (id: string) => fetchAPI(`/users/${id}`),
  
  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'owner' | 'cleaner';
  }) =>
    fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
  }>) =>
    fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== PROPERTIES API ====================

export const propertiesAPI = {
  getAll: () => fetchAPI('/properties'),
  
  getById: (id: string) => fetchAPI(`/properties/${id}`),
  
  create: (data: {
    title: string;
    description: string;
    location: string;
    address: string;
    category: string;
    guests: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    images: string[];
    amenities: string[];
    featured: boolean;
    ownerId?: number;
  }) =>
    fetchAPI('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<{
    title: string;
    description: string;
    location: string;
    address: string;
    category: string;
    guests: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    images: string[];
    amenities: string[];
    featured: boolean;
    isActive: boolean;
    ownerId: number;
  }>) =>
    fetchAPI(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI(`/properties/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== SUPPLIES API (Insumos) ====================

export const suppliesAPI = {
  getAll: () => fetchAPI('/supplies'),
  
  getByProperty: (propertyId: string) =>
    fetchAPI(`/properties/${propertyId}/supplies`),
  
  create: (data: {
    propertyId: number | string;
    name: string;
    category: string;
    description?: string;
    unitCost: number;
    quantity: number;
    unit: string;
    supplier?: string;
    purchaseDate?: string;
    isRecurring: boolean;
    frequency?: string;
  }) =>
    fetchAPI('/supplies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<{
    propertyId: number | string;
    name: string;
    category: string;
    description: string;
    unitCost: number;
    quantity: number;
    unit: string;
    supplier: string;
    purchaseDate: string;
    isRecurring: boolean;
    frequency: string;
  }>) =>
    fetchAPI(`/supplies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI(`/supplies/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== BOOKINGS API ====================

export const bookingsAPI = {
  getAll: () => fetchAPI('/bookings'),
  
  create: (data: {
    propertyId: number | string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    specialRequests?: string;
  }) =>
    fetchAPI('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== STATS API ====================

export const statsAPI = {
  getDashboard: () => fetchAPI('/stats'),
  
  getOwnerStats: (ownerId?: string) =>
    fetchAPI(`/owner/stats${ownerId ? `?ownerId=${ownerId}` : ''}`),
};

// ==================== SETTINGS API ====================

export const settingsAPI = {
  getAll: () => fetchAPI('/settings'),
  
  getByCategory: (category: string) => fetchAPI(`/settings/${category}`),
  
  update: (key: string, value: string, isEncrypted: boolean) =>
    fetchAPI(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, isEncrypted }),
    }),
};

// ==================== PAYMENTS API ====================

export const paymentsAPI = {
  // Stripe
  createStripeIntent: (data: {
    bookingId: number;
    amount: number;
    currency?: string;
  }) =>
    fetchAPI('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // PayPal
  createPayPalOrder: (data: {
    bookingId: number;
    amount: number;
    currency?: string;
  }) =>
    fetchAPI('/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  capturePayPalOrder: (orderId: string) =>
    fetchAPI('/payments/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
  
  // Get payments for booking
  getByBooking: (bookingId: string) =>
    fetchAPI(`/bookings/${bookingId}/payments`),
  
  // WebPay (Chile)
  createWebPayTransaction: (data: {
    bookingId: number;
    amount: number;
    returnUrl: string;
  }) =>
    fetchAPI('/payments/webpay/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  confirmWebPayTransaction: (token: string) =>
    fetchAPI('/payments/webpay/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  
  getWebPayStatus: (token: string) =>
    fetchAPI(`/payments/webpay/status/${token}`),
};

// ==================== CALENDAR API ====================

export const calendarAPI = {
  getBookings: (month?: number, year?: number) => {
    const params = month && year ? `?month=${month}&year=${year}` : '';
    return fetchAPI(`/calendar${params}`);
  },
};

// ==================== CONFIG API (Public) ====================

export const configAPI = {
  getPaymentConfig: () => fetchAPI('/config/payments'),
};

// ==================== TENANT API (Public) ====================

export const tenantAPI = {
  getConfig: () => fetchAPI('/tenant/config'),
};

// ==================== SUPER ADMIN API ====================

export const superAdminAPI = {
  // Tenants
  getTenants: () => fetchAPI('/admin/tenants'),
  
  createTenant: (data: {
    companyName: string;
    domain: string;
    adminEmail: string;
    plan?: string;
    billingCycle?: string;
  }) =>
    fetchAPI('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  approveTenant: (id: number, notes?: string) =>
    fetchAPI(`/admin/tenants/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),
  
  suspendTenant: (id: number, reason: string) =>
    fetchAPI(`/admin/tenants/${id}/suspend`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
  
  // Stats
  getStats: () => fetchAPI('/admin/stats'),
  
  // Pending payments
  getPendingPayments: () => fetchAPI('/admin/payments/pending'),
  
  // Templates
  getTemplates: () => fetchAPI('/admin/templates'),
};
