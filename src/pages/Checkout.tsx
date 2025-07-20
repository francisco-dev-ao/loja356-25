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
import { supabase } from '@/integrations/supabase/client';

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
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        total: finalTotal,
        subtotal: total,
        discount_amount: appliedCoupon ? (total - finalTotal) : 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending'
      }).select().single();

      if (orderError) throw new Error(`Erro ao criar pedido: ${orderError.message}`);

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(`Erro ao adicionar itens ao pedido: ${itemsError.message}`);

      localStorage.setItem('latest_order_id', orderData.id);
      setOrderId(orderData.id);
      console.log("✅ Pedido criado com sucesso:", orderData.id);

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
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const customerName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente';
      const { data: orderDetails } = await supabase.from('orders').select(`*, order_items ( quantity, price, products (name, description) )`).eq('id', orderId).single();
      const { data: settings } = await supabase.from('settings').select('*').limit(1).single();

      if (!orderDetails || !settings || !referenceData) {
        toast.error('Dados insuficientes para envio de email.');
        return;
      }

      let validadeStr = '';
      if (orderDetails?.created_at) {
        const validade = new Date(orderDetails.created_at);
        validade.setDate(validade.getDate() + 3);
        validadeStr = `${validade.toLocaleDateString('pt-PT')} ${validade.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      }

      // Montar tabela de itens do pedido
      let itemsTable = `<table style='width:100%;border-collapse:collapse;margin-top:16px;'>
        <thead>
          <tr>
            <th style='border:1px solid #ddd;padding:8px;text-align:left;'>Produto</th>
            <th style='border:1px solid #ddd;padding:8px;text-align:left;'>Descrição</th>
            <th style='border:1px solid #ddd;padding:8px;text-align:center;'>Qtd</th>
            <th style='border:1px solid #ddd;padding:8px;text-align:right;'>Valor Unitário</th>
            <th style='border:1px solid #ddd;padding:8px;text-align:right;'>Subtotal</th>
          </tr>
        </thead>
        <tbody>`;
      for (const item of orderDetails.order_items) {
        itemsTable += `<tr>
          <td style='border:1px solid #ddd;padding:8px;'>${item.products?.name || '-'}</td>
          <td style='border:1px solid #ddd;padding:8px;'>${item.products?.description || '-'}</td>
          <td style='border:1px solid #ddd;padding:8px;text-align:center;'>${item.quantity}</td>
          <td style='border:1px solid #ddd;padding:8px;text-align:right;'>${Number(item.price).toLocaleString('pt-AO')} AOA</td>
          <td style='border:1px solid #ddd;padding:8px;text-align:right;'>${Number(item.price * item.quantity).toLocaleString('pt-AO')} AOA</td>
        </tr>`;
      }
      itemsTable += `</tbody></table>`;

      // Montar HTML do e-mail
      const html = `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;">
          <h2 style="color:#2d3748;">Olá, ${customerName}!</h2>
          <p>Seu pedido foi confirmado com sucesso. Seguem os detalhes:</p>
          <hr style="margin:16px 0;"/>
          <p><strong>Entidade:</strong> ${referenceData.entity}</p>
          <p><strong>Referência:</strong> ${referenceData.reference}</p>
          <p><strong>Valor:</strong> ${Number(referenceData.amount).toLocaleString('pt-AO')} AOA</p>
          <p><strong>Validade:</strong> ${validadeStr}</p>
          <hr style="margin:16px 0;"/>
          <h3 style="margin-bottom:8px;">Itens do Pedido</h3>
          ${itemsTable}
          <p style="margin-top:16px;"><strong>Total:</strong> ${Number(referenceData.amount).toLocaleString('pt-AO')} AOA</p>
          <hr style="margin:16px 0;"/>
          <p style="margin-top:16px;">Se tiver qualquer dúvida, basta responder a este e-mail.<br/>Agradecemos pela sua preferência!</p>
          <p style="margin-top:24px;font-size:13px;color:#888;">Atenciosamente,<br/>Equipe ${settings?.name || 'Loja 356'}</p>
        </div>
      `;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('https://mail3.angohost.ao/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          to: user.email,
          subject: `Pedido #${orderId.slice(0, 8)} - Ref: ${referenceData.reference}`,
          html
        })
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Falha no envio:', errorText);
        toast.error('Erro ao enviar email!');
        return;
      }

      const result = await response.json();
      console.log('✅ Email enviado:', result);
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
                          <MulticaixaRefPayment
                            amount={finalTotal}
                            description={generateOrderDescription()}
                            orderId={orderId}
                            onSuccess={async (referenceData) => {
                              await sendOrderConfirmationWithReference(orderId, referenceData);
                              navigate(`/checkout/success?orderId=${orderId}`);
                              clearCart();
                            }}
                            onError={(err) => toast.error(`Erro no pagamento: ${err}`)}
                          />
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
