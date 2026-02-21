import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Mountain,
  ExternalLink,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { navigateTo } from '@/navigation';
import { toast } from 'sonner';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Propiedades', href: '/dashboard/properties' },
  { icon: Calendar, label: 'Reservas', href: '/dashboard/bookings' },
  { icon: ExternalLink, label: 'Booking.com', href: '/dashboard/booking-com' },
  { icon: Users, label: 'Clientes', href: '/dashboard/clients' },
  { icon: Sparkles, label: 'Limpieza', href: '/dashboard/cleaning' },
  { icon: Package, label: 'Insumos', href: '/dashboard/supplies' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
];

const cleanerNavItems = [
  { icon: LayoutDashboard, label: 'Mi Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Mi Horario', href: '/dashboard/schedule' },
  { icon: Home, label: 'Mis Propiedades', href: '/dashboard/my-properties' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
];

const clientNavItems = [
  { icon: LayoutDashboard, label: 'Mi Cuenta', href: '/dashboard' },
  { icon: Calendar, label: 'Mis Reservas', href: '/dashboard/my-bookings' },
  { icon: Heart, label: 'Favoritos', href: '/dashboard/favorites' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
];

const ownerNavItems = [
  { icon: LayoutDashboard, label: 'Mi Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Mis Propiedades', href: '/dashboard/my-properties' },
  { icon: DollarSign, label: 'Ingresos', href: '/dashboard/income' },
  { icon: Package, label: 'Gastos', href: '/dashboard/expenses' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
];

import { Heart, DollarSign } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigateTo('/login');
  };

  const getNavItems = () => {
    if (hasRole('admin')) return adminNavItems;
    if (hasRole('cleaner')) return cleanerNavItems;
    if (hasRole('owner')) return ownerNavItems;
    return clientNavItems;
  };

  const navItems = getNavItems();

  const getPageTitle = () => {
    const path = window.location.pathname;
    const item = navItems.find(item => path.includes(item.href) && item.href !== '/dashboard');
    return item?.label || 'Dashboard';
  };

  const isActiveRoute = (href: string) => {
    const currentPath = window.location.pathname;
    if (href === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/';
    }
    return currentPath.includes(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <button onClick={() => navigateTo('/')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-lg">
                LIFTY<span className="text-teal-400">LIFE</span>
              </span>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                navigateTo(item.href);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                isActiveRoute(item.href)
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}
              alt={user?.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${
              !isSidebarOpen && 'justify-center w-full'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => navigateTo('/')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-teal-600 bg-gray-100 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver sitio
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
