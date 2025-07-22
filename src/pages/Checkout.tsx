// ✅ Checkout.tsx atualizado com envio de e-mail robusto

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
import { apiClient } from '@/lib/api-client';

// Components
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import PaymentMethods from '@/components/checkout/PaymentMethods';
import AccountTabs from '@/components/checkout/AccountTabs';
import MulticaixaRefPayment from '@/components/checkout/MulticaixaRefPayment';
import MulticaixaExpressPayment from '@/components/checkout/MulticaixaExpressPayment';

const Checkout = () => {
  const { items, total, finalTotal, clearCart, appliedCoupon } = useCart();
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [paymentMethod, setPaymentMethod] = useState('multicaixa_ref');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) navigate('/carrinho');
  }, [items]);

  useEffect(() => {
    if (isAuthenticated) setActiveTab('payment');
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
      const { data: orderData, error: orderError } = await apiClient.createOrder({
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: finalTotal,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      });

      if (orderError) throw new Error(`Erro ao criar pedido: ${orderError}`);

      localStorage.setItem('latest_order_id', (orderData as any).id);
      setOrderId((orderData as any).id);
      console.log("✅ Pedido criado com sucesso:", (orderData as any).id);

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || 'Erro ao processar o pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendOrderConfirmationWithReference = async (orderId: string, referenceData: any) => {
    console.log("🔄 Enviando email com referência:", referenceData);
    try {
      const customerName = user?.name || 'Cliente';
      
      // Use the API client to send order confirmation
      const { error } = await apiClient.sendOrderConfirmation({
        orderId,
        customerEmail: user?.email || '',
        customerName
      });

      if (error) {
        console.error('❌ Falha no envio:', error);
        toast.error('Erro ao enviar email!');
        return;
      }

      console.log('✅ Email enviado com sucesso');
      toast.success('Email de confirmação enviado!');

    } catch (err: any) {
      console.error('❌ Erro no envio de email:', err.message || err);
      toast.error('Erro inesperado no envio de email.');
    }
  };

  const handleSelectPaymentMethod = (method: string) => setPaymentMethod(method);
  const generateOrderDescription = () => (items[0]?.name || 'Licença Microsoft');

  if (items.length === 0) return (
    <Layout>
      <div className="container-page py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="mb-8">Seu carrinho está vazio.</p>
        <Button onClick={() => navigate('/produtos')}>Ver Produtos</Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/carrinho')} className="mr-4">
            <ArrowLeft size={16} className="mr-2" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutSteps activeTab={activeTab} isAuthenticated={isAuthenticated} profile={profile} userEmail={user?.email} />
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="account" disabled={isAuthenticated}>Conta</TabsTrigger>
                  <TabsTrigger value="payment" disabled={!isAuthenticated}>Pagamento</TabsTrigger>
                </TabsList>
                <TabsContent value="account">{!isAuthenticated && <AccountTabs />}</TabsContent>
                <TabsContent value="payment">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Método de Pagamento</h3>
                    <PaymentMethods paymentMethod={paymentMethod} onSelectPaymentMethod={handleSelectPaymentMethod} />
                    {paymentMethod === 'multicaixa_ref' && (
                      <>
                        {!orderId ? (
                          <Button onClick={handleCreateOrder} disabled={isProcessing}>
                            {isProcessing ? 'Criando pedido...' : 'Finalizar Pedido'}
                          </Button>
                        ) : (
                          <MulticaixaRefPayment />
                        )}
                      </>
                    )}
                    {paymentMethod === 'multicaixa_express' && (
                      <MulticaixaExpressPayment amount={finalTotal} description={generateOrderDescription()} />
                    )}
                    {!paymentMethod && (
                      <Button onClick={handleCreateOrder} className="w-full" disabled={isProcessing}>
                        {isProcessing ? 'Criando pedido...' : 'Finalizar Pedido'}
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <CheckoutSummary items={items} total={finalTotal} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
