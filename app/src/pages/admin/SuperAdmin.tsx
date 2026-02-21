import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Users,
  TrendingUp,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Tenant {
  id: number;
  companyName: string;
  domain: string;
  customDomain?: string;
  adminEmail: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  paymentStatus: string;
  plan: string;
  billingCycle: string;
  monthlyPrice: number;
  maxProperties: number;
  createdAt: string;
  activatedAt?: string;
  nextPaymentDate?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface Stats {
  active_tenants: number;
  pending_tenants: number;
  suspended_tenants: number;
  monthly_revenue: number;
  annual_revenue: number;
  payments_this_month: number;
}

export default function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchTenants();
    fetchStats();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tenants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedTenant) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tenants/${selectedTenant.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: approvalNotes })
      });
      
      if (response.ok) {
        toast.success(`Cliente ${selectedTenant.companyName} aprobado exitosamente`);
        setShowApprovalModal(false);
        setApprovalNotes('');
        setSelectedTenant(null);
        fetchTenants();
        fetchStats();
      } else {
        toast.error('Error al aprobar cliente');
      }
    } catch (error) {
      console.error('Error approving tenant:', error);
      toast.error('Error al aprobar cliente');
    }
  };

  const handleSuspend = async (tenant: Tenant) => {
    const reason = prompt('Motivo de suspensión:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tenants/${tenant.id}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        toast.success(`Cliente ${tenant.companyName} suspendido`);
        fetchTenants();
        fetchStats();
      } else {
        toast.error('Error al suspender cliente');
      }
    } catch (error) {
      console.error('Error suspending tenant:', error);
      toast.error('Error al suspender cliente');
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const pendingTenants = tenants.filter(t => t.status === 'pending');

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      active: 'bg-green-100 text-green-700 border-green-300',
      suspended: 'bg-red-100 text-red-700 border-red-300',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    const labels = {
      pending: 'Pendiente',
      active: 'Activo',
      suspended: 'Suspendido',
      cancelled: 'Cancelado'
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      starter: 'bg-blue-100 text-blue-700',
      professional: 'bg-purple-100 text-purple-700',
      enterprise: 'bg-orange-100 text-orange-700'
    };
    const labels = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return (
      <Badge className={styles[plan as keyof typeof styles]}>
        {labels[plan as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-500">Panel de Control SaaS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Clientes Activos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.active_tenants}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending_tenants}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ingresos Mensuales</p>
                    <p className="text-3xl font-bold text-teal-600">
                      ${stats.monthly_revenue + (stats.annual_revenue / 12)}
                    </p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pagos este mes</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.payments_this_month}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Approvals Alert */}
        {pendingTenants.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {pendingTenants.length} cliente{pendingTenants.length > 1 ? 's' : ''} pendiente{pendingTenants.length > 1 ? 's' : ''} de aprobación
                </p>
                <p className="text-sm text-yellow-600">
                  Revisa los pagos pendientes y aprueba los clientes que hayan pagado por Zelle o Wire Transfer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, dominio o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Clientes ({filteredTenants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Precio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.companyName}</p>
                          <p className="text-sm text-gray-500">{tenant.domain}</p>
                          <p className="text-sm text-gray-400">{tenant.adminEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getPlanBadge(tenant.plan)}
                        <p className="text-xs text-gray-500 mt-1">
                          {tenant.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(tenant.status)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">${tenant.monthlyPrice}/mes</p>
                        <p className="text-sm text-gray-500">{tenant.maxProperties} propiedades</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-500">
                          Creado: {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                        </p>
                        {tenant.activatedAt && (
                          <p className="text-sm text-green-600">
                            Activo: {new Date(tenant.activatedAt).toLocaleDateString('es-ES')}
                          </p>
                        )}
                        {tenant.nextPaymentDate && (
                          <p className="text-sm text-blue-600">
                            Próximo pago: {new Date(tenant.nextPaymentDate).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {tenant.status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setShowApprovalModal(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                          )}
                          {tenant.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleSuspend(tenant)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Suspender
                            </Button>
                          )}
                          {tenant.status === 'suspended' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setShowApprovalModal(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Reactivar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Approval Modal */}
      {showApprovalModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {selectedTenant.status === 'suspended' ? 'Reactivar' : 'Aprobar'} Cliente
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedTenant.companyName} ({selectedTenant.domain})
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Ej: Pago recibido por Zelle el 15/01/2024"
                className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalNotes('');
                  setSelectedTenant(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
