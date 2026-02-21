import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'María González',
    location: 'Madrid, España',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    rating: 5,
    text: 'Increíble experiencia en la cabaña de Whistler. Todo estaba impecable y el check-in fue súper fácil. Definitivamente volveremos a reservar con Lifty Life.',
    property: 'El Après Studio',
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    location: 'Ciudad de México, México',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    rating: 5,
    text: 'La mejor decisión fue reservar directamente. Ahorramos mucho dinero en tarifas y la atención al cliente fue excelente. La casa en Harrison Hot Springs era un sueño.',
    property: 'Cresta de Pino',
  },
  {
    id: 3,
    name: 'Ana Martínez',
    location: 'Barcelona, España',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    rating: 5,
    text: 'Nuestra familia disfrutó mucho la estadía en Ucluelet. Las vistas al océano eran espectaculares y la cabaña tenía todo lo que necesitábamos. ¡Altamente recomendado!',
    property: 'Martín Pescador',
  },
  {
    id: 4,
    name: 'Juan Pérez',
    location: 'Buenos Aires, Argentina',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    rating: 5,
    text: 'Excelente servicio y propiedades de alta calidad. El proceso de reserva fue muy sencillo y el equipo de Lifty Life estuvo siempre disponible para ayudarnos.',
    property: 'Bahía Tormenta',
  },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros huéspedes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Miles de viajeros han disfrutado de experiencias inolvidables en nuestras propiedades.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div
          className={`relative transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Featured Testimonial */}
            <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 text-white">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-white/20" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-lg mb-6 leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <div className="font-semibold">{testimonials[currentIndex].name}</div>
                  <div className="text-white/70 text-sm">{testimonials[currentIndex].location}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="text-white/70 text-sm">Se hospedó en: </span>
                <span className="font-medium">{testimonials[currentIndex].property}</span>
              </div>

              {/* Navigation */}
              <div className="absolute bottom-8 right-8 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevTestimonial}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextTestimonial}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-2 gap-4">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`p-4 rounded-2xl text-left transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-teal-50 border-2 border-teal-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className={`font-semibold text-sm ${
                        index === currentIndex ? 'text-teal-700' : 'text-gray-900'
                      }`}>
                        {testimonial.name}
                      </div>
                      <div className="text-gray-500 text-xs">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { value: '4.9', label: 'Rating promedio', suffix: '/5' },
            { value: '10K+', label: 'Reseñas', suffix: '' },
            { value: '98%', label: 'Huéspedes satisfechos', suffix: '' },
            { value: '50+', label: 'Propiedades', suffix: '' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-1">
                {stat.value}
                <span className="text-xl text-teal-400">{stat.suffix}</span>
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
