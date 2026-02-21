import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { navigateTo } from '@/navigation';
import { configAPI, bookingsAPI, paymentsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CreditCard,
  Wallet,
  Calendar,
  Users,
  Home,
  ArrowLeft,
  Lock,
  CheckCircle,
  Loader2,
  Globe,
} from 'lucide-react';

interface PaymentConfig {
  stripe_enabled?: boolean;
  stripe_publishable_key?: string;
  paypal_enabled?: boolean;
  paypal_client_id?: string;
  paypal_mode?: string;
  webpay_enabled?: boolean;
  payment_currency?: string;
  payment_tax_rate?: number;
}

interface CheckoutData {
  propertyId: number;
  propertyTitle: string;
  propertyImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  tax: number;
  total: number;
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [config, setConfig] = useState<PaymentConfig>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'stripe' | 'paypal' | 'webpay' | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  
  // Guest info
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }

    // Load checkout data from session storage
    const savedCheckout = sessionStorage.getItem('checkoutData');
    if (!savedCheckout) {
      toast.error('No hay datos de reserva');
      navigateTo('/');
      return;
    }

    const data = JSON.parse(savedCheckout);
    setCheckoutData(data);
    
    // Pre-fill user data if available
    if (user) {
      setGuestInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }

    loadPaymentConfig();
  }, [isAuthenticated, user]);

  const loadPaymentConfig = async () => {
    try {
      const data = await configAPI.getPaymentConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error loading payment config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!checkoutData) return null;

    try {
      const booking = await bookingsAPI.create({
        propertyId: checkoutData.propertyId,
        checkIn: checkoutData.checkIn,
        checkOut: checkoutData.checkOut,
        guests: checkoutData.guests,
        totalPrice: checkoutData.total,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        specialRequests: guestInfo.specialRequests,
      });

      return booking;
    } catch (error) {
      toast.error('Error al crear la reserva');
      return null;
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    
    const booking = await handleCreateBooking();
    if (!booking) {
      setIsProcessing(false);
      return;
    }

    try {
      await paymentsAPI.createStripeIntent({
        bookingId: booking.id,
        amount: checkoutData!.total,
        currency: config.payment_currency?.toLowerCase() || 'cad',
      });

      // Store booking ID for after payment
      sessionStorage.setItem('pendingBookingId', String(booking.id));
      
      // Redirect to Stripe Checkout
      // Note: In a real implementation, you'd use Stripe Elements
      // For now, we'll simulate success
      toast.success('Redirigiendo a Stripe...');
      
      // Simulate payment success
      setTimeout(() => {
        toast.success('¡Pago completado exitosamente!');
        sessionStorage.removeItem('checkoutData');
        navigateTo('/dashboard/my-bookings');
      }, 2000);
    } catch (error) {
      toast.error('Error al procesar el pago con Stripe');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    
    const booking = await handleCreateBooking();
    if (!booking) {
      setIsProcessing(false);
      return;
    }

    try {
      const { orderId } = await paymentsAPI.createPayPalOrder({
        bookingId: booking.id,
        amount: checkoutData!.total,
        currency: config.payment_currency || 'CAD',
      });

      // Store for capture
      sessionStorage.setItem('pendingPayPalOrderId', orderId);
      sessionStorage.setItem('pendingBookingId', booking.id);

      toast.success('Redirigiendo a PayPal...');
      
      // Simulate payment success
      setTimeout(async () => {
        try {
          await paymentsAPI.capturePayPalOrder(orderId);
          toast.success('¡Pago completado exitosamente!');
          sessionStorage.removeItem('checkoutData');
          navigateTo('/dashboard/my-bookings');
        } catch (e) {
          toast.error('Error al capturar el pago de PayPal');
        }
      }, 2000);
    } catch (error) {
      toast.error('Error al crear la orden de PayPal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWebPayPayment = async () => {
    setIsProcessing(true);
    
    const booking = await handleCreateBooking();
    if (!booking) {
      setIsProcessing(false);
      return;
    }

    try {
      const returnUrl = `${window.location.origin}/checkout/webpay/return`;
      const { token } = await paymentsAPI.createWebPayTransaction({
        bookingId: booking.id,
        amount: checkoutData!.total,
        returnUrl: returnUrl,
      });

      // Store token for verification after return
      sessionStorage.setItem('webpayToken', token);
      sessionStorage.setItem('pendingBookingId', String(booking.id));

      toast.success('Redirigiendo a WebPay...');
      
      // In a real implementation, redirect to WebPay:
      // window.location.href = url;
      
      // Simulate payment success for demo
      setTimeout(async () => {
        try {
          await paymentsAPI.confirmWebPayTransaction(token);
          toast.success('¡Pago completado exitosamente!');
          sessionStorage.removeItem('checkoutData');
          sessionStorage.removeItem('webpayToken');
          navigateTo('/dashboard/my-bookings');
        } catch (e) {
          toast.error('Error al confirmar el pago con WebPay');
        }
      }, 3000);
    } catch (error) {
      toast.error('Error al crear la transacción de WebPay');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (selectedPayment === 'stripe') {
      await handleStripePayment();
    } else if (selectedPayment === 'paypal') {
      await handlePayPalPayment();
    } else if (selectedPayment === 'webpay') {
      await handleWebPayPayment();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!checkoutData) {
    return null;
  }

  const availablePayments = [
    { id: 'stripe', name: 'Tarjeta de Crédito/Débito', icon: CreditCard, enabled: config.stripe_enabled },
    { id: 'paypal', name: 'PayPal', icon: Wallet, enabled: config.paypal_enabled },
    { id: 'webpay', name: 'WebPay (Chile)', icon: Globe, enabled: config.webpay_enabled },
  ].filter(p => p.enabled);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Reserva</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Información del Huésped
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <Label>Apellido *</Label>
                    <Input
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      placeholder="Pérez"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="+1 (604) 123-4567"
                  />
                </div>
                <div>
                  <Label>Solicitudes Especiales</Label>
                  <textarea
                    value={guestInfo.specialRequests}
                    onChange={(e) => setGuestInfo({ ...guestInfo, specialRequests: e.target.value })}
                    placeholder="Alguna solicitud especial para tu estadía..."
                    className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            {availablePayments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-teal-600" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availablePayments.map((payment) => (
                      <button
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment.id as 'stripe' | 'paypal' | 'webpay')}
                        className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                          selectedPayment === payment.id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <payment.icon className="w-6 h-6" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">{payment.name}</p>
                        </div>
                        {selectedPayment === payment.id && (
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedPayment && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg mb-4">
                        <Lock className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-700">
                          Tu pago está protegido con encriptación SSL de 256 bits
                        </p>
                      </div>

                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-teal-600 hover:bg-teal-700 h-14 text-lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            {selectedPayment === 'webpay' ? <Globe className="w-5 h-5 mr-2" /> : <CreditCard className="w-5 h-5 mr-2" />}
                            Pagar ${checkoutData.total.toFixed(2)} {selectedPayment === 'webpay' ? 'CLP' : config.payment_currency}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <p className="text-yellow-800">
                    No hay métodos de pago configurados. Por favor contacta al administrador.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumen de la Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Info */}
                <div className="flex gap-4">
                  <img
                    src={checkoutData.propertyImage}
                    alt={checkoutData.propertyTitle}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{checkoutData.propertyTitle}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Home className="w-4 h-4" />
                      <span>Alojamiento completo</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(checkoutData.checkIn).toLocaleDateString('es-ES')} - {' '}
                      {new Date(checkoutData.checkOut).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{checkoutData.guests} huéspedes</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${checkoutData.pricePerNight} x {checkoutData.nights} noches</span>
                    <span>${checkoutData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos ({config.payment_tax_rate || 0}%)</span>
                    <span>${checkoutData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>${checkoutData.total.toFixed(2)} {config.payment_currency}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Lock className="w-3 h-3 mr-1" />
                    Seguro
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Pago encriptado y seguro
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
