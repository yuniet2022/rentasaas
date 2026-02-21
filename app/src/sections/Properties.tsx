import { useEffect, useRef, useState } from 'react';
import { Star, Users, Bed, Bath, Wifi, Car, Wind, ChefHat, PawPrint, Baby, Droplets, Waves, Flame, Heart, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { properties } from '@/data/properties';
import type { Property } from '@/types/property';

interface PropertiesProps {
  filters?: {
    destination: string;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: number;
    selectedAmenities: string[];
  };
}

const amenityIcons: Record<string, React.ReactNode> = {
  'ac': <Wind className="w-3.5 h-3.5" />,
  'kitchen': <ChefHat className="w-3.5 h-3.5" />,
  'hot-tub': <Droplets className="w-3.5 h-3.5" />,
  'pets': <PawPrint className="w-3.5 h-3.5" />,
  'crib': <Baby className="w-3.5 h-3.5" />,
  'wifi': <Wifi className="w-3.5 h-3.5" />,
  'parking': <Car className="w-3.5 h-3.5" />,
  'washer': <Droplets className="w-3.5 h-3.5" />,
  'beach': <Waves className="w-3.5 h-3.5" />,
  'fireplace': <Flame className="w-3.5 h-3.5" />,
};

const amenityLabels: Record<string, string> = {
  'ac': 'Aire acondicionado',
  'kitchen': 'Cocina',
  'hot-tub': 'Bañera de hidromasaje',
  'pets': 'Mascotas permitidas',
  'crib': 'Cuna de viaje',
  'wifi': 'Wi-Fi gratis',
  'parking': 'Estacionamiento',
  'washer': 'Lavadora',
  'beach': 'Frente a la playa',
  'fireplace': 'Chimenea',
};

function PropertyCard({ property, index, isVisible }: { property: Property; index: number; isVisible: boolean }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden shadow-lg card-hover transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[currentImage]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-teal-500 text-white border-0">
            {property.location}
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {property.category}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-800">{property.rating}</span>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {property.images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentImage ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {property.title}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-3 text-gray-500 text-sm mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {property.guests}
          </span>
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.bathrooms}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {amenityIcons[amenity]}
              <span className="hidden sm:inline">{amenityLabels[amenity]}</span>
            </span>
          ))}
          {property.amenities.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{property.amenities.length - 4}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-teal-600">${property.pricePerNight}</span>
            <span className="text-gray-500 text-sm">/noche</span>
          </div>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Ver detalles
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Properties({ filters }: PropertiesProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Filter properties based on search filters
  const filteredProperties = properties.filter((property) => {
    if (!filters) return true;

    // Filter by destination
    if (filters.destination && !property.location.toLowerCase().includes(filters.destination.toLowerCase())) {
      return false;
    }

    // Filter by guests
    if (filters.guests > property.guests) {
      return false;
    }

    // Filter by amenities
    if (filters.selectedAmenities.length > 0) {
      const hasAllAmenities = filters.selectedAmenities.every((amenity) =>
        property.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });

  const displayedProperties = filteredProperties.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProperties.length;

  return (
    <section
      id="properties"
      ref={sectionRef}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
              Propiedades Exclusivas
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Nuestras Mejores Propiedades
            </h2>
          </div>
          <p className="text-gray-600 max-w-md">
            {filteredProperties.length} propiedades disponibles para tu próxima aventura
          </p>
        </div>

        {/* Properties Grid */}
        {displayedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div
            className={`mt-10 text-center transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8"
            >
              Ver más propiedades ({filteredProperties.length - visibleCount})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
