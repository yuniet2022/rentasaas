import { useState, useEffect } from 'react';
import { Menu, X, Mountain, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { navigateTo } from '@/navigation';

interface HeaderProps {
  isClientSite?: boolean;
  companyName?: string;
  logoUrl?: string;
}

const getNavLinks = (isClientSite: boolean) => {
  const links = [
    { label: 'Explorar alquileres', href: '#properties' },
    { label: 'Sobre nosotros', href: '#about' },
    { label: 'Contacto', href: '#contact' },
  ];
  
  // Solo mostrar Destinos en el sitio master
  if (!isClientSite) {
    links.splice(1, 0, { label: 'Destinos', href: '#destinations' });
  }
  
  return links;
};

export default function Header({ isClientSite = false, companyName = 'LIFTYLIFE', logoUrl }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = getNavLinks(isClientSite);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigateTo('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2 group"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isScrolled ? 'bg-teal-600' : 'bg-white/20 backdrop-blur-sm'
                }`}>
                  <Mountain className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-white'}`} />
                </div>
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  {companyName.split(' ')[0]}<span className="text-teal-500">{companyName.split(' ')[1] || ''}</span>
                </span>
              </>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-teal-50 ${
                  isScrolled
                    ? 'text-gray-700 hover:text-teal-600'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                      : 'text-white hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">ES</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                  }`}>
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}
                      alt={user?.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className={`hidden sm:inline text-sm font-medium ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user?.firstName}
                    </span>
                    <ChevronDown className={`w-4 h-4 ${isScrolled ? 'text-gray-500' : 'text-white/70'}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigateTo('/dashboard')}>
                    <User className="w-4 h-4 mr-2" />
                    Mi Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('/login')}
                  className={`hidden sm:block px-4 py-2 text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'text-gray-700 hover:text-teal-600'
                      : 'text-white hover:text-white'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => navigateTo('/register')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-white text-teal-700 hover:bg-white/90'
                  }`}
                >
                  Registrarse
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${
                isScrolled
                  ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col gap-2 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="px-4 py-3 text-left text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    navigateTo('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg font-medium transition-colors text-left"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    navigateTo('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 bg-teal-600 text-white rounded-lg font-medium text-left"
                >
                  Registrarse
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
