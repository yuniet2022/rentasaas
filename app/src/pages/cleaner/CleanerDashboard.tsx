import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { navigateTo } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  CheckCircle,
  Sparkles,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface CleaningTask {
  id: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  date: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export default function CleanerDashboard() {
  const { user, hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Demo data
  const [tasks] = useState<CleaningTask[]>([
    {
      id: '1',
      propertyName: 'El Après | Estudio Village',
      propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80',
      propertyAddress: '123 Village Rd, Whistler, BC',
      date: '2024-03-15',
      time: '11:00 AM',
      status: 'pending',
      notes: 'Check-out anterior a las 10:00 AM',
    },
    {
      id: '2',
      propertyName: 'Harrison en el lago',
      propertyImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&q=80',
      propertyAddress: '456 Lake Dr, Harrison, BC',
      date: '2024-03-15',
      time: '3:00 PM',
      status: 'pending',
    },
    {
      id: '3',
      propertyName: 'Casa de lujo en la montaña',
      propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80',
      propertyAddress: '789 Mountain View, Whistler, BC',
      date: '2024-03-16',
      time: '10:00 AM',
      status: 'completed',
    },
  ]);

  if (!hasRole('cleaner')) {
    navigateTo('/dashboard');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.date === today);
  const upcomingTasks = tasks.filter((t) => t.date > today);
  const completedTasks = tasks.filter((t) => t.status === 'completed');

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

  const handleStartCleaning = (taskId: string) => {
    alert(`Iniciando limpieza ${taskId}`);
  };

  const handleCompleteCleaning = (taskId: string) => {
    alert(`Marcando como completada ${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user?.firstName || 'Limpiador'}!</h1>
        <p className="text-gray-500">Aquí están tus tareas de limpieza para hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayTasks.filter((t) => t.status === 'pending').length}</p>
                <p className="text-xs text-gray-500">Pendientes hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingTasks.length}</p>
                <p className="text-xs text-gray-500">Próximas</p>
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
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Tareas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayTasks.length > 0 ? (
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <img
                    src={task.propertyImage}
                    alt={task.propertyName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{task.propertyName}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {task.propertyAddress}
                        </p>
                      </div>
                      <Badge
                        className={
                          task.status === 'completed'
                            ? 'bg-green-500'
                            : task.status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }
                      >
                        {task.status === 'completed'
                          ? 'Completada'
                          : task.status === 'in_progress'
                          ? 'En progreso'
                          : 'Pendiente'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {task.time}
                      </span>
                      {task.notes && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          {task.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <Button size="sm" onClick={() => handleStartCleaning(task.id)}>
                        Iniciar
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteCleaning(task.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay tareas pendientes para hoy</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Calendario Mensual
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
              const dateStr = `${selectedDate.getFullYear()}-${String(
                selectedDate.getMonth() + 1
              ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTasks = tasks.filter((t) => t.date === dateStr);
              const hasPending = dayTasks.some((t) => t.status === 'pending');
              const hasCompleted = dayTasks.some((t) => t.status === 'completed') && !hasPending;

              return (
                <button
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
                    hasPending
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : hasCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {hasPending && <Sparkles className="w-3 h-3" />}
                      {hasCompleted && <CheckCircle className="w-3 h-3" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-teal-900">¿Necesitas ayuda?</p>
              <p className="text-sm text-teal-700">
                Contacta al administrador si tienes algún problema
              </p>
            </div>
            <Button variant="outline" className="ml-auto border-teal-300">
              Contactar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
