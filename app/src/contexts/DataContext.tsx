import React, { createContext, useContext, useState, useEffect } from 'react';
import { propertiesAPI, suppliesAPI, bookingsAPI, statsAPI } from '@/services/api';
import type { Property, Booking, Supply, DashboardStats, OwnerStats } from '@/types/user';

interface DataContextType {
  properties: Property[];
  bookings: Booking[];
  supplies: Supply[];
  stats: DashboardStats;
  isLoading: boolean;
  // Properties
  fetchProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  // Supplies (Insumos)
  fetchSupplies: () => Promise<void>;
  fetchSuppliesByProperty: (propertyId: string) => Promise<Supply[]>;
  addSupply: (supply: Omit<Supply, 'id' | 'createdAt'>) => Promise<void>;
  updateSupply: (id: string, supply: Partial<Supply>) => Promise<void>;
  deleteSupply: (id: string) => Promise<void>;
  // Bookings
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  // Stats
  fetchStats: () => Promise<void>;
  fetchOwnerStats: (ownerId?: string) => Promise<OwnerStats>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultStats: DashboardStats = {
  totalProperties: 0,
  totalBookings: 0,
  totalRevenue: 0,
  occupancyRate: 0,
  upcomingCheckIns: 0,
  upcomingCheckOuts: 0,
  pendingCleanings: 0,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchProperties();
    fetchBookings();
    fetchSupplies();
    fetchStats();
  }, []);

  // ==================== PROPERTIES ====================

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProperty = async (property: Omit<Property, 'id' | 'createdAt'>) => {
    try {
      const newProperty = await propertiesAPI.create(property);
      setProperties(prev => [...prev, newProperty]);
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const updated = await propertiesAPI.update(id, updates);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertiesAPI.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  // ==================== SUPPLIES (INSUMOS) ====================

  const fetchSupplies = async () => {
    try {
      const data = await suppliesAPI.getAll();
      setSupplies(data);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    }
  };

  const fetchSuppliesByProperty = async (propertyId: string): Promise<Supply[]> => {
    try {
      return await suppliesAPI.getByProperty(propertyId);
    } catch (error) {
      console.error('Error fetching property supplies:', error);
      return [];
    }
  };

  const addSupply = async (supply: Omit<Supply, 'id' | 'createdAt'>) => {
    try {
      const supplyData = {
        ...supply,
        propertyId: typeof supply.propertyId === 'string' ? parseInt(supply.propertyId) || 0 : supply.propertyId
      };
      const newSupply = await suppliesAPI.create(supplyData);
      setSupplies(prev => [...prev, newSupply]);
    } catch (error) {
      console.error('Error adding supply:', error);
      throw error;
    }
  };

  const updateSupply = async (id: string, updates: Partial<Supply>) => {
    try {
      const updatesData = updates.propertyId !== undefined ? {
        ...updates,
        propertyId: typeof updates.propertyId === 'string' ? parseInt(updates.propertyId) || 0 : updates.propertyId
      } : updates;
      const updated = await suppliesAPI.update(id, updatesData);
      setSupplies(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    } catch (error) {
      console.error('Error updating supply:', error);
      throw error;
    }
  };

  const deleteSupply = async (id: string) => {
    try {
      await suppliesAPI.delete(id);
      setSupplies(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting supply:', error);
      throw error;
    }
  };

  // ==================== BOOKINGS ====================

  const fetchBookings = async () => {
    try {
      const data = await bookingsAPI.getAll();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      const newBooking = await bookingsAPI.create(booking);
      setBookings(prev => [...prev, newBooking]);
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  };

  // ==================== STATS ====================

  const fetchStats = async () => {
    try {
      const data = await statsAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOwnerStats = async (ownerId?: string): Promise<OwnerStats> => {
    try {
      return await statsAPI.getOwnerStats(ownerId);
    } catch (error) {
      console.error('Error fetching owner stats:', error);
      return {
        totalProperties: 0,
        totalBookedDays: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        netIncome: 0,
        occupancyRate: 0,
      };
    }
  };

  return (
    <DataContext.Provider value={{
      properties,
      bookings,
      supplies,
      stats,
      isLoading,
      fetchProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      fetchSupplies,
      fetchSuppliesByProperty,
      addSupply,
      updateSupply,
      deleteSupply,
      fetchBookings,
      addBooking,
      fetchStats,
      fetchOwnerStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
