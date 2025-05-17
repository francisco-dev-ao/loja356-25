
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Download, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';

const Dashboard = () => {
  const { user, profile, isLoading, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const navigate = useNavigate();
  
  // Form state for profile update
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Fetch user's orders
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);
  
  const fetchOrders = async () => {
    if (!user) return;
    
    setFetchingOrders(true);
    try {
      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          updated_at,
          status, 
          payment_status, 
          payment_method, 
          total,
          order_items (
            id,
            product_id,
            quantity,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      // Fetch product details for order items
      if (ordersData) {
        setOrders(ordersData);
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar seus pedidos');
    } finally {
      setFetchingOrders(false);
    }
  };
  
  // Handle profile form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit profile updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Update profile information
      await updateProfile({
        name: formData.name,
        phone: formData.phone
      });
      
      // Handle password update if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          return;
        }
        
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (error) throw error;
        toast.success('Senha atualizada com sucesso');
      }
      
      toast.success('Dados atualizados com sucesso');
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      console.error('Error updating profile:', error);
    }
  };
  
  // If not logged in or not a customer, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/cliente/login" />;
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return (
          <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full font-medium">
            {status === 'completed' ? 'Concluído' : 'Pago'}
          </span>
        );
      case 'processing':
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded-full font-medium">
            {status === 'processing' ? 'Processando' : 'Pendente'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full font-medium">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full font-medium">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/4 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded max-w-3xl mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Área do Cliente</h1>
            <p className="text-muted-foreground">
              Bem-vindo(a), {profile?.name || user?.email || 'Cliente'}. Gerencie seus pedidos e dados.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={() => setActiveTab('account')}>
              Minha Conta
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="h-12">
                <TabsTrigger 
                  value="orders" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-microsoft-blue data-[state=active]:shadow-none rounded-none h-12 px-6"
                >
                  Meus Pedidos
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-microsoft-blue data-[state=active]:shadow-none rounded-none h-12 px-6"
                >
                  Meus Dados
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="orders" className="p-6">
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar pedidos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={orderFilter} onValueChange={setOrderFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fetchingOrders ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {order.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.payment_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(order.total)} kz
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button variant="ghost" size="sm" onClick={() => console.log(order)}>
                              <Eye size={16} className="mr-1" />
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          {searchTerm || orderFilter !== 'all' 
                            ? 'Nenhum pedido encontrado com os filtros aplicados.' 
                            : 'Você ainda não fez nenhum pedido.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="account" className="p-6">
              <div className="max-w-xl">
                <h2 className="text-xl font-heading font-semibold mb-4">Meus Dados</h2>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Alterar senha</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nova senha
                          </label>
                          <Input
                            id="new-password"
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar nova senha
                          </label>
                          <Input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Button type="submit" className="bg-microsoft-blue hover:bg-microsoft-blue/90">
                      <Save size={16} className="mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
