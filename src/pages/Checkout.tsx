
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import PaymentMethods from '@/components/checkout/PaymentMethods';
import AccountTabs from '@/components/checkout/AccountTabs';
import MulticaixaRefPayment from '@/components/checkout/MulticaixaRefPayment';

const Checkout = () => {
  const { items, total, finalTotal, clearCart, appliedCoupon } = useCart();
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrinho');
    }
  }, [items, navigate]);

  // Set active tab based on authentication state
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
      // Create a new order in the database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: finalTotal,
          subtotal: total,
          discount_amount: appliedCoupon ? (total - finalTotal) : 0,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      // Insert order items
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

      // Store latest order ID in local storage so it can be accessed if needed
      localStorage.setItem('latest_order_id', orderData.id);
      
      setOrderId(orderData.id);
      console.log("Pedido criado com sucesso:", orderData.id);

      // Set order ID for payment processing
      setOrderId(orderData.id);
      
      // Update order with payment reference after payment
      if (paymentMethod === 'multicaixa_ref') {
        // Payment will be processed in the MulticaixaRefPayment component
      }
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || 'Ocorreu um erro ao processar o pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
  };

  // Redirect to home page if cart is empty
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
          {/* Checkout steps and payment section */}
          <div className="lg:col-span-2">
            <CheckoutSteps 
              activeTab={activeTab} 
              isAuthenticated={isAuthenticated} 
              profile={profile} 
              userEmail={user?.email}
            />

            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account" disabled={isAuthenticated}>Conta</TabsTrigger>
                  <TabsTrigger value="payment" disabled={!isAuthenticated}>Pagamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account">
                  {!isAuthenticated && <AccountTabs />}
                </TabsContent>
                
                <TabsContent value="payment">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Método de Pagamento</h3>
                    
                    <PaymentMethods 
                      paymentMethod={paymentMethod} 
                      onSelectPaymentMethod={handleSelectPaymentMethod} 
                    />

                    {paymentMethod === 'multicaixa_ref' && (
                      <MulticaixaRefPayment
                        amount={finalTotal}
                        description={`Pedido ${orderId || 'checkout'}`}
                        orderId={orderId}
                        onSuccess={() => {
                          if (orderId) {
                            navigate(`/checkout/success?orderId=${orderId}`);
                            clearCart();
                          } else {
                            handleCreateOrder();
                          }
                        }}
                        onError={(error) => {
                          toast.error(`Erro no pagamento: ${error}`);
                        }}
                      />
                    )}

                    {!paymentMethod && (
                      <Button 
                        onClick={handleCreateOrder}
                        className="w-full"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Criando pedido...' : 'Finalizar Pedido'}
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary items={items} total={finalTotal} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
