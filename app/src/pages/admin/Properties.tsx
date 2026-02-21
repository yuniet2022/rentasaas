import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { navigateTo } from '@/navigation';
import { toast } from 'sonner';

export default function PropertiesManagement() {
  const { properties, deleteProperty } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && property.isActive;
    if (filterStatus === 'inactive') return matchesSearch && !property.isActive;
    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta propiedad?')) {
      deleteProperty(id);
      toast.success('Propiedad eliminada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-500">Gestiona tus alojamientos</p>
        </div>
        <Button
          onClick={() => navigateTo('/dashboard/properties/new')}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar propiedades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'bg-teal-600' : ''}
          >
            Todas
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
            className={filterStatus === 'active' ? 'bg-teal-600' : ''}
          >
            Activas
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('inactive')}
            className={filterStatus === 'inactive' ? 'bg-teal-600' : ''}
          >
            Inactivas
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
                alt={property.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                {property.featured && (
                  <Badge className="bg-yellow-500 text-white">Destacada</Badge>
                )}
                <Badge className={property.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                  {property.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigateTo(`/dashboard/properties/${property.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateTo(`/dashboard/properties/${property.id}/edit`)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
              
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{property.location}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {property.rating}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <span className="text-xl font-bold text-teal-600">${property.pricePerNight}</span>
                  <span className="text-gray-500 text-sm">/noche</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateTo(`/dashboard/properties/${property.id}/edit`)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron propiedades
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Intenta con otra búsqueda' : 'Comienza creando tu primera propiedad'}
          </p>
          <Button onClick={() => navigateTo('/dashboard/properties/new')} className="bg-teal-600">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Propiedad
          </Button>
        </div>
      )}
    </div>
  );
}
