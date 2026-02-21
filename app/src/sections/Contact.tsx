import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('¡Mensaje enviado! Te contactaremos pronto.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <span className="inline-block px-4 py-1.5 bg-teal-500/20 text-teal-300 text-sm font-medium rounded-full mb-4">
              Contáctanos
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Estamos aquí para ayudarte a encontrar el alojamiento perfecto para tus vacaciones.
              Contáctanos y te responderemos en menos de 24 horas.
            </p>

            {/* Contact Info */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Email</div>
                  <a
                    href="mailto:hello@liftylife.com"
                    className="text-white hover:text-teal-400 transition-colors"
                  >
                    hello@liftylife.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Teléfono</div>
                  <a
                    href="tel:+16041234567"
                    className="text-white hover:text-teal-400 transition-colors"
                  >
                    +1 (604) 123-4567
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Ubicación</div>
                  <span className="text-white">Vancouver, BC, Canadá</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <div className="text-gray-400 text-sm mb-4">Síguenos</div>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: '#' },
                  { icon: Instagram, href: '#' },
                  { icon: Linkedin, href: '#' },
                  { icon: Youtube, href: '#' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-teal-500 flex items-center justify-center text-white hover:text-white transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-6">
                Envíanos un mensaje
              </h3>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Nombre</label>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Asunto</label>
                  <Input
                    placeholder="¿En qué podemos ayudarte?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Mensaje</label>
                  <Textarea
                    placeholder="Cuéntanos más sobre tu consulta..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/20 min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6 btn-shine"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar mensaje
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
