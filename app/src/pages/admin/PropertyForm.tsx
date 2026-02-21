import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { navigateTo } from '@/navigation';
import { toast } from 'sonner';

const amenitiesList = [
  { id: 'ac', label: 'Aire acondicionado' },
  { id: 'kitchen', label: 'Cocina' },
  { id: 'hot-tub', label: 'Bañera de hidromasaje' },
  { id: 'pets', label: 'Mascotas permitidas' },
  { id: 'crib', label: 'Cuna de viaje' },
  { id: 'wifi', label: 'Wi-Fi gratis' },
  { id: 'parking', label: 'Estacionamiento' },
  { id: 'washer', label: 'Lavadora' },
  { id: 'beach', label: 'Frente a la playa' },
  { id: 'fireplace', label: 'Chimenea' },
];

const categories = [
  'Vida de Montaña',
  'Vida Junto al Lago',
  'Vida de Surf',
  'Vida Urbana',
];

export default function PropertyForm() {
  const path = window.location.pathname;
  const id = path.includes('/edit') ? path.split('/')[3] : null;
  const isEditing = Boolean(id);
  
  const { properties, addProperty, updateProperty } = useData();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    category: categories[0],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 100,
    images: [] as string[],
    amenities: [] as string[],
    featured: false,
    isActive: true,
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const property = properties.find((p) => p.id === id);
      if (property) {
        setFormData({
          title: property.title,
          description: property.description,
          location: property.location,
          address: property.address,
          category: property.category,
          guests: property.guests,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          pricePerNight: property.pricePerNight,
          images: property.images,
          amenities: property.amenities,
          featured: property.featured,
          isActive: property.isActive,
        });
      }
    }
  }, [id, isEditing, properties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error('Agrega al menos una imagen');
      return;
    }

    if (isEditing && id) {
      updateProperty(id, {
        ...formData,
        rating: 4.5,
      });
      toast.success('Propiedad actualizada');
    } else {
      addProperty({
        ...formData,
        rating: 4.5,
        assignedCleaners: [],
        bookingIds: [],
      });
      toast.success('Propiedad creada');
    }

    navigateTo('/dashboard/properties');
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter((a) => a !== amenityId)
        : [...formData.amenities, amenityId],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigateTo('/dashboard/properties')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Actualiza los detalles de la propiedad' : 'Completa la información del nuevo alojamiento'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: El Après | Estudio con vistas"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe la propiedad..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Whistler"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Dirección completa"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de la imagen"
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                      <img src={image} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Agrega imágenes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Comodidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.amenities.includes(amenity.id)
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amenity.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="guests">Huéspedes</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={20}
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">Hab.</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Precio por noche (CAD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={1}
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Propiedad destacada</Label>
                    <p className="text-sm text-gray-500">Aparecerá en la página principal</p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Propiedad activa</Label>
                    <p className="text-sm text-gray-500">Disponible para reservas</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigateTo('/dashboard/properties')}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                {isEditing ? 'Guardar cambios' : 'Crear propiedad'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
