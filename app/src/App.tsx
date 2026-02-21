import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';

// Public Pages
import HomePage from '@/pages/HomePage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Checkout from '@/pages/Checkout';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import PropertiesManagement from '@/pages/admin/Properties';
import PropertyForm from '@/pages/admin/PropertyForm';
import BookingsManagement from '@/pages/admin/Bookings';
import BookingComIntegration from '@/pages/admin/BookingCom';
import CleaningManagement from '@/pages/admin/Cleaning';
import SuppliesManagement from '@/pages/admin/Supplies';
import SettingsManagement from '@/pages/admin/Settings';
import SuperAdmin from '@/pages/admin/SuperAdmin';

// Cleaner Pages
import CleanerDashboard from '@/pages/cleaner/CleanerDashboard';

// Client Pages
import ClientDashboard from '@/pages/client/ClientDashboard';

// Owner Pages
import OwnerDashboard from '@/pages/owner/OwnerDashboard';

// Simple router using window.location
function getRoute() {
  const path = window.location.pathname;
  
  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  if (path === '/checkout') return 'checkout';
  if (path === '/super-admin') return 'super-admin';
  if (path.startsWith('/dashboard')) return 'dashboard';
  return 'home';
}

function getDashboardRoute() {
  const path = window.location.pathname;
  if (path.includes('/properties/new')) return 'properties-new';
  if (path.includes('/properties/') && path.includes('/edit')) return 'properties-edit';
  if (path.includes('/properties')) return 'properties';
  if (path.includes('/bookings')) return 'bookings';
  if (path.includes('/booking-com')) return 'booking-com';
  if (path.includes('/cleaning')) return 'cleaning';
  if (path.includes('/supplies')) return 'supplies';
  if (path.includes('/clients')) return 'clients';
  if (path.includes('/settings')) return 'settings';
  if (path.includes('/schedule')) return 'schedule';
  if (path.includes('/my-properties')) return 'my-properties';
  if (path.includes('/my-bookings')) return 'my-bookings';
  if (path.includes('/favorites')) return 'favorites';
  if (path.includes('/expenses')) return 'expenses';
  if (path.includes('/income')) return 'income';
  return 'index';
}

// Navigation helper
export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [route, setRoute] = useState(getRoute());
  const [dashboardRoute, setDashboardRoute] = useState(getDashboardRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRoute());
      setDashboardRoute(getDashboardRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Protected route check
  if (route === 'dashboard' && !isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (route === 'login' && isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  // Render public pages
  if (route === 'home') return <HomePage />;
  if (route === 'login') return <Login />;
  if (route === 'register') return <Register />;
  if (route === 'checkout') return <Checkout />;
  if (route === 'super-admin') return <SuperAdmin />;

  // Render dashboard
  if (route === 'dashboard') {
    const renderDashboardContent = () => {
      // Check role permissions
      const isAdmin = user?.role === 'admin';
      const isCleaner = user?.role === 'cleaner';
      const isClient = user?.role === 'client';
      const isOwner = user?.role === 'owner';

      switch (dashboardRoute) {
        case 'properties':
          return isAdmin ? <PropertiesManagement /> : <AdminDashboard />;
        case 'properties-new':
          return isAdmin ? <PropertyForm /> : <AdminDashboard />;
        case 'properties-edit':
          return isAdmin ? <PropertyForm /> : <AdminDashboard />;
        case 'bookings':
          return isAdmin ? <BookingsManagement /> : <AdminDashboard />;
        case 'booking-com':
          return isAdmin ? <BookingComIntegration /> : <AdminDashboard />;
        case 'cleaning':
          return isAdmin ? <CleaningManagement /> : <AdminDashboard />;
        case 'supplies':
          return isAdmin ? <SuppliesManagement /> : <AdminDashboard />;
        case 'clients':
          return isAdmin ? (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
              <p className="text-gray-500 mt-2">Gestión de clientes - Próximamente</p>
            </div>
          ) : (
            <AdminDashboard />
          );
        case 'settings':
          return isAdmin ? <SettingsManagement /> : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
              <p className="text-gray-500 mt-2">Configuración de cuenta - Próximamente</p>
            </div>
          );
        case 'schedule':
          return (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Mi Horario</h2>
              <p className="text-gray-500 mt-2">Calendario de limpiezas - Próximamente</p>
            </div>
          );
        case 'my-properties':
          return (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Mis Propiedades</h2>
              <p className="text-gray-500 mt-2">Propiedades asignadas - Próximamente</p>
            </div>
          );
        case 'my-bookings':
          return (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>
              <p className="text-gray-500 mt-2">Historial de reservas - Próximamente</p>
            </div>
          );
        case 'favorites':
          return (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Favoritos</h2>
              <p className="text-gray-500 mt-2">Propiedades favoritas - Próximamente</p>
            </div>
          );
        default:
          // Default dashboard based on role
          if (isAdmin) return <AdminDashboard />;
          if (isCleaner) return <CleanerDashboard />;
          if (isClient) return <ClientDashboard />;
          if (isOwner) return <OwnerDashboard />;
          return <AdminDashboard />;
      }
    };

    return (
      <AdminLayout>
        {renderDashboardContent()}
      </AdminLayout>
    );
  }

  return <HomePage />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Toaster position="top-center" richColors />
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
