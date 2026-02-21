import { useEffect, useRef, useState } from 'react';
import { Shield, DollarSign, Sparkles, CreditCard, Check, Clock, Coffee, Wifi, Bath } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Alquileres legales y seguros',
    description: 'Todas nuestras propiedades cumplen con las regulaciones locales y cuentan con seguro de responsabilidad civil.',
  },
  {
    icon: DollarSign,
    title: 'Sin tarifas de servicio',
    description: 'Ahorra las tarifas de Airbnb y VRBO reservando directamente con nosotros.',
  },
  {
    icon: Sparkles,
    title: 'Diseños elegantes',
    description: 'Propiedades con diseño moderno, comodidades de alta calidad y check-in flexible.',
  },
  {
    icon: CreditCard,
    title: 'Pagos seguros',
    description: 'Procesamiento de pagos rápido y seguro a través de Stripe.',
  },
];

const includes = [
  { icon: Bath, text: 'Limpieza profesional entre cada estadía' },
  { icon: Clock, text: 'Auto check-in simple y seguro' },
  { icon: Sparkles, text: 'Crave & Disney+ de cortesía' },
  { icon: Coffee, text: 'Té y café de cortesía' },
  { icon: Wifi, text: 'Internet de alta velocidad' },
  { icon: Bath, text: 'Sábanas y toallas de calidad hotelera' },
];

export default function Benefits() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
              ¿Por qué elegirnos?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              ¡Reserva directamente con{' '}
              <span className="gradient-text">Lifty Life!</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Descubre hoteles boutique para surfistas, alquileres vacacionales en la
              montaña y alojamientos únicos en British Columbia y Alberta. ¡Reserva tus
              próximas vacaciones directamente y ahorra!
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex gap-4 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Includes List */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-700 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                Todas nuestras propiedades incluyen:
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-teal-600" />
                    </div>
                    <item.icon className="w-4 h-4 text-teal-500" />
                    <span className="text-gray-600 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div
            className={`relative transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="relative">
              {/* Main Image */}
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"
                  alt="Hiking adventure"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>

              {/* Floating Card 1 */}
              <div
                className={`absolute -left-6 top-1/4 bg-white rounded-2xl p-4 shadow-xl transition-all duration-700 delay-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">100% Seguro</div>
                    <div className="text-gray-500 text-sm">Propiedades verificadas</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div
                className={`absolute -right-6 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl transition-all duration-700 delay-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mejor Precio</div>
                    <div className="text-gray-500 text-sm">Sin tarifas ocultas</div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-teal-200 rounded-full opacity-30 blur-3xl" />
              <div className="absolute -z-10 -bottom-8 -left-8 w-48 h-48 bg-cyan-200 rounded-full opacity-30 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
