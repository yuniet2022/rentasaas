import { useEffect } from 'react';
import {
  Calendar,
  Home,
  Heart,
  User,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { navigateTo } from '@/navigation';

export default function ClientDashboard() {
  const { user, hasRole } = useAuth();
  const { bookings, properties } = useData();

  useEffect(() => {
    if (!hasRole('client')) {
      navigateTo('/dashboard');
    }
  }, [hasRole]);

  const myBookings = bookings.filter((b) => b.clientId === user?.id || b.guestEmail === user?.email);
  const upcomingBookings = myBookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.checkIn) >= new Date()
  );
  const pastBookings = myBookings.filter(
    (b) => b.status === 'completed' || new Date(b.checkOut) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido, {user?.firstName}!</h1>
        <p className="text-gray-500">Gestiona tus reservas y favoritos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myBookings.length}</p>
                <p className="text-xs text-gray-500">Total Reservas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                <p className="text-xs text-gray-500">Próximas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pastBookings.length}</p>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">Favoritos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Estadías</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('/dashboard/my-bookings')}
            >
              Ver todas
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 3).map((booking) => {
                const property = properties.find((p) => p.id === booking.propertyId);
                return (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={property?.images[0]}
                      alt={property?.title}
                      className="w-full sm:w-32 h-32 sm:h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{property?.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property?.location}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.checkIn).toLocaleDateString('es-ES')} -{' '}
                          {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {booking.guests} huéspedes
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">${booking.totalPrice}</p>
                      <Badge className="bg-green-500">Confirmada</Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No tienes reservas próximas</p>
                <Button
                  onClick={() => navigateTo('/')}
                  className="mt-4 bg-teal-600 hover:bg-teal-700"
                >
                  Explorar Propiedades
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          onClick={() => navigateTo('/dashboard/my-bookings')}
          className="h-auto py-4 bg-teal-600 hover:bg-teal-700"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Mis Reservas
        </Button>
        <Button
          onClick={() => navigateTo('/dashboard/favorites')}
          variant="outline"
          className="h-auto py-4"
        >
          <Heart className="w-5 h-5 mr-2" />
          Favoritos
        </Button>
        <Button
          onClick={() => navigateTo('/dashboard/settings')}
          variant="outline"
          className="h-auto py-4"
        >
          <User className="w-5 h-5 mr-2" />
          Mi Perfil
        </Button>
        <Button
          onClick={() => navigateTo('/')}
          variant="outline"
          className="h-auto py-4"
        >
          <Home className="w-5 h-5 mr-2" />
          Explorar
        </Button>
      </div>
    </div>
  );
}
