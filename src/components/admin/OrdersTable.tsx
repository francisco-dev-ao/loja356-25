
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const OrderStatus = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';
  let label = '';

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = 'Pendente';
      break;
    case 'processed':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = 'Processado';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Concluído';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Cancelado';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      label = status;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-0`}>
      {label}
    </Badge>
  );
};

const OrderPaymentStatus = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';
  let label = '';

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = 'Pendente';
      break;
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Pago';
      break;
    case 'refunded':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      label = 'Reembolsado';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Cancelado';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      label = status;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-0`}>
      {label}
    </Badge>
  );
};

const PaymentMethod = ({ method }: { method: string }) => {
  let label = '';

  switch (method) {
    case 'bank_transfer':
      label = 'Transferência Bancária';
      break;
    case 'multicaixa_express':
      label = 'Multicaixa Express';
      break;
    default:
      label = method;
  }

  return <span>{label}</span>;
};

const OrderDetails = ({ orderId }: { orderId: string }) => {
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product_id')
        .eq('order_id', orderId);
        
      if (error) throw error;
      
      // Fetch product names
      if (data && data.length > 0) {
        const productIds = data.map(item => item.product_id);
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
          
        return {
          items: data,
          products: products || []
        };
      }
      
      return { items: data || [], products: [] };
    },
  });

  const { data: customer } = useQuery({
    queryKey: ['orderCustomer', order?.user_id],
    queryFn: async () => {
      if (!order?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!order?.user_id,
  });

  const getProductName = (productId: string) => {
    if (!orderItems?.products) return productId;
    const product = orderItems.products.find(p => p.id === productId);
    return product ? product.name : productId;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value);
  };

  if (orderLoading || itemsLoading) {
    return <div className="p-4 text-center">Carregando detalhes do pedido...</div>;
  }

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Informações do Pedido</h3>
          <div className="mt-2 space-y-1">
            <p><span className="font-medium">ID do Pedido:</span> {order?.id}</p>
            <p><span className="font-medium">Data:</span> {order?.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'}</p>
            <p><span className="font-medium">Status:</span> <OrderStatus status={order?.status || ''} /></p>
            <p><span className="font-medium">Método de Pagamento:</span> <PaymentMethod method={order?.payment_method || ''} /></p>
            <p><span className="font-medium">Status do Pagamento:</span> <OrderPaymentStatus status={order?.payment_status || ''} /></p>
            <p><span className="font-medium">Total:</span> {formatCurrency(order?.total || 0)}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Informações do Cliente</h3>
          <div className="mt-2 space-y-1">
            <p><span className="font-medium">Nome:</span> {customer?.name || '—'}</p>
            <p><span className="font-medium">Email:</span> {customer?.email || '—'}</p>
            <p><span className="font-medium">Telefone:</span> {customer?.phone || '—'}</p>
            <p><span className="font-medium">NIF:</span> {customer?.nif || '—'}</p>
            <p><span className="font-medium">Endereço:</span> {customer?.address || '—'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Itens do Pedido</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderItems?.items && orderItems.items.length > 0 ? (
              orderItems.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getProductName(item.product_id)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Nenhum item encontrado</TableCell>
              </TableRow>
            )}
            {order && (
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">Total:</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const OrdersTable = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', currentPage],
    queryFn: async () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + itemsPerPage - 1);
        
      if (error) throw error;
      return data;
    },
  });

  const { data: totalOrders } = useQuery({
    queryKey: ['totalOrders'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      return count || 0;
    },
  });

  const totalPages = Math.ceil((totalOrders || 0) / itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando pedidos...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Erro ao carregar pedidos: {(error as Error).message}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-medium mb-4">Gerenciamento de Pedidos</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Pedido</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Status Pagamento</TableHead>
              <TableHead>Método Pagamento</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                  </TableCell>
                  <TableCell>
                    <OrderStatus status={order.status} />
                  </TableCell>
                  <TableCell>
                    <OrderPaymentStatus status={order.payment_status} />
                  </TableCell>
                  <TableCell>
                    <PaymentMethod method={order.payment_method} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Pedido</DialogTitle>
                          <DialogDescription>
                            Pedido realizado em {order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                          </DialogDescription>
                        </DialogHeader>
                        <OrderDetails orderId={order.id} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">Nenhum pedido encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Logic for showing pagination items
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default OrdersTable;
