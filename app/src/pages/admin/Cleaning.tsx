import { useState } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  Home,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
  assignedProperties: number;
  completedCleanings: number;
  pendingCleanings: number;
}

export default function CleaningManagement() {
  const { properties } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cleaners] = useState<Cleaner[]>([
    {
      id: '1',
      name: 'María López',
      phone: '+1 (604) 123-4567',
      assignedProperties: 3,
      completedCleanings: 45,
      pendingCleanings: 2,
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      phone: '+1 (604) 987-6543',
      assignedProperties: 2,
      completedCleanings: 32,
      pendingCleanings: 1,
    },
  ]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDay = getFirstDayOfMonth(selectedDate);

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleAssignCleaner = (_cleanerId: string) => {
    toast.success('Limpiador asignado correctamente');
  };

  const handleDeleteCleaner = (_cleanerId: string) => {
    if (confirm('¿Estás seguro de eliminar este limpiador?')) {
      toast.success('Limpiador eliminado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Limpieza</h1>
          <p className="text-gray-500">Asigna limpiadores y gestiona el calendario</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Limpiador
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cleaners.length}</p>
                <p className="text-xs text-gray-500">Limpiadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cleaners.reduce((sum, c) => sum + c.completedCleanings, 0)}
                </p>
                <p className="text-xs text-gray-500">Limpiezas completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cleaners.reduce((sum, c) => sum + c.pendingCleanings, 0)}
                </p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-xs text-gray-500">Propiedades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Calendario de Limpiezas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                ←
              </Button>
              <span className="font-medium">
                {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasCleaning = day % 3 === 0;
                return (
                  <button
                    key={day}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
                      hasCleaning
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{day}</span>
                    {hasCleaning && (
                      <Sparkles className="w-3 h-3 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cleaners List */}
        <Card>
          <CardHeader>
            <CardTitle>Personal de Limpieza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cleaners.map((cleaner) => (
                <div
                  key={cleaner.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cleaner.name}</p>
                      <p className="text-sm text-gray-500">{cleaner.phone}</p>
                      <div className="flex gap-3 mt-1 text-xs">
                        <span className="text-gray-500">
                          {cleaner.assignedProperties} propiedades
                        </span>
                        <span className="text-green-600">
                          {cleaner.completedCleanings} completadas
                        </span>
                        <span className="text-yellow-600">
                          {cleaner.pendingCleanings} pendientes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignCleaner(cleaner.id)}
                    >
                      Asignar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCleaner(cleaner.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Asignación de Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center gap-4 p-4 border rounded-xl"
              >
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'}
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{property.title}</p>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Sin asignar
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
