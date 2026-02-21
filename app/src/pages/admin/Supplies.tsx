import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  RotateCcw,
  Home,
  Filter,
  X,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import type { Supply } from '@/types/user';

const categories = [
  { value: 'Limpieza', label: 'Limpieza', color: 'bg-blue-100 text-blue-700' },
  { value: 'Amenities', label: 'Amenities', color: 'bg-green-100 text-green-700' },
  { value: 'Mantenimiento', label: 'Mantenimiento', color: 'bg-orange-100 text-orange-700' },
  { value: 'Decoración', label: 'Decoración', color: 'bg-pink-100 text-pink-700' },
  { value: 'Seguridad', label: 'Seguridad', color: 'bg-red-100 text-red-700' },
  { value: 'Otros', label: 'Otros', color: 'bg-gray-100 text-gray-700' },
];

const frequencies = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

const units = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'juego', label: 'Juego' },
  { value: 'botella', label: 'Botella' },
  { value: 'rollo', label: 'Rollo' },
  { value: 'caja', label: 'Caja' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'litro', label: 'Litro' },
  { value: 'par', label: 'Par' },
  { value: 'set', label: 'Set' },
];

interface SupplyFormData {
  propertyId: string;
  name: string;
  category: string;
  description: string;
  unitCost: string;
  quantity: string;
  unit: string;
  supplier: string;
  purchaseDate: string;
  isRecurring: boolean;
  frequency: string;
}

const defaultFormData: SupplyFormData = {
  propertyId: '',
  name: '',
  category: 'Limpieza',
  description: '',
  unitCost: '',
  quantity: '1',
  unit: 'unidad',
  supplier: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  isRecurring: false,
  frequency: 'mensual',
};

export default function SuppliesManagement() {
  const { properties, supplies, addSupply, updateSupply, deleteSupply } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [formData, setFormData] = useState<SupplyFormData>(defaultFormData);

  // Calculate stats
  const totalSupplies = supplies.length;
  const totalValue = supplies.reduce((sum, s) => sum + (s.unitCost * s.quantity), 0);
  const recurringCount = supplies.filter(s => s.isRecurring).length;
  const propertiesWithSupplies = new Set(supplies.map(s => s.propertyId)).size;

  // Filter supplies
  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch =
      supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProperty = filterProperty === 'all' || supply.propertyId === filterProperty;
    const matchesCategory = filterCategory === 'all' || supply.category === filterCategory;
    
    return matchesSearch && matchesProperty && matchesCategory;
  });

  const getPropertyName = (propertyId: string | number) => {
    const property = properties.find(p => p.id === String(propertyId));
    return property?.title || 'Propiedad no encontrada';
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-700';
  };

  const handleOpenDialog = (supply?: Supply) => {
    if (supply) {
      setEditingSupply(supply);
      setFormData({
        propertyId: String(supply.propertyId),
        name: supply.name,
        category: supply.category,
        description: supply.description || '',
        unitCost: supply.unitCost.toString(),
        quantity: supply.quantity.toString(),
        unit: supply.unit,
        supplier: supply.supplier || '',
        purchaseDate: supply.purchaseDate || new Date().toISOString().split('T')[0],
        isRecurring: supply.isRecurring,
        frequency: supply.frequency || 'mensual',
      });
    } else {
      setEditingSupply(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupply(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyId || !formData.name || !formData.unitCost) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    const supplyData = {
      propertyId: parseInt(formData.propertyId),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      unitCost: parseFloat(formData.unitCost),
      quantity: parseInt(formData.quantity) || 1,
      unit: formData.unit,
      supplier: formData.supplier,
      purchaseDate: formData.purchaseDate,
      isRecurring: formData.isRecurring,
      frequency: formData.isRecurring ? formData.frequency : undefined,
    };

    try {
      if (editingSupply) {
        await updateSupply(editingSupply.id, supplyData);
        toast.success('Insumo actualizado correctamente');
      } else {
        await addSupply(supplyData);
        toast.success('Insumo creado correctamente');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('Error al guardar el insumo');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este insumo?')) {
      try {
        await deleteSupply(id);
        toast.success('Insumo eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el insumo');
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterProperty('all');
    setFilterCategory('all');
  };

  const hasActiveFilters = searchQuery || filterProperty !== 'all' || filterCategory !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
          <p className="text-gray-500">Gestiona los insumos por alojamiento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupply ? 'Editar Insumo' : 'Nuevo Insumo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property */}
              <div className="space-y-2">
                <Label htmlFor="property">Propiedad *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Insumo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Toallas de baño"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional del insumo"
                  rows={2}
                />
              </div>

              {/* Cost and Quantity Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Costo Unitario (CAD) *</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Ej: Costco, Amazon, Walmart"
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Fecha de Compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>

              {/* Recurring */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">Insumo Recurrente</Label>
                  <p className="text-sm text-gray-500">
                    Este insumo se compra periódicamente
                  </p>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isRecurring: checked })
                  }
                />
              </div>

              {/* Frequency (only if recurring) */}
              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia de Compra</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingSupply ? 'Guardar Cambios' : 'Crear Insumo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{totalSupplies}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toLocaleString('es-CA', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recurrentes</p>
                <p className="text-2xl font-bold text-gray-900">{recurringCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Propiedades</p>
                <p className="text-2xl font-bold text-gray-900">{propertiesWithSupplies}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar insumos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterProperty} onValueChange={setFilterProperty}>
                <SelectTrigger className="w-[200px]">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Todas las propiedades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las propiedades</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Insumos
            {filteredSupplies.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredSupplies.length} {filteredSupplies.length === 1 ? 'insumo' : 'insumos'})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSupplies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Insumo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Propiedad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Categoría</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Costo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Cantidad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Proveedor</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Recurrente</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplies.map((supply) => (
                    <tr key={supply.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{supply.name}</p>
                          {supply.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {supply.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">
                            {getPropertyName(supply.propertyId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getCategoryColor(supply.category)}>
                          {getCategoryLabel(supply.category)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-medium text-gray-900">
                          ${supply.unitCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Total: ${(supply.unitCost * supply.quantity).toFixed(2)}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-gray-900">
                          {supply.quantity} {supply.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {supply.supplier ? (
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{supply.supplier}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {supply.isRecurring ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-xs text-gray-500">{supply.frequency}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(supply)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supply.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron insumos
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Comienza agregando tu primer insumo'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => handleOpenDialog()} className="bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Insumo
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
