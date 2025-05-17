import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Check, X, User, Download, CheckCheck, Trash2, SquareCheck, SquareX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const AdminDashboard = () => {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectAllOrders, setSelectAllOrders] = useState(false);
  
  // Informações da empresa
  const companyInfo = {
    name: "LicençasPRO, Lda",
    address: "Rua Comandante Gika, n.º 100, Luanda, Angola",
    nif: "5417124080",
    phone: "+244 923 456 789",
    email: "financeiro@licencaspro.ao",
    website: "www.licencaspro.ao"
  };

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated && profile?.role === 'admin') {
      fetchOrders();
      fetchCustomers();
    }
  }, [isAuthenticated, profile]);

  // Effect to handle "select all" functionality
  useEffect(() => {
    if (selectAllOrders) {
      // Select all visible orders after filtering
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      // If manually selecting all items, auto-check the "select all" box
      setSelectAllOrders(true);
    }
  }, [selectAllOrders, orderFilter, orderSearchTerm]);

  const fetchOrders = async () => {
    setFetchingOrders(true);
    try {
      // Fix: Modified query to avoid the foreign key relationship error
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
          user_id
        `)
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      if (ordersData) {
        // Fetch user info for each order
        const ordersWithUserInfo = await Promise.all(ordersData.map(async (order) => {
          // Get user info from profiles table
          const { data: userData } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', order.user_id)
            .single();
            
          // Fetch order items for each order
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, product:product_id(name)')
            .eq('order_id', order.id);
            
          return {
            ...order,
            profiles: userData || { name: 'Cliente Desconhecido', email: 'sem email' },
            items: orderItems || []
          };
        }));
        
        setOrders(ordersWithUserInfo);
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setFetchingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    setFetchingCustomers(true);
    try {
      // Fetch all customers (profiles with role 'customer' or any role)
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (customersError) throw customersError;

      if (customersData) {
        // Count orders for each customer
        const customersWithOrderCount = await Promise.all(customersData.map(async (customer) => {
          const { count, error } = await supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('user_id', customer.id);
            
          return {
            ...customer,
            orders: count || 0
          };
        }));
        
        setCustomers(customersWithOrderCount);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setFetchingCustomers(false);
    }
  };
  
  // If not logged in or not an admin, redirect to login
  if (!isLoading && (!isAuthenticated || (profile && profile.role !== 'admin'))) {
    toast.error('Área restrita. Faça login como administrador.');
    return <Navigate to="/cliente/login" />;
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                          (order.profiles?.name && order.profiles.name.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
                          (order.profiles?.email && order.profiles.email.toLowerCase().includes(orderSearchTerm.toLowerCase()));
    
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    return customer.name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
           customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase());
  });

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      toast.success(`Status do pedido atualizado para: ${status}`);
      
      // If marking as completed and payment is pending, also update payment status
      if (status === 'completed') {
        const order = orders.find(o => o.id === orderId);
        if (order && order.payment_status === 'pending') {
          await handleUpdatePaymentStatus(orderId, 'paid');
        }
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  // Handle payment status update
  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, payment_status: status } : order
      ));
      
      toast.success(`Status de pagamento atualizado para: ${status}`);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação é irreversível.')) {
      return;
    }
    
    try {
      // Delete the customer profile (we won't delete the auth user since that's a more complex operation)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerId);
      
      if (error) throw error;
      
      // Update local state
      setCustomers(customers.filter(customer => customer.id !== customerId));
      
      toast.success('Cliente excluído com sucesso');
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Erro ao excluir cliente.');
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação é irreversível.')) {
      return;
    }
    
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (orderError) throw orderError;
      
      // Update local state
      setOrders(orders.filter(order => order.id !== orderId));
      
      toast.success('Pedido excluído com sucesso');
      
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido');
    }
  };

  // Generate Invoice PDF
  const generateInvoicePDF = async (order: any) => {
    if (!order) {
      toast.error('Dados insuficientes para gerar a fatura');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Get customer profile
      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();

      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar cabeçalho com o logo (pode adicionar um logo real posteriormente)
      doc.setFillColor(0, 114, 206);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('LicençasPRO', 15, 25);
      
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
      doc.text(customerProfile?.name || 'Cliente', 140, 92);
      doc.text(customerProfile?.address || 'Endereço não informado', 140, 97);
      doc.text(`NIF: ${customerProfile?.nif || 'Não informado'}`, 140, 102);
      doc.text(`Tel: ${customerProfile?.phone || 'Não informado'}`, 140, 107);
      doc.text(`Email: ${customerProfile?.email || 'Não informado'}`, 140, 112);
      
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
      doc.text('Obrigado por escolher a LicençasPRO!', 105, 280, { align: 'center' });
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

  // Toggle selection of a single order
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        const newSelected = prev.filter(id => id !== orderId);
        // If we're unselecting an item, uncheck the "select all" box
        if (selectAllOrders) {
          setSelectAllOrders(false);
        }
        return newSelected;
      } else {
        const newSelected = [...prev, orderId];
        // If all visible orders are now selected, check the "select all" box
        if (newSelected.length === filteredOrders.length) {
          setSelectAllOrders(true);
        }
        return newSelected;
      }
    });
  };

  // Toggle selection of all orders
  const toggleSelectAllOrders = () => {
    const newSelectAllState = !selectAllOrders;
    setSelectAllOrders(newSelectAllState);
    
    if (newSelectAllState) {
      // Select all visible orders
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      // Deselect all orders
      setSelectedOrders([]);
    }
  };

  // Handle batch approval of selected orders
  const handleBatchApproveOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Nenhum pedido selecionado');
      return;
    }

    if (!confirm(`Tem certeza que deseja aprovar ${selectedOrders.length} pedidos?`)) {
      return;
    }

    try {
      // Update status to 'completed' for all selected orders
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .in('id', selectedOrders);
      
      if (error) throw error;
      
      // Update payment status to 'paid' for all selected orders that were pending
      const pendingOrders = orders
        .filter(order => selectedOrders.includes(order.id) && order.payment_status === 'pending')
        .map(order => order.id);
        
      if (pendingOrders.length > 0) {
        const { error: paymentError } = await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .in('id', pendingOrders);
          
        if (paymentError) throw paymentError;
      }
      
      // Update local state
      setOrders(orders.map(order => {
        if (selectedOrders.includes(order.id)) {
          return { 
            ...order, 
            status: 'completed',
            payment_status: order.payment_status === 'pending' ? 'paid' : order.payment_status
          };
        }
        return order;
      }));
      
      toast.success(`${selectedOrders.length} pedidos aprovados com sucesso`);
      
      // Clear selection
      setSelectedOrders([]);
      setSelectAllOrders(false);
      
    } catch (error) {
      console.error('Error batch approving orders:', error);
      toast.error('Erro ao aprovar pedidos em lote');
    }
  };

  // Handle batch deletion of selected orders
  const handleBatchDeleteOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Nenhum pedido selecionado');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedOrders.length} pedidos? Esta ação é irreversível.`)) {
      return;
    }

    try {
      // First delete order items for all selected orders
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', selectedOrders);
      
      if (itemsError) throw itemsError;
      
      // Then delete the orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', selectedOrders);
      
      if (ordersError) throw ordersError;
      
      // Update local state
      setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
      
      toast.success(`${selectedOrders.length} pedidos excluídos com sucesso`);
      
      // Clear selection
      setSelectedOrders([]);
      setSelectAllOrders(false);
      
    } catch (error) {
      console.error('Error batch deleting orders:', error);
      toast.error('Erro ao excluir pedidos em lote');
    }
  };

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
            <h1 className="text-3xl font-heading font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Bem-vindo(a), {profile?.name || user?.email || 'Administrador'}. Gerencie pedidos e clientes.
            </p>
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
                  Gerenciar Pedidos
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-microsoft-blue data-[state=active]:shadow-none rounded-none h-12 px-6"
                >
                  Gerenciar Clientes
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="orders" className="p-6">
              {/* Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar pedidos por ID, cliente ou email..."
                    className="pl-10"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={orderFilter} onValueChange={setOrderFilter}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Actions */}
              {selectedOrders.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-md">
                  <span className="text-blue-800 font-medium flex items-center">
                    {selectedOrders.length} {selectedOrders.length === 1 ? 'pedido selecionado' : 'pedidos selecionados'}
                  </span>
                  <div className="flex-grow"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={handleBatchApproveOrders}
                  >
                    <CheckCheck size={16} className="mr-1" />
                    Aprovar Selecionados
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={handleBatchDeleteOrders}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Excluir Selecionados
                  </Button>
                </div>
              )}
              
              {/* Orders Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          id="selectAll"
                          checked={selectAllOrders && filteredOrders.length > 0} 
                          onCheckedChange={toggleSelectAllOrders}
                          aria-label="Selecionar todos os pedidos"
                        />
                      </TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fetchingOrders ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id} className={selectedOrders.includes(order.id) ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                              aria-label={`Selecionar pedido ${order.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>{order.profiles?.name || 'Cliente'}</div>
                            <div className="text-xs text-gray-500">{order.profiles?.email || 'Sem email'}</div>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.payment_status)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(order.total)} kz
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => generateInvoicePDF(order)} 
                                className="text-blue-600"
                              >
                                <Download size={14} className="mr-1" />
                                Fatura
                              </Button>
                              
                              {order.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-600"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  >
                                    <Check size={14} className="mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  >
                                    <X size={14} className="mr-1" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                              
                              {order.payment_status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600"
                                  onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}
                                >
                                  <Check size={14} className="mr-1" />
                                  Pagar
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <X size={14} className="mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          Nenhum pedido encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="p-6">
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar clientes por nome, email ou empresa..."
                    className="pl-10"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Customers Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fetchingCustomers ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-microsoft-light rounded-full flex items-center justify-center mr-3">
                                <User size={16} className="text-microsoft-blue" />
                              </div>
                              {customer.name || 'Sem nome'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.email || 'Sem email'}
                          </TableCell>
                          <TableCell>
                            {customer.phone || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            {customer.nif || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            {customer.orders || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600"
                                onClick={() => handleDeleteCustomer(customer.id)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
