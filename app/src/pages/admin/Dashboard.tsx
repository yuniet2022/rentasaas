import { useEffect, useState } from 'react';
import {
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { navigateTo } from '@/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const statsCards = [
  { key: 'totalProperties', label: 'Propiedades', icon: Home, color: 'bg-blue-500' },
  { key: 'totalBookings', label: 'Reservas', icon: Calendar, color: 'bg-green-500' },
  { key: 'totalRevenue', label: 'Ingresos', icon: DollarSign, color: 'bg-yellow-500', format: 'currency' },
  { key: 'occupancyRate', label: 'Ocupación', icon: TrendingUp, color: 'bg-purple-500', format: 'percent' },
];

const recentActivity = [
  { type: 'booking', message: 'Nueva reserva en El Après Studio', time: 'Hace 5 minutos', icon: Calendar },
  { type: 'checkin', message: 'Check-in: María González', time: 'Hace 2 horas', icon: Users },
  { type: 'cleaning', message: 'Limpieza completada: Bahía Tormenta', time: 'Hace 3 horas', icon: Sparkles },
  { type: 'booking', message: 'Reserva cancelada: Harrison Lake', time: 'Hace 5 horas', icon: Calendar },
];

export default function AdminDashboard() {
  const { hasRole } = useAuth();
  const { stats, bookings, properties } = useData();
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (!hasRole('admin')) {
      navigateTo('/dashboard');
    }
  }, [hasRole]);

  useEffect(() => {
    // Generate monthly revenue data
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const data = months.map((month) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      bookings: Math.floor(Math.random() * 50) + 20,
    }));
    setRevenueData(data);
  }, []);

  const formatValue = (value: number, format?: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('es-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (format === 'percent') {
      return `${value}%`;
    }
    return value.toString();
  };

  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
        <p className="text-gray-500">Aquí está el resumen de tu negocio hoy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const value = stats[card.key as keyof typeof stats] || 0;
          return (
            <Card key={card.key} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatValue(value, card.format)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">+12%</span>
                  <span className="text-gray-400">vs mes pasado</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingresos Mensuales</CardTitle>
            <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => navigateTo('/dashboard/bookings')}>
              Ver detalles <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ingresos']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reservas por Mes</CardTitle>
            <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => navigateTo('/dashboard/bookings')}>
              Ver detalles <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    formatter={(v: number) => [v, 'Reservas']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#0891b2"
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximas Reservas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigateTo('/dashboard/bookings')}>
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => {
                  const property = properties.find(p => p.id === booking.propertyId);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigateTo('/dashboard/bookings')}
                    >
                      <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{property?.title}</p>
                        <p className="text-sm text-gray-500">
                          {booking.guestName} • {booking.guests} huéspedes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${booking.totalPrice}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No hay reservas próximas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <activity.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Nueva Propiedad', href: '/dashboard/properties/new', color: 'bg-blue-500' },
          { label: 'Ver Calendario', href: '/dashboard/bookings', color: 'bg-green-500' },
          { label: 'Importar Booking', href: '/dashboard/booking-com', color: 'bg-yellow-500' },
          { label: 'Asignar Limpieza', href: '/dashboard/cleaning', color: 'bg-purple-500' },
        ].map((action) => (
          <Button
            key={action.label}
            onClick={() => navigateTo(action.href)}
            className={`${action.color} hover:opacity-90 text-white h-auto py-4`}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
