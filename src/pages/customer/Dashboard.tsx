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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Dashboard = () => {
  const { user, profile, isLoading, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
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
    email: "financeiro@licencaspro.ao",
    website: "www.licencaspro.ao"
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

  // Generate Invoice PDF
  const generateInvoicePDF = async (order: any) => {
    if (!order || !profile) {
      toast.error('Dados insuficientes para gerar a fatura');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar cabeçalho com o logo (pode adicionar um logo real posteriormente)
      doc.setFillColor(0, 114, 206);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Office365', 15, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Licenças Microsoft Originais', 105, 25, { align: 'center' });
      
      // Adicionar informações da fatura
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('FATURA', 105, 50, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Número da Fatura:', 15, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`FATURA-${order.id.substring(0, 8).toUpperCase()}`, 55, 60);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data:', 15, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(order.created_at).toLocaleDateString('pt-BR'), 55, 65);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Status de Pagamento:', 15, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(order.payment_status === 'paid' ? 'Pago' : 'Pendente', 55, 70);
      
      // Informações da empresa
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Emitido por:', 15, 85);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(companyInfo.name, 15, 92);
      doc.text(companyInfo.address, 15, 97);
      doc.text(`NIF: ${companyInfo.nif}`, 15, 102);
      doc.text(`Tel: ${companyInfo.phone}`, 15, 107);
      doc.text(`Email: ${companyInfo.email}`, 15, 112);
      doc.text(`Website: ${companyInfo.website}`, 15, 117);
      
      // Informações do cliente
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Faturado a:', 140, 85);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.name || 'Cliente', 140, 92);
      doc.text(profile.address || 'Endereço não informado', 140, 97);
      doc.text(`NIF: ${profile.nif || 'Não informado'}`, 140, 102);
      doc.text(`Tel: ${profile.phone || 'Não informado'}`, 140, 107);
      doc.text(`Email: ${profile.email || 'Não informado'}`, 140, 112);
      
      // Tabela de itens
      if (order.items && order.items.length > 0) {
        const tableColumn = ["Produto", "Qtd", "Preço Unit.", "Total"];
        const tableRows = order.items.map((item: any) => [
          item.product?.name || 'Produto',
          item.quantity,
          `${formatCurrency(item.price)} kz`,
          `${formatCurrency(item.price * item.quantity)} kz`
        ]);
        
        // @ts-ignore
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 130,
          theme: 'grid',
          headStyles: {
            fillColor: [0, 114, 206],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            lineColor: [222, 226, 230]
          },
          columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' }
          }
        });
      }
      
      // Adicionar total
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 150;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', 150, finalY + 10);
      doc.setFontSize(12);
      doc.text(`${formatCurrency(order.total)} kz`, 190, finalY + 10, { align: 'right' });
      
      // Informações de pagamento
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Método de Pagamento:', 15, finalY + 25);
      doc.setFont('helvetica', 'normal');
      const paymentMethod = order.payment_method === 'multicaixa' ? 'Multicaixa Express' : 'Transferência Bancária';
      doc.text(paymentMethod, 60, finalY + 25);
      
      // Notas e termos
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Notas:', 15, finalY + 40);
      doc.setFont('helvetica', 'normal');
      doc.text('1. As licenças são enviadas por email após a confirmação do pagamento.', 15, finalY + 45);
      doc.text('2. Suporte técnico gratuito por 30 dias após a compra.', 15, finalY + 50);
      doc.text('3. Para qualquer dúvida, entre em contato com nossa equipe de suporte.', 15, finalY + 55);
      
      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Obrigado por escolher a Office365!', 105, 280, { align: 'center' });
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 105, 285, { align: 'center' });
      
      // Salvar o PDF
      doc.save(`FATURA-${order.id.substring(0, 8)}.pdf`);
      toast.success('Fatura baixada com sucesso!');
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
