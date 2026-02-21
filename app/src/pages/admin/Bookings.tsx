import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { Calendar } from '@/components/ui/calendar';

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  completed: 'bg-blue-500',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const sourceLabels: Record<string, string> = {
  direct: 'Directa',
  booking: 'Booking.com',
  airbnb: 'Airbnb',
  vrbo: 'VRBO',
};

export default function BookingsManagement() {
  const { bookings, properties } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && booking.status === statusFilter;
  });

  // Get bookings for selected date
  const bookingsForDate = selectedDate
    ? bookings.filter((b) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const selected = new Date(selectedDate);
        return selected >= checkIn && selected <= checkOut;
      })
    : [];

  // Get dates with bookings for calendar highlighting
  const bookedDates = bookings
    .filter((b) => b.status === 'confirmed')
    .flatMap((b) => {
      const dates = [];
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    });

  const exportBookings = () => {
    const csv = [
      ['ID', 'Propiedad', 'Huésped', 'Email', 'Check-in', 'Check-out', 'Huéspedes', 'Total', 'Estado', 'Fuente'].join(','),
      ...filteredBookings.map((b) => {
        const property = properties.find((p) => p.id === b.propertyId);
        return [
          b.id,
          property?.title || '',
          b.guestName,
          b.guestEmail,
          b.checkIn,
          b.checkOut,
          b.guests,
          b.totalPrice,
          b.status,
          b.source,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500">Gestiona todas las reservas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBookings}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}
            >
              Calendario
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por huésped o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'bg-teal-600' : ''}
            >
              {status === 'all' ? 'Todas' : statusLabels[status]}
            </Button>
          ))}
        </div>
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const property = properties.find((p) => p.id === booking.propertyId);
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Property Image */}
                    <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={property?.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80'}
                        alt={property?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{property?.title}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{property?.location}</span>
                          </div>
                        </div>
                        <Badge className={statusColors[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Huésped</p>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fechas</p>
                          <p className="font-medium">
                            {new Date(booking.checkIn).toLocaleDateString('es-ES')} -
                          </p>
                          <p className="font-medium">
                            {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Detalles</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {booking.guests} huéspedes
                          </p>
                          <p className="font-medium text-teal-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${booking.totalPrice}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Badge variant="outline">{sourceLabels[booking.source]}</Badge>
                        {booking.externalId && (
                          <Badge variant="outline" className="text-gray-500">
                            ID: {booking.externalId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reservas</h3>
              <p className="text-gray-600">No se encontraron reservas con los filtros seleccionados</p>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                modifiers={{
                  booked: bookedDates,
                }}
                modifiersStyles={{
                  booked: { backgroundColor: '#0d9488', color: 'white', borderRadius: '50%' },
                }}
              />
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-teal-600" />
                  <span className="text-sm text-gray-600">Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200" />
                  <span className="text-sm text-gray-600">Disponible</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Reservas para{' '}
                {selectedDate?.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>

              <div className="space-y-4">
                {bookingsForDate.length > 0 ? (
                  bookingsForDate.map((booking) => {
                    const property = properties.find((p) => p.id === booking.propertyId);
                    return (
                      <div key={booking.id} className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium text-gray-900">{property?.title}</p>
                        <p className="text-sm text-gray-500">{booking.guestName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay reservas para esta fecha</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
