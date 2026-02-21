import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { navigateTo } from '@/navigation';

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('¡Bienvenido de vuelta!');
        navigateTo('/dashboard');
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Mountain className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            LIFTY<span className="text-teal-400">LIFE</span>
          </h1>
          <p className="text-gray-400 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-teal-400 focus:ring-teal-400/20 h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-teal-400 focus:ring-teal-400/20 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                Recordarme
              </label>
              <button type="button" className="text-teal-400 hover:text-teal-300">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-12 btn-shine"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-gray-400 text-sm mb-4">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigateTo('/register')}
                className="text-teal-400 hover:text-teal-300 font-medium"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm text-center mb-3">Cuentas de demo:</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Admin:</span>
              <span className="font-mono">admin@liftylife.com / admin123</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Cleaner:</span>
              <span className="font-mono">cleaner@liftylife.com / cleaner123</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Client:</span>
              <span className="font-mono">client@liftylife.com / client123</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Owner:</span>
              <span className="font-mono">owner@liftylife.com / owner123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
