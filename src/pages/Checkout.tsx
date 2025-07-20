
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
      console.log("✅ Pedido criado com sucesso:", orderData.id);

      // Enviar email de confirmação automaticamente
      console.log("🔄 Tentando enviar email de confirmação...");
      try {
        // Buscar dados do pedido e empresa para o email
        const { data: orderDetails, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              price,
              products (name, description)
            )
          `)
          .eq('id', orderData.id)
          .single();

        if (orderError) {
          console.error('❌ Erro ao buscar detalhes do pedido:', orderError);
          throw new Error(`Erro ao buscar pedido: ${orderError.message}`);
        }

        const { data: settings } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (orderDetails && settings) {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmação de Pedido</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: #0072CE; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .order-summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { background: #333; color: white; padding: 20px; text-align: center; }
                .btn { display: inline-block; padding: 12px 25px; background: #0072CE; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${settings.name || 'Nossa Empresa'}</h1>
                  <p>Confirmação de Pedido #${orderData.id.slice(0, 8)}</p>
                </div>
                
                <div class="content">
                  <h2>Olá Cliente,</h2>
                  <p>Obrigado pelo seu pedido! Aqui estão os detalhes:</p>
                  
                  <div class="order-summary">
                    <h3>Resumo do Pedido</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade</th>
                          <th>Preço Unit.</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orderDetails.order_items.map(item => `
                          <tr>
                            <td>${item.products?.name || 'Produto'}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toLocaleString('pt-AO')} AOA</td>
                            <td>${(item.quantity * item.price).toLocaleString('pt-AO')} AOA</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px;">
                      Total: ${orderDetails.total.toLocaleString('pt-AO')} AOA
                    </div>
                  </div>
                  
                  <p><strong>Status do Pagamento:</strong> Pendente</p>
                  <p><strong>Método de Pagamento:</strong> ${orderDetails.payment_method === 'multicaixa_ref' ? 'Referência Multicaixa' : orderDetails.payment_method}</p>
                  
                  <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>📱 Próximos Passos:</h3>
                    <p>1. Use a referência Multicaixa para efetuar o pagamento</p>
                    <p>2. O pagamento será processado automaticamente</p>
                    <p>3. Você receberá uma confirmação quando o pagamento for aprovado</p>
                  </div>
                </div>
                
                <div class="footer">
                  <p>Para dúvidas, entre em contato conosco:</p>
                  <p>Email: ${settings.email || 'contato@empresa.com'} | Telefone: ${settings.phone || '(+244) 000 000 000'}</p>
                  <p>© 2025 ${settings.name || 'Nossa Empresa'}. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const emailResponse = await fetch('https://mail3.angohost.ao/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              subject: `Confirmação de Pedido #${orderData.id.slice(0, 8)} - ${settings.name || 'Nossa Empresa'}`,
              html: emailHtml
            })
          });

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            console.log('✅ Email enviado com sucesso:', emailResult);
            toast.success('Email de confirmação enviado!');
          } else {
            console.error('❌ Erro na API de email:', await emailResponse.text());
          }
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
      }

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
