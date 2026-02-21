import { useState, useEffect } from 'react';
import {
  CreditCard,
  Link,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { settingsAPI } from '@/services/api';

interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
  isEncrypted: boolean;
  description: string;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsAPI.getAll();
      setSettings(data);
    } catch (error) {
      toast.error('Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string, isEncrypted: boolean) => {
    try {
      await settingsAPI.update(key, value, isEncrypted);
      toast.success('Configuración guardada');
      fetchSettings();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  const getSettingBool = (key: string) => {
    return getSettingValue(key) === 'true';
  };

  const toggleSetting = async (key: string) => {
    const currentValue = getSettingValue(key);
    const newValue = currentValue === 'true' ? 'false' : 'true';
    const setting = settings.find(s => s.key === key);
    await handleUpdateSetting(key, newValue, setting?.isEncrypted || false);
  };

  const updateTextSetting = async (key: string, value: string) => {
    const setting = settings.find(s => s.key === key);
    await handleUpdateSetting(key, value, setting?.isEncrypted || false);
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Gestiona las integraciones y pagos</p>
      </div>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-600" />
            Configuración de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe Section */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Stripe</h3>
                <p className="text-sm text-gray-500">Acepta pagos con tarjeta de crédito/débito</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={getSettingBool('stripe_enabled')}
                  onCheckedChange={() => toggleSetting('stripe_enabled')}
                />
                <Badge className={getSettingBool('stripe_enabled') ? 'bg-green-500' : 'bg-gray-400'}>
                  {getSettingBool('stripe_enabled') ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {getSettingBool('stripe_enabled') && (
              <div className="space-y-4 pl-4 border-l-2 border-teal-100">
                <div>
                  <Label className="text-sm font-medium">Publishable Key (pública)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={getSettingValue('stripe_publishable_key')}
                      onBlur={(e) => updateTextSetting('stripe_publishable_key', e.target.value)}
                      placeholder="pk_test_..."
                      className="font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Esta clave es visible en el frontend</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Secret Key (encriptada)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets['stripe_secret_key'] ? 'text' : 'password'}
                      defaultValue={getSettingValue('stripe_secret_key')}
                      onBlur={(e) => updateTextSetting('stripe_secret_key', e.target.value)}
                      placeholder="sk_test_..."
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowSecret('stripe_secret_key')}
                    >
                      {showSecrets['stripe_secret_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Esta clave se almacena encriptada</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Webhook Secret (encriptada)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'}
                      defaultValue={getSettingValue('stripe_webhook_secret')}
                      onBlur={(e) => updateTextSetting('stripe_webhook_secret', e.target.value)}
                      placeholder="whsec_..."
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowSecret('stripe_webhook_secret')}
                    >
                      {showSecrets['stripe_webhook_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Para recibir notificaciones de pagos</p>
                </div>
              </div>
            )}
          </div>

          {/* PayPal Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">PayPal</h3>
                <p className="text-sm text-gray-500">Acepta pagos con PayPal</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={getSettingBool('paypal_enabled')}
                  onCheckedChange={() => toggleSetting('paypal_enabled')}
                />
                <Badge className={getSettingBool('paypal_enabled') ? 'bg-blue-500' : 'bg-gray-400'}>
                  {getSettingBool('paypal_enabled') ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {getSettingBool('paypal_enabled') && (
              <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                <div>
                  <Label className="text-sm font-medium">Modo</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={getSettingValue('paypal_mode') === 'sandbox' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextSetting('paypal_mode', 'sandbox')}
                    >
                      Sandbox (Pruebas)
                    </Button>
                    <Button
                      variant={getSettingValue('paypal_mode') === 'live' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextSetting('paypal_mode', 'live')}
                    >
                      Live (Producción)
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Client ID (pública)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={getSettingValue('paypal_client_id')}
                      onBlur={(e) => updateTextSetting('paypal_client_id', e.target.value)}
                      placeholder="TU_CLIENT_ID..."
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Client Secret (encriptada)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets['paypal_client_secret'] ? 'text' : 'password'}
                      defaultValue={getSettingValue('paypal_client_secret')}
                      onBlur={(e) => updateTextSetting('paypal_client_secret', e.target.value)}
                      placeholder="TU_CLIENT_SECRET..."
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowSecret('paypal_client_secret')}
                    >
                      {showSecrets['paypal_client_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WebPay Section (Chile) */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WebPay (Chile)</h3>
                  <p className="text-sm text-gray-500">Acepta pagos con tarjetas chilenas vía Transbank</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={getSettingBool('webpay_enabled')}
                  onCheckedChange={() => toggleSetting('webpay_enabled')}
                />
                <Badge className={getSettingBool('webpay_enabled') ? 'bg-red-600' : 'bg-gray-400'}>
                  {getSettingBool('webpay_enabled') ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {getSettingBool('webpay_enabled') && (
              <div className="space-y-4 pl-4 border-l-2 border-red-100">
                <div>
                  <Label className="text-sm font-medium">Entorno</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={getSettingValue('webpay_environment') === 'integration' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextSetting('webpay_environment', 'integration')}
                    >
                      Integración (Desarrollo)
                    </Button>
                    <Button
                      variant={getSettingValue('webpay_environment') === 'test' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextSetting('webpay_environment', 'test')}
                    >
                      Test (Certificación)
                    </Button>
                    <Button
                      variant={getSettingValue('webpay_environment') === 'production' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextSetting('webpay_environment', 'production')}
                    >
                      Producción
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Código de Comercio</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      defaultValue={getSettingValue('webpay_commerce_code')}
                      onBlur={(e) => updateTextSetting('webpay_commerce_code', e.target.value)}
                      placeholder="5970XXXXXXX"
                      className="font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Código de comercio proporcionado por Transbank
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">API Key (encriptada)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets['webpay_api_key'] ? 'text' : 'password'}
                      defaultValue={getSettingValue('webpay_api_key')}
                      onBlur={(e) => updateTextSetting('webpay_api_key', e.target.value)}
                      placeholder="Tu API Key de WebPay"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowSecret('webpay_api_key')}
                    >
                      {showSecrets['webpay_api_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    API Key secreta proporcionada por Transbank
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Para usar WebPay en producción, debes completar el proceso de certificación con Transbank.
                    Usa el modo Integración para desarrollo y Test para certificación.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* General Payment Settings */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Configuración General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Moneda</Label>
                <Input
                  defaultValue={getSettingValue('payment_currency')}
                  onBlur={(e) => updateTextSetting('payment_currency', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Tasa de Impuestos (%)</Label>
                <Input
                  type="number"
                  defaultValue={getSettingValue('payment_tax_rate')}
                  onBlur={(e) => updateTextSetting('payment_tax_rate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-purple-600" />
            Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking.com */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B.</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Booking.com</h3>
                  <p className="text-sm text-gray-500">Sincroniza reservas de Booking.com</p>
                </div>
              </div>
              <Switch
                checked={getSettingBool('booking_com_enabled')}
                onCheckedChange={() => toggleSetting('booking_com_enabled')}
              />
            </div>

            {getSettingBool('booking_com_enabled') && (
              <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                <div>
                  <Label className="text-sm font-medium">Property ID</Label>
                  <Input
                    defaultValue={getSettingValue('booking_com_property_id')}
                    onBlur={(e) => updateTextSetting('booking_com_property_id', e.target.value)}
                    placeholder="ID de tu propiedad en Booking.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">API Key (encriptada)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets['booking_com_api_key'] ? 'text' : 'password'}
                      defaultValue={getSettingValue('booking_com_api_key')}
                      onBlur={(e) => updateTextSetting('booking_com_api_key', e.target.value)}
                      placeholder="Tu API Key de Booking.com"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowSecret('booking_com_api_key')}
                    >
                      {showSecrets['booking_com_api_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Airbnb */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Airbnb</h3>
                  <p className="text-sm text-gray-500">Recibe reservas de Airbnb vía webhook</p>
                </div>
              </div>
              <Switch
                checked={getSettingBool('airbnb_enabled')}
                onCheckedChange={() => toggleSetting('airbnb_enabled')}
              />
            </div>

            {getSettingBool('airbnb_enabled') && (
              <div className="space-y-4 pl-4 border-l-2 border-red-100">
                <div>
                  <Label className="text-sm font-medium">Webhook URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={`${window.location.origin}/api/webhooks/airbnb`}
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/airbnb`);
                        toast.success('URL copiada');
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Configura esta URL en tu cuenta de Airbnb o en Zapier/Make
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Rate Limiting</p>
                <p className="text-sm text-gray-500">Limitar requests por minuto para prevenir ataques</p>
              </div>
              <Switch
                checked={getSettingBool('security_rate_limit_enabled')}
                onCheckedChange={() => toggleSetting('security_rate_limit_enabled')}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Máximo de requests por minuto</Label>
              <Input
                type="number"
                defaultValue={getSettingValue('security_max_requests_per_minute')}
                onBlur={(e) => updateTextSetting('security_max_requests_per_minute', e.target.value)}
                className="mt-1 w-32"
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <Lock className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Encriptación activada</p>
                <p className="text-sm text-green-700">
                  Todas las claves API sensibles se almacenan encriptadas en la base de datos
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              {getSettingBool('stripe_enabled') ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              {getSettingBool('paypal_enabled') ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">PayPal</span>
            </div>
            <div className="flex items-center gap-2">
              {getSettingBool('webpay_enabled') ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">WebPay</span>
            </div>
            <div className="flex items-center gap-2">
              {getSettingBool('booking_com_enabled') ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">Booking.com</span>
            </div>
            <div className="flex items-center gap-2">
              {getSettingBool('airbnb_enabled') ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">Airbnb</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
