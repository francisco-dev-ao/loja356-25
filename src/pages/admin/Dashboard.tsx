import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Check, X, User } from 'lucide-react';

// Mock orders
const mockOrders = [
  {
    id: 'ORD-123456',
    customer: {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@example.com'
    },
    date: '2023-05-15',
    status: 'completed',
    total: 899.90,
    items: [
      { id: '1', name: 'Windows 10 Pro', quantity: 1, price: 899.90 }
    ]
  },
  {
    id: 'ORD-123457',
    customer: {
      id: '2',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com'
    },
    date: '2023-06-02',
    status: 'pending',
    total: 1299.90,
    items: [
      { id: '2', name: 'Exchange Server 2019 - Standard', quantity: 1, price: 1299.90 }
    ]
  },
  {
    id: 'ORD-123458',
    customer: {
      id: '3',
      name: 'Paulo Santos',
      email: 'paulo.santos@example.com'
    },
    date: '2023-06-10',
    status: 'completed',
    total: 399.80,
    items: [
      { id: '3', name: 'Microsoft 365 - Pacote Business', quantity: 1, price: 249.90 },
      { id: '4', name: 'Microsoft 365 - Pacote Básico', quantity: 1, price: 149.90 }
    ]
  },
  {
    id: 'ORD-123459',
    customer: {
      id: '4',
      name: 'Ana Pereira',
      email: 'ana.pereira@example.com'
    },
    date: '2023-06-15',
    status: 'pending',
    total: 1099.90,
    items: [
      { id: '5', name: 'Windows 11 Pro', quantity: 1, price: 1099.90 }
    ]
  }
];

// Mock customers
const mockCustomers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    company: 'Tech Solutions',
    orders: 1
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@example.com',
    phone: '(21) 97654-3210',
    company: 'Design Studio',
    orders: 1
  },
  {
    id: '3',
    name: 'Paulo Santos',
    email: 'paulo.santos@example.com',
    phone: '(31) 96543-2109',
    company: 'Marketing Agency',
    orders: 1
  },
  {
    id: '4',
    name: 'Ana Pereira',
    email: 'ana.pereira@example.com',
    phone: '(41) 95432-1098',
    company: 'Retail Store',
    orders: 1
  },
  {
    id: '5',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@example.com',
    phone: '(51) 94321-0987',
    company: 'Consulting Group',
    orders: 0
  }
];

// Status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full font-medium">
          Concluído
        </span>
      );
    case 'pending':
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded-full font-medium">
          Pendente
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

const AdminDashboard = () => {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [orders, setOrders] = useState(mockOrders);
  
  // If not logged in or not an admin, redirect to login
  if (!isLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
    return <Navigate to="/cliente/login" />;
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                          order.customer.email.toLowerCase().includes(orderSearchTerm.toLowerCase());
    
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Filter customers
  const filteredCustomers = mockCustomers.filter(customer => {
    return customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
           customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
           customer.company.toLowerCase().includes(customerSearchTerm.toLowerCase());
  });

  const handleApproveOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'completed' } : order
    ));
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
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
              <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
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
                        Cliente
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div>{order.customer.name}</div>
                            <div className="text-xs text-gray-500">{order.customer.email}</div>
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
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm" className="text-blue-600">
                                <FileText size={14} className="mr-1" />
                                Detalhes
                              </Button>
                              {order.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-600"
                                    onClick={() => handleApproveOrder(order.id)}
                                  >
                                    <Check size={14} className="mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600"
                                    onClick={() => handleRejectOrder(order.id)}
                                  >
                                    <X size={14} className="mr-1" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          Nenhum pedido encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedidos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-microsoft-light rounded-full flex items-center justify-center mr-3">
                                <User size={16} className="text-microsoft-blue" />
                              </div>
                              {customer.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {customer.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {customer.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {customer.orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Excluir
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
