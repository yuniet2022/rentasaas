export type UserRole = 'admin' | 'cleaner' | 'client' | 'owner';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cleaner {
  id: string;
  userId: string;
  assignedProperties: string[];
  schedule: CleanerSchedule[];
  isActive: boolean;
}

export interface CleanerSchedule {
  propertyId: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Booking {
  id: string;
  propertyId: string | number;
  clientId: string | number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  source: 'direct' | 'booking' | 'airbnb' | 'vrbo';
  externalId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  category: string;
  rating: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  isActive: boolean;
  ownerId?: number;
  assignedCleaners?: string[];
  bookingIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  upcomingCheckIns: number;
  upcomingCheckOuts: number;
  pendingCleanings: number;
}

export interface BookingComReservation {
  id: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  currency: string;
  status: string;
  bookedDate: string;
}

export interface Expense {
  id: string;
  propertyId: string;
  category: 'cleaning' | 'maintenance' | 'supplies' | 'utilities' | 'other';
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface OwnerStats {
  totalProperties: number;
  totalBookedDays: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
  occupancyRate: number;
}

export interface Supply {
  id: string;
  propertyId: string | number;
  propertyTitle?: string;
  propertyLocation?: string;
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
  createdAt: string;
  updatedAt?: string;
}
