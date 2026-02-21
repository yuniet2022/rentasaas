import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { navigateTo } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Supply } from '@/types/user';

const categories = [
  { value: 'Limpieza', label: 'Limpieza', color: '#3b82f6' },
  { value: 'Amenities', label: 'Amenities', color: '#10b981' },
  { value: 'Mantenimiento', label: 'Mantenimiento', color: '#f59e0b' },
  { value: 'Decoración', label: 'Decoración', color: '#ec4899' },
  { value: 'Seguridad', label: 'Seguridad', color: '#ef4444' },
  { value: 'Otros', label: 'Otros', color: '#6b7280' },
];

export default function OwnerDashboard() {
  const { user, hasRole } = useAuth();
  const { properties, bookings, supplies } = useData();
  
  const [ownerStats, setOwnerStats] = useState({
    totalProperties: 0,
    totalBookedDays: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netIncome: 0,
    occupancyRate: 0,
  });

  const [mySupplies, setMySupplies] = useState<Supply[]>([]);

  useEffect(() => {
    if (!hasRole('owner')) {
      navigateTo('/dashboard');
    }
  }, [hasRole]);

  useEffect(() => {
    // For demo, get properties that belong to the owner (owner_id = 2 from database)
    // In production, this would filter by the actual owner ID
    const myPropertyIds = properties.filter(p => p.ownerId === 2 || p.ownerId === 1).map(p => p.id);
    
    // Filter supplies for owner's properties
    const filteredSupplies = supplies.filter(s => myPropertyIds.includes(String(s.propertyId)));
    setMySupplies(filteredSupplies);

    // Calculate stats
    const myProperties = properties.filter(p => myPropertyIds.includes(p.id));
    const myBookings = bookings.filter(b => myPropertyIds.includes(String(b.propertyId)));
    
    // Calculate booked days
    const totalBookedDays = myBookings.reduce((sum, b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    // Calculate revenue
    const totalRevenue = myBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Calculate expenses from supplies
    const totalExpenses = filteredSupplies.reduce((sum, s) => sum + (s.unitCost * s.quantity), 0);

    // Calculate occupancy (simplified)
    const totalDays = myProperties.length * 30; // Approximate 30 days per property
    const occupancyRate = totalDays > 0 ? Math.round((totalBookedDays / totalDays) * 100) : 0;

    setOwnerStats({
      totalProperties: myProperties.length,
      totalBookedDays,
      monthlyRevenue: totalRevenue,
      monthlyExpenses: totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      occupancyRate,
    });
  }, [properties, bookings, supplies]);

  // Calculate expenses by category for pie chart
  const expensesByCategory = categories.map(cat => ({
    name: cat.label,
    value: mySupplies
      .filter(s => s.category === cat.value)
      .reduce((sum, s) => sum + (s.unitCost * s.quantity), 0),
    color: cat.color,
  })).filter(item => item.value > 0);

  // Calculate monthly revenue data for bar chart
  const monthlyData = [
    { month: 'Ene', revenue: 4500, expenses: 1200 },
    { month: 'Feb', revenue: 5200, expenses: 1500 },
    { month: 'Mar', revenue: 4800, expenses: 1100 },
    { month: 'Abr', revenue: 6100, expenses: 1800 },
    { month: 'May', revenue: 5800, expenses: 1400 },
    { month: 'Jun', revenue: ownerStats.monthlyRevenue, expenses: ownerStats.monthlyExpenses },
  ];

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || '#6b7280';
  };

  const myProperties = properties.filter(p => p.ownerId === 2 || p.ownerId === 1);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user?.firstName || 'Propietario'}!</h1>
        <p className="text-gray-500">Resumen de tus propiedades e insumos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ownerStats.totalProperties}</p>
                <p className="text-xs text-gray-500">Mis Propiedades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ownerStats.totalBookedDays}</p>
                <p className="text-xs text-gray-500">Días Alquilados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ownerStats.occupancyRate}%</p>
                <p className="text-xs text-gray-500">Ocupación</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${ownerStats.netIncome.toLocaleString('es-CA', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-gray-500">Ganancia Neta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Expenses */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingresos vs Gastos</CardTitle>
            <Badge variant="outline" className={ownerStats.monthlyRevenue - ownerStats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}>
              {ownerStats.monthlyRevenue - ownerStats.monthlyExpenses >= 0 ? '+' : ''}
              ${(ownerStats.monthlyRevenue - ownerStats.monthlyExpenses).toLocaleString('es-CA', { maximumFractionDigits: 0 })} este mes
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString('es-CA')}`, '']} />
                  <Bar dataKey="revenue" name="Ingresos" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Distribución de Gastos en Insumos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString('es-CA')}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No hay gastos en insumos registrados
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {expensesByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myProperties.length > 0 ? (
              myProperties.map((property) => {
                const propertyBookings = bookings.filter(b => b.propertyId === property.id);
                const propertySupplies = mySupplies.filter(s => s.propertyId === property.id);
                const bookedDays = propertyBookings.reduce((sum, b) => {
                  const checkIn = new Date(b.checkIn);
                  const checkOut = new Date(b.checkOut);
                  return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                }, 0);
                const totalRevenue = propertyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                const totalSuppliesCost = propertySupplies.reduce((sum, s) => sum + (s.unitCost * s.quantity), 0);

                return (
                  <div key={property.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'}
                      alt={property.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.location}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          {bookedDays} días alquilados
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          ${totalRevenue.toLocaleString('es-CA')} ingresos
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-orange-500" />
                          {propertySupplies.length} insumos
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          ${totalSuppliesCost.toLocaleString('es-CA')} en insumos
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">${(totalRevenue - totalSuppliesCost).toLocaleString('es-CA')}</p>
                      <p className="text-xs text-gray-500">Ganancia neta</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No tienes propiedades asignadas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supplies Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Insumos por Propiedad</CardTitle>
          <Badge variant="outline" className="text-blue-600">
            Total: ${ownerStats.monthlyExpenses.toLocaleString('es-CA', { maximumFractionDigits: 0 })}
          </Badge>
        </CardHeader>
        <CardContent>
          {mySupplies.length > 0 ? (
            <div className="space-y-6">
              {myProperties.map((property) => {
                const propertySupplies = mySupplies.filter(s => s.propertyId === property.id);
                if (propertySupplies.length === 0) return null;

                return (
                  <div key={property.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Home className="w-4 h-4 text-teal-600" />
                      {property.title}
                    </h4>
                    <div className="space-y-2">
                      {propertySupplies.map((supply) => (
                        <div key={supply.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: getCategoryColor(supply.category) + '20' }}
                            >
                              <Package className="w-5 h-5" style={{ color: getCategoryColor(supply.category) }} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{supply.name}</p>
                              <p className="text-sm text-gray-500">
                                {getCategoryLabel(supply.category)} • {supply.quantity} {supply.unit}
                                {supply.supplier && ` • ${supply.supplier}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${(supply.unitCost * supply.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${supply.unitCost.toFixed(2)} c/u
                            </p>
                            {supply.isRecurring && (
                              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <RotateCcw className="w-3 h-3" />
                                {supply.frequency}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-right">
                      <p className="text-sm text-gray-500">
                        Subtotal: {' '}
                        <span className="font-semibold text-gray-900">
                          ${propertySupplies.reduce((sum, s) => sum + (s.unitCost * s.quantity), 0).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay insumos registrados para tus propiedades</p>
              <p className="text-sm text-gray-400 mt-1">
                El administrador agregará los insumos correspondientes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Ingresos del Mes</p>
                <p className="text-xl font-bold text-blue-900">
                  ${ownerStats.monthlyRevenue.toLocaleString('es-CA', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-600">Gastos en Insumos</p>
                <p className="text-xl font-bold text-red-900">
                  ${ownerStats.monthlyExpenses.toLocaleString('es-CA', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={ownerStats.netIncome >= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ownerStats.netIncome >= 0 ? 'bg-green-500' : 'bg-orange-500'}`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm ${ownerStats.netIncome >= 0 ? 'text-green-600' : 'text-orange-600'}`}>Ganancia Neta</p>
                <p className={`text-xl font-bold ${ownerStats.netIncome >= 0 ? 'text-green-900' : 'text-orange-900'}`}>
                  ${ownerStats.netIncome.toLocaleString('es-CA', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
