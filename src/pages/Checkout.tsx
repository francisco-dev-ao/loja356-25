import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, CreditCard, Send, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import CartItem from '@/components/cart/CartItem';
import { toast } from 'sonner';
import MulticaixaExpressPayment from '@/components/checkout/MulticaixaExpressPayment';
import BankTransferPayment from '@/components/checkout/BankTransferPayment';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirecionar para o carrinho se estiver vazio
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrinho');
    }
  }, [items, navigate]);

  // Definir a aba ativa com base no estado de autenticação
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('payment');
    }
  }, [isAuthenticated]);

  const handleCreateOrder = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Por favor, faça login para finalizar sua compra');
      setActiveTab('account');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }

    if (!paymentMethod) {
      toast.error('Por favor, selecione um método de pagamento');
      return;
    }

    setIsProcessing(true);

    try {
      // Criar um novo pedido na base de dados
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'bank_transfer' ? 'pending' : 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      // Inserir itens do pedido
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error(`Erro ao adicionar itens ao pedido: ${itemsError.message}`);
      }

      setOrderId(orderData.id);
      console.log("Pedido criado com sucesso:", orderData.id);

      // Se o método de pagamento for transferência bancária, redirecionar imediatamente para a página de sucesso
      if (paymentMethod === 'bank_transfer') {
        navigate(`/checkout/success?orderId=${orderData.id}`);
        clearCart();
      }
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || 'Ocorreu um erro ao processar o pedido');
      setIsProcessing(false);
    }
  };

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
  };
  
  // Redirecionar para a página principal se não houver itens no carrinho
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-page py-12 text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Checkout</h1>
          <p className="mb-8">Seu carrinho está vazio. Adicione produtos antes de prosseguir.</p>
          <Button onClick={() => navigate('/produtos')}>
            Ver Produtos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/carrinho')} 
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar ao carrinho
          </Button>
          <h1 className="text-3xl font-heading font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Etapas do checkout */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'account' || isAuthenticated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} mr-2`}>
                  {isAuthenticated ? <Check size={16} /> : 1}
                </div>
                <div>
                  <h2 className="font-medium">Conta</h2>
                  {isAuthenticated ? (
                    <p className="text-sm text-muted-foreground">
                      Logado como {profile?.name || user?.email}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Login ou cadastro
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'payment' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} mr-2`}>
                  2
                </div>
                <div>
                  <h2 className="font-medium">Pagamento</h2>
                  <p className="text-sm text-muted-foreground">
                    Escolha o método de pagamento
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account" disabled={isAuthenticated}>Conta</TabsTrigger>
                  <TabsTrigger value="payment" disabled={!isAuthenticated}>Pagamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account">
                  {!isAuthenticated && (
                    <CardContent className="p-6">
                      <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid grid-cols-2 mb-6">
                          <TabsTrigger value="login">Login</TabsTrigger>
                          <TabsTrigger value="register">Cadastro</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login">
                          <LoginForm redirectAfter={false} />
                        </TabsContent>
                        
                        <TabsContent value="register">
                          <RegisterForm redirectAfter={false} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  )}
                </TabsContent>
                
                <TabsContent value="payment">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Método de Pagamento</h3>
                    
                    {/* Seção de escolha de método de pagamento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Card 
                        className={`border cursor-pointer transition-all duration-200 ease-in-out
                          ${paymentMethod === 'multicaixa' 
                            ? 'border-microsoft-blue bg-microsoft-light/20 shadow-md' 
                            : 'hover:border-microsoft-blue/50 hover:bg-microsoft-light/10 hover:shadow-md'
                          }`}
                        onClick={() => handleSelectPaymentMethod('multicaixa')}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-microsoft-light rounded-full flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
                                <CreditCard size={20} className="text-microsoft-blue" />
                              </div>
                              <div>
                                <h4 className="font-medium">Multicaixa Express</h4>
                                <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`border cursor-pointer transition-all duration-200 ease-in-out
                          ${paymentMethod === 'bank_transfer' 
                            ? 'border-microsoft-blue bg-microsoft-light/20 shadow-md' 
                            : 'hover:border-microsoft-blue/50 hover:bg-microsoft-light/10 hover:shadow-md'
                          }`}
                        onClick={() => handleSelectPaymentMethod('bank_transfer')}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-microsoft-light rounded-full flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
                                <Send size={20} className="text-microsoft-blue" />
                              </div>
                              <div>
                                <h4 className="font-medium">Transferência Bancária</h4>
                                <p className="text-sm text-muted-foreground">Processamento em até 24h</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Botão Finalizar Pedido */}
                    {paymentMethod && !isProcessing && !orderId && (
                      <Button 
                        onClick={handleCreateOrder}
                        className="w-full"
                        disabled={!paymentMethod || isProcessing}
                      >
                        Finalizar Pedido
                      </Button>
                    )}

                    {/* Exibir o componente de pagamento apropriado após a criação do pedido */}
                    {isProcessing && !orderId ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-microsoft-blue border-t-transparent rounded-full mb-4"></div>
                        <p>Criando pedido...</p>
                      </div>
                    ) : (
                      <>
                        {paymentMethod === 'multicaixa' && orderId && (
                          <MulticaixaExpressPayment 
                            amount={total} 
                            orderId={orderId} 
                          />
                        )}
                        
                        {paymentMethod === 'bank_transfer' && orderId && (
                          <BankTransferPayment />
                        )}
                      </>
                    )}
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Resumo do Pedido</h3>
                  <Badge variant="outline" className="text-xs px-2 py-1 rounded">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
                
                <div className="max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 bg-gray-100 rounded mr-3 flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Qtd: {item.quantity}
                          </span>
                          <span className="text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                        {item.base_price && item.base_price > item.price && (
                          <div className="mt-1">
                            <Badge variant="destructive" className="text-xs">
                              -{Math.round(((item.base_price - item.price) / item.base_price) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de processamento</span>
                    <span>Grátis</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-xl text-microsoft-blue">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
