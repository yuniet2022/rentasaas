import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Search, Wind, ChefHat, Bath, PawPrint, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { amenities } from '@/data/properties';

interface SearchFilters {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  selectedAmenities: string[];
}

interface HeroProps {
  onSearch: (filters: SearchFilters) => void;
  showDestination?: boolean;
  buttonText?: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
  'ac': <Wind className="w-4 h-4" />,
  'kitchen': <ChefHat className="w-4 h-4" />,
  'hot-tub': <Bath className="w-4 h-4" />,
  'pets': <PawPrint className="w-4 h-4" />,
  'crib': <Baby className="w-4 h-4" />,
};

export default function Hero({ onSearch, showDestination = true, buttonText = 'Buscar propiedades' }: HeroProps) {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSearch = () => {
    onSearch({
      destination,
      checkIn,
      checkOut,
      guests,
      selectedAmenities,
    });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
          alt="Mountain landscape"
          className="w-full h-full object-cover scale-110"
          style={{
            transform: isVisible ? 'scale(1)' : 'scale(1.1)',
            transition: 'transform 2s ease-out',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="text-center mb-10">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              Más de 50 propiedades exclusivas
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block">ALQUILERES</span>
            <span className="block gradient-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              VACACIONALES
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl text-white/80 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Descubre alquileres vacacionales únicos en British Columbia y Alberta.
            Vive experiencias inolvidables en la montaña, junto al lago o en la costa.
          </p>
        </div>

        {/* Search Box */}
        <div
          className={`transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="glass-dark rounded-3xl p-4 sm:p-6 max-w-4xl mx-auto">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${showDestination ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              {/* Destination - Only show if showDestination is true */}
              {showDestination && (
                <div className="relative">
                  <label className="block text-white/70 text-xs font-medium mb-2 ml-1">
                    Destino
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                    <Input
                      placeholder="¿A dónde vas?"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-teal-400 focus:ring-teal-400/20 h-12 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Check-in */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-2 ml-1">
                  Llegada
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-12 rounded-xl"
                    >
                      <Calendar className="mr-2 w-5 h-5 text-teal-400" />
                      {checkIn ? (
                        format(checkIn, 'dd MMM', { locale: es })
                      ) : (
                        <span className="text-white/50">Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-2 ml-1">
                  Salida
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-12 rounded-xl"
                    >
                      <Calendar className="mr-2 w-5 h-5 text-teal-400" />
                      {checkOut ? (
                        format(checkOut, 'dd MMM', { locale: es })
                      ) : (
                        <span className="text-white/50">Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      initialFocus
                      disabled={(date) => date < (checkIn || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-2 ml-1">
                  Huéspedes
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-12 rounded-xl"
                    >
                      <Users className="mr-2 w-5 h-5 text-teal-400" />
                      <span>{guests} huésped{guests > 1 ? 'es' : ''}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Huéspedes</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center">{guests}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setGuests(Math.min(12, guests + 1))}
                          disabled={guests >= 12}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 justify-center">
                {amenities.slice(0, 5).map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedAmenities.includes(amenity.id)
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {amenityIcons[amenity.id]}
                    <span className="hidden sm:inline">{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-10 py-6 text-lg font-semibold rounded-2xl shadow-xl shadow-teal-500/30 btn-shine animate-pulse-glow"
              >
                <Search className="w-5 h-5 mr-2" />
                {buttonText}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { value: '50+', label: 'Propiedades' },
            { value: '4.8', label: 'Rating promedio' },
            { value: '10K+', label: 'Huéspedes felices' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-sm">Descubre más</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
