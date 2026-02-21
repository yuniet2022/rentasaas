import { useState } from 'react';
import {
  ExternalLink,
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface BookingComReservation {
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

export default function BookingComIntegration() {
  const { properties, addBooking } = useData();
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [reservations, setReservations] = useState<BookingComReservation[]>([]);

  const handleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(false);
      toast.success('Conectado exitosamente con Booking.com');
      // Load sample reservations
      setReservations([
        {
          id: 'BC-12345',
          propertyName: 'El Après | Estudio Village',
          guestName: 'María González',
          guestEmail: 'maria@ejemplo.com',
          checkIn: '2024-03-15',
          checkOut: '2024-03-20',
          guests: 2,
          totalAmount: 945,
          currency: 'CAD',
          status: 'confirmed',
          bookedDate: '2024-02-10',
        },
        {
          id: 'BC-12346',
          propertyName: 'Harrison en el lago',
          guestName: 'Juan Pérez',
          guestEmail: 'juan@ejemplo.com',
          checkIn: '2024-03-22',
          checkOut: '2024-03-25',
          guests: 4,
          totalAmount: 435,
          currency: 'CAD',
          status: 'confirmed',
          bookedDate: '2024-02-12',
        },
      ]);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setReservations([]);
    toast.info('Desconectado de Booking.com');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastSync(new Date().toLocaleString('es-ES'));
    setIsSyncing(false);
    toast.success('Reservas sincronizadas');
  };

  const handleImportReservation = (reservation: BookingComReservation) => {
    const property = properties.find((p) =>
      p.title.toLowerCase().includes(reservation.propertyName.toLowerCase().split('|')[0].trim())
    );

    if (property) {
      addBooking({
        propertyId: property.id,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        totalPrice: reservation.totalAmount,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        guestPhone: '',
        specialRequests: '',
        source: 'booking',
        clientId: '',
        status: 'confirmed',
      });
      toast.success('Reserva importada exitosamente');
    } else {
      toast.error('No se encontró una propiedad coincidente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking.com Integration</h1>
        <p className="text-gray-500">Sincroniza tus reservas de Booking.com</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isConnected ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <ExternalLink
                  className={`w-8 h-8 ${isConnected ? 'text-blue-600' : 'text-gray-400'}`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Booking.com API</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 text-sm">Conectado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-sm">No conectado</span>
                    </>
                  )}
                </div>
                {lastSync && (
                  <p className="text-sm text-gray-500 mt-1">Última sincronización: {lastSync}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isConnected ? (
                <>
                  <Button variant="outline" onClick={handleDisconnect}>
                    <Unlink className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                  <Button onClick={handleSync} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                  </Button>
                </>
              ) : (
                <Button onClick={handleConnect} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {isSyncing ? 'Conectando...' : 'Conectar con Booking.com'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {!isConnected && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">¿Cómo conectar?</h3>
            <ol className="space-y-2 text-blue-800 text-sm">
              <li>1. Solicita acceso a la API de Booking.com desde tu cuenta de partner</li>
              <li>2. Ingresa tus credenciales de API en Configuración → Integraciones</li>
              <li>3. Haz clic en &quot;Conectar con Booking.com&quot;</li>
              <li>4. ¡Listo! Tus reservas se sincronizarán automáticamente</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Reservations */}
      {isConnected && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Reservas de Booking.com</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar todas
            </Button>
          </div>

          <div className="space-y-4">
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{reservation.propertyName}</h3>
                            <p className="text-sm text-gray-500">ID: {reservation.id}</p>
                          </div>
                          <Badge className="bg-blue-500">{reservation.status}</Badge>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">Huésped</p>
                            <p className="font-medium">{reservation.guestName}</p>
                            <p className="text-sm text-gray-500">{reservation.guestEmail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fechas</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(reservation.checkIn).toLocaleDateString('es-ES')} -
                            </p>
                            <p className="font-medium">
                              {new Date(reservation.checkOut).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Detalles</p>
                            <p className="font-medium flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {reservation.guests} huéspedes
                            </p>
                            <p className="font-medium text-blue-600 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {reservation.totalAmount} {reservation.currency}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleImportReservation(reservation)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Importar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No hay reservas pendientes de importar</p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Sync Settings */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de sincronización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Sincronización automática</p>
                <p className="text-sm text-gray-500">Importar reservas automáticamente cada hora</p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Notificaciones</p>
                <p className="text-sm text-gray-500">Recibir alertas de nuevas reservas</p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Mapeo de propiedades</p>
                <p className="text-sm text-gray-500">Vincular propiedades de Booking.com con las de Lifty Life</p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
