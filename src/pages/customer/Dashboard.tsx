import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, Save, Lock, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { InvoicePDFGenerator } from '@/lib/invoice-pdf-generator';

const Dashboard = () => {
  const { user, profile, isLoading, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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

  // Informações da empresa
  const companyInfo = {
    name: "Office365, Lda",
    address: "Rua Comandante Gika, n.º 100, Luanda, Angola",
    nif: "5417124080",
    phone: "+244 923 456 789",
    email: "financeiro@office365.ao",
    website: "www.office365.ao"
  };
  
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
        const ordersWithProducts = await Promise.all(ordersData.map(async (order) => {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, product:product_id(name)')
            .eq('order_id', order.id);
            
          return {
            ...order,
            items: orderItems || []
          };
        }));
        
        setOrders(ordersWithProducts);
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
      // Validações específicas para senha
      if (formData.newPassword) {
        // Validar se as senhas coincidem
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          return;
        }
        
        // Validar força da senha
        if (formData.newPassword.length < 8) {
          toast.error('A senha deve ter pelo menos 8 caracteres');
          return;
        }
        
        if (!/[A-Z]/.test(formData.newPassword)) {
          toast.error('A senha deve conter pelo menos uma letra maiúscula');
          return;
        }
        
        if (!/[0-9]/.test(formData.newPassword)) {
          toast.error('A senha deve conter pelo menos um número');
          return;
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
          toast.error('A senha deve conter pelo menos um caractere especial');
          return;
        }
      }
      
      // Update profile information first
      if (formData.name !== profile?.name || formData.phone !== profile?.phone) {
        await updateProfile({
          name: formData.name,
          phone: formData.phone
        });
        toast.success('Dados do perfil atualizados com sucesso');
      }
      
      // Handle password update if provided
      if (formData.newPassword) {
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (error) throw error;
        
        // Limpar campos de senha após sucesso
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
        
        toast.success('Senha alterada com sucesso! Por segurança, faça login novamente.');
        
        // Logout automático após alterar senha
        setTimeout(() => {
          supabase.auth.signOut();
          navigate('/cliente/login');
        }, 2000);
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      console.error('Error updating profile:', error);
    }
  };

  // Generate Invoice PDF with Multicaixa Reference data
  const generateInvoicePDF = async (order: any) => {
    if (!order || !profile) {
      toast.error('Dados insuficientes para gerar a fatura');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Get payment reference data if exists
      const paymentRefData = localStorage.getItem(`payment_ref_${order.id}`);
      let paymentReference = null;
      
      if (paymentRefData) {
        paymentReference = JSON.parse(paymentRefData);
      }

      // Create professional PDF
      const pdfGenerator = new InvoicePDFGenerator();
      pdfGenerator.generateProfessionalInvoice({
        order,
        profile,
        companyInfo,
        paymentReference
      });

      // Save the PDF
      pdfGenerator.save(`FATURA-${order.id.substring(0, 8)}.pdf`);
      toast.success('Fatura profissional gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF da fatura');
    } finally {
      setIsGeneratingPdf(false);
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
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-6"
                >
                  Meus Pedidos
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-6"
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
                            {`PED-${order.id.substring(0, 8).toUpperCase()}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('pt-AO')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.payment_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            KZ {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => console.log(order)}>
                                <Eye size={16} className="mr-1" />
                                Detalhes
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => generateInvoicePDF(order)}
                                disabled={isGeneratingPdf}
                              >
                                {isGeneratingPdf ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                                ) : (
                                  <Download size={16} className="mr-1" />
                                )}
                                Fatura
                              </Button>
                            </div>
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
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
                      <Lock className="mr-2" size={20} />
                      Alterar Senha
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nova senha *
                          </label>
                          <Input
                            id="new-password"
                            name="newPassword"
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          {formData.newPassword && (
                            <div className="mt-2 space-y-1">
                              <div className={`flex items-center text-xs ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                                {formData.newPassword.length >= 8 ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                Pelo menos 8 caracteres
                              </div>
                              <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                                {/[A-Z]/.test(formData.newPassword) ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                Uma letra maiúscula
                              </div>
                              <div className={`flex items-center text-xs ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                                {/[0-9]/.test(formData.newPassword) ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                Um número
                              </div>
                              <div className={`flex items-center text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                                {/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                Um caractere especial
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar nova senha *
                          </label>
                          <Input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repita a senha"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          {formData.confirmPassword && (
                            <div className="mt-2">
                              <div className={`flex items-center text-xs ${formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                {formData.newPassword === formData.confirmPassword ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                {formData.newPassword === formData.confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(formData.newPassword || formData.confirmPassword) && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-center text-amber-800 text-sm">
                          <AlertTriangle size={16} className="mr-2" />
                          <span>Por segurança, você será desconectado após alterar a senha e precisará fazer login novamente.</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="bg-microsoft-blue hover:bg-microsoft-blue/90 flex items-center"
                      disabled={formData.newPassword && (!formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword)}
                    >
                      <Save size={16} className="mr-2" />
                      Salvar Alterações
                    </Button>
                    
                    {(formData.newPassword || formData.confirmPassword) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }))}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Limpar Senha
                      </Button>
                    )}
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