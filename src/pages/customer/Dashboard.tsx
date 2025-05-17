import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Download, Eye } from 'lucide-react';

// Mock orders
const mockOrders = [
  {
    id: 'ORD-123456',
    date: '2023-05-15',
    status: 'completed',
    total: 899.90,
    items: [
      { id: '1', name: 'Windows 10 Pro', quantity: 1, price: 899.90 }
    ]
  },
  {
    id: 'ORD-123457',
    date: '2023-06-02',
    status: 'processing',
    total: 1299.90,
    items: [
      { id: '2', name: 'Exchange Server 2019 - Standard', quantity: 1, price: 1299.90 }
    ]
  },
  {
    id: 'ORD-123458',
    date: '2023-06-10',
    status: 'completed',
    total: 399.80,
    items: [
      { id: '3', name: 'Microsoft 365 - Pacote Business', quantity: 1, price: 249.90 },
      { id: '4', name: 'Microsoft 365 - Pacote Básico', quantity: 1, price: 149.90 }
    ]
  }
];

// Mock invoices
const mockInvoices = [
  {
    id: 'INV-123456',
    orderId: 'ORD-123456',
    date: '2023-05-15',
    dueDate: '2023-05-15',
    status: 'paid',
    total: 899.90
  },
  {
    id: 'INV-123457',
    orderId: 'ORD-123457',
    date: '2023-06-02',
    dueDate: '2023-06-02',
    status: 'pending',
    total: 1299.90
  },
  {
    id: 'INV-123458',
    orderId: 'ORD-123458',
    date: '2023-06-10',
    dueDate: '2023-06-10',
    status: 'paid',
    total: 399.80
  }
];

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

const Dashboard = () => {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // If not logged in or not a customer, redirect to login
  if (!isLoading && (!isAuthenticated || (user && user.role !== 'customer'))) {
    return <Navigate to="/cliente/login" />;
  }

  // Filter orders
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Filter invoices
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = invoiceFilter === 'all' || invoice.status === invoiceFilter;
    
    return matchesSearch && matchesFilter;
  });

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
              Bem-vindo(a), {profile?.name || user?.email || 'Cliente'}. Gerencie seus pedidos e faturas.
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
                  value="invoices" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-microsoft-blue data-[state=active]:shadow-none rounded-none h-12 px-6"
                >
                  Minhas Faturas
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
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button variant="ghost" size="sm">
                              <Eye size={16} className="mr-1" />
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                          Nenhum pedido encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="invoices" className="p-6">
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar faturas..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fatura
                      </th>
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
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {invoice.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {invoice.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button variant="ghost" size="sm" className="text-microsoft-blue">
                              <Download size={16} className="mr-1" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          Nenhuma fatura encontrada.
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
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo
                      </label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={profile?.name || ''}
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
                        defaultValue={user?.email}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa
                      </label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Alterar senha</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Senha atual
                        </label>
                        <Input
                          id="current-password"
                          name="currentPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
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
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Button className="bg-microsoft-blue hover:bg-microsoft-blue/90">
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Excluir Conta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                    Esta ação não pode ser desfeita.
                  </p>
                  <Button variant="destructive">
                    Excluir Minha Conta
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
