import { Mountain, Facebook, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { navigateTo } from '@/navigation';

interface FooterProps {
  isClientSite?: boolean;
  companyName?: string;
  logoUrl?: string;
  description?: string;
  instagramUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
}

const footerLinks = {
  company: [
    { label: 'Sobre nosotros', href: '#about' },
    { label: 'Nuestro equipo', href: '#' },
    { label: 'Carreras', href: '#' },
    { label: 'Prensa', href: '#' },
  ],
  properties: [
    { label: 'Whistler', href: '#' },
    { label: 'Harrison Hot Springs', href: '#' },
    { label: 'Ucluelet', href: '#' },
    { label: 'Rocky Mountains', href: '#' },
  ],
  support: [
    { label: 'Centro de ayuda', href: '#' },
    { label: 'Política de cancelación', href: '#' },
    { label: 'Términos y condiciones', href: '#' },
    { label: 'Política de privacidad', href: '#' },
  ],
};

export default function Footer({ 
  isClientSite = false, 
  companyName = 'LIFTYLIFE',
  logoUrl,
  description = 'Descubre alquileres vacacionales únicos en British Columbia y Alberta. Vive experiencias inolvidables.',
  instagramUrl = '#',
  email,
  phone,
  location
}: FooterProps) {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <button
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2 mb-4"
            >
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-teal-600">
                    <Mountain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">
                    {companyName.split(' ')[0]}<span className="text-teal-400">{companyName.split(' ')[1] || ''}</span>
                  </span>
                </>
              )}
            </button>
            <p className="text-gray-400 text-sm mb-6">
              {description}
            </p>
            {isClientSite && (
              <div className="text-gray-400 text-sm mb-4 space-y-1">
                {location && <p>📍 {location}</p>}
                {phone && <p>📞 {phone}</p>}
                {email && <p>✉️ {email}</p>}
              </div>
            )}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: instagramUrl },
                { icon: Linkedin, href: '#' },
                { icon: Youtube, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-teal-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Properties Links - Only show in master site */}
          {!isClientSite && (
            <div>
              <h3 className="font-semibold text-white mb-4">Destinos</h3>
              <ul className="space-y-3">
                {footerLinks.properties.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigateTo('/dashboard/properties')}
                      className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigateTo('/dashboard/settings')}
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Suscríbete para recibir ofertas exclusivas y novedades.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-teal-400"
              />
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {companyName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigateTo('/dashboard/settings')} className="text-gray-500 hover:text-teal-400 text-sm transition-colors">
              Política de privacidad
            </button>
            <button onClick={() => navigateTo('/dashboard/settings')} className="text-gray-500 hover:text-teal-400 text-sm transition-colors">
              Términos y condiciones
            </button>
            <button onClick={() => navigateTo('/dashboard/settings')} className="text-gray-500 hover:text-teal-400 text-sm transition-colors">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
