import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { navigateTo } from '@/navigation';
import Header from '@/sections/Header';
import Hero from '@/sections/Hero';
import Destinations from '@/sections/Destinations';
import Properties from '@/sections/Properties';
import Benefits from '@/sections/Benefits';
import Testimonials from '@/sections/Testimonials';
import Contact from '@/sections/Contact';
import Footer from '@/sections/Footer';

interface SearchFilters {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  selectedAmenities: string[];
}

// Configuración del tenant - En producción esto vendría del backend
const getTenantConfig = () => {
  const hostname = window.location.hostname;
  
  // Si es el dominio de Rylax (cliente)
  if (hostname === 'rylax.com' || hostname.includes('rylax')) {
    return {
      isClientSite: true,
      companyName: 'RYLAX',
      logoUrl: '', // El cliente subirá su logo
      description: 'Descubre los mejores alojamientos en Santiago de Chile. Experiencias únicas para tu estadía.',
      instagramUrl: 'https://www.instagram.com/rylax_ch',
      email: 'rylax@gmail.com',
      phone: '+56956284785',
      location: 'Santiago de Chile, Chile',
      showDestination: false,
      searchButtonText: 'Buscar disponibilidad',
    };
  }
  
  // Sitio master (default)
  return {
    isClientSite: false,
    companyName: 'LIFTYLIFE',
    logoUrl: '',
    description: 'Descubre alquileres vacacionales únicos en British Columbia y Alberta. Vive experiencias inolvidables.',
    instagramUrl: '#',
    email: '',
    phone: '',
    location: '',
    showDestination: true,
    searchButtonText: 'Buscar propiedades',
  };
};

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchFilters, setSearchFilters] = useState<SearchFilters | undefined>();
  const [tenantConfig, setTenantConfig] = useState(getTenantConfig());

  useEffect(() => {
    setTenantConfig(getTenantConfig());
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    const propertiesSection = document.getElementById('properties');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    navigateTo('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Buttons - Floating */}
      <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}
                alt={user?.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/login')}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm font-medium text-gray-700"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigateTo('/register')}
              className="px-4 py-2 bg-teal-600 rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm font-medium text-white"
            >
              Registrarse
            </button>
          </div>
        )}
      </div>

      <Header 
        isClientSite={tenantConfig.isClientSite}
        companyName={tenantConfig.companyName}
        logoUrl={tenantConfig.logoUrl}
      />
      <main>
        <Hero 
          onSearch={handleSearch} 
          showDestination={tenantConfig.showDestination}
          buttonText={tenantConfig.searchButtonText}
        />
        {!tenantConfig.isClientSite && <Destinations />}
        <Properties filters={searchFilters} />
        <Benefits />
        <Testimonials />
        <Contact />
      </main>
      <Footer 
        isClientSite={tenantConfig.isClientSite}
        companyName={tenantConfig.companyName}
        logoUrl={tenantConfig.logoUrl}
        description={tenantConfig.description}
        instagramUrl={tenantConfig.instagramUrl}
        email={tenantConfig.email}
        phone={tenantConfig.phone}
        location={tenantConfig.location}
      />
    </div>
  );
}
