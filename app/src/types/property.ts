export interface Property {
  id: string;
  title: string;
  location: string;
  category: string;
  rating: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  images: string[];
  amenities: string[];
  featured?: boolean;
}

export interface Amenity {
  id: string;
  label: string;
  icon: string;
}

export interface Destination {
  id: string;
  name: string;
  propertyCount: number;
  image: string;
}
