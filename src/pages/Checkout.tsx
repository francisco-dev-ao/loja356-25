
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
import MulticaixaExpressPayment from '@/components/checkout/MulticaixaExpressPayment';
import { sendEmail } from '@/services/email';


const Checkout = () => {
  const { items, total, finalTotal, clearCart, appliedCoupon } = useCart();
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [paymentMethod, setPaymentMethod] = useState('multicaixa_ref');
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

      // Set order ID for payment processing - referência será gerada no componente de pagamento
      setOrderId(orderData.id);
      
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || 'Ocorreu um erro ao processar o pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para enviar email de confirmação com referência real
  const sendOrderConfirmationWithReference = async (orderId: string, referenceData: any) => {
    console.log("🔄 Enviando email com referência real:", referenceData);
    
    try {
      // Buscar dados do perfil do usuário para nome completo
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const customerName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente';
      
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
        .eq('id', orderId)
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

      if (orderDetails && settings && referenceData) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmação de Pedido</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
              .header { background: #0072CE; color: white; padding: 24px; text-align: center; }
              .content { padding: 32px; }
              .payment-info { background: #f8fafc; border: 2px solid #0072CE; border-radius: 8px; padding: 24px; margin: 24px 0; }
              .payment-data { font-family: monospace; font-size: 18px; font-weight: bold; color: #0072CE; }
              .instructions { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 20px; margin: 20px 0; }
              .footer { background: #f8f9fa; color: #6c757d; padding: 20px; text-align: center; border-top: 1px solid #dee2e6; }
              .order-summary { margin: 20px 0; }
              .total { font-size: 20px; font-weight: bold; color: #0072CE; text-align: right; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${settings.name || 'Nossa Empresa'}</h1>
                <p>Confirmação de Pedido #${orderId.slice(0, 8)}</p>
              </div>
              
              <div class="content">
                <h2>Olá ${customerName},</h2>
                <p>Obrigado pelo seu pedido! Para efetuar o pagamento, utilize os dados abaixo:</p>
                
                <div class="payment-info">
                  <h3 style="margin-top: 0; color: #0072CE;">📱 Dados para Pagamento Multicaixa</h3>
                  <p style="margin: 12px 0;"><strong>Entidade:</strong> <span class="payment-data">${referenceData.entity}</span></p>
                  <p style="margin: 12px 0;"><strong>Referência:</strong> <span class="payment-data">${referenceData.reference}</span></p>
                  <p style="margin: 12px 0;"><strong>Valor:</strong> <span class="payment-data">${orderDetails.total.toLocaleString('pt-AO')} AOA</span></p>
                </div>
                
                <div class="instructions">
                  <h3 style="margin-top: 0; color: #856404;">📋 Instruções de Pagamento</h3>
                  <ol style="margin: 0; padding-left: 20px;">
                    <li><strong>Via Multicaixa Express (ATM):</strong> Selecione "Pagamentos" → "Entidade" → Digite ${referenceData.entity} → Insira a referência ${referenceData.reference} → Confirme o valor</li>
                    <li><strong>Via Multicaixa Express Mobile:</strong> Abra o app → "Pagamentos" → "Por Referência" → Entidade ${referenceData.entity} → Insira a referência ${referenceData.reference}</li>
                    <li><strong>Via Internet Banking:</strong> Acesse seu banco online → Pagamentos → Entidade ${referenceData.entity} → Referência ${referenceData.reference}</li>
                  </ol>
                  <p style="margin: 15px 0 0 0; font-weight: bold; color: #856404;">⚠️ Importante: O pagamento deve ser efetuado no prazo de 3 dias.</p>
                </div>
                
                <div class="order-summary">
                  <h3>Resumo do Pedido</h3>
                  ${orderDetails.order_items.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <span>${item.products?.name || 'Produto'} (${item.quantity}x)</span>
                      <span>${(item.quantity * item.price).toLocaleString('pt-AO')} AOA</span>
                    </div>
                  `).join('')}
                  <div class="total">Total: ${orderDetails.total.toLocaleString('pt-AO')} AOA</div>
                </div>
                
                <p><strong>Status:</strong> Aguardando Pagamento</p>
                <p><strong>Método:</strong> Referência Multicaixa</p>
              </div>
              
              <div class="footer">
                <p><strong>Suporte ao Cliente</strong></p>
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
            subject: `Confirmação de Pedido #${orderId.slice(0, 8)} - Ref: ${referenceData.reference}`,
            html: emailHtml
          })
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          console.log('✅ Email com referência enviado:', emailResult);
          toast.success('Email de confirmação enviado com referência!');
        } else {
          console.error('❌ Erro na API de email:', await emailResponse.text());
        }
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
    }
  };

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
  };

  // Função para gerar descrição amigável do pedido
  const generateOrderDescription = () => {
    if (!items || items.length === 0) {
      return 'Licença Microsoft';
    }
    return items[0].name || 'Licença Microsoft';
  };

  // Função para enviar email profissional com dados da referência e confirmação do pedido
  const sendOrderConfirmationEmail = async (userEmail: string, userName: string, referenceData: any, productName: string) => {
    const subject = `Confirmação do Pedido - Referência Multicaixa (${referenceData.reference})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: #0072CE; color: #fff; padding: 24px 32px;">
          <h2 style="margin: 0; font-size: 24px;">Confirmação do Pedido</h2>
        </div>
        <div style="padding: 32px;">
          <p>Olá <strong>${userName || 'Cliente'}</strong>,</p>
          <p>Obrigado pelo seu pedido! Aqui estão os dados para pagamento:</p>
          <div style="background: #f1f5f9; border-radius: 6px; padding: 20px; margin: 24px 0; font-size: 16px;">
            <p style="margin: 0 0 8px 0;"><strong>Entidade:</strong> <span style="font-family: monospace; font-size: 18px;">${referenceData.entity}</span></p>
            <p style="margin: 0 0 8px 0;"><strong>Referência:</strong> <span style="font-family: monospace; font-size: 18px;">${referenceData.reference}</span></p>
            <p style="margin: 0 0 8px 0;"><strong>Valor:</strong> <span style="font-family: monospace; font-size: 18px;">${Number(referenceData.amount).toLocaleString('pt-AO')} AOA</span></p>
          </div>
          <h3 style="margin-top: 32px; color: #0072CE;">Instruções de Pagamento</h3>
          <ol style="padding-left: 20px; color: #374151; font-size: 15px;">
            <li>Vá a um ATM ou Multicaixa Express</li>
            <li>Selecione "Pagamentos" → "Outros Serviços"</li>
            <li>Digite a Entidade: <strong>${referenceData.entity}</strong></li>
            <li>Digite a Referência: <strong>${referenceData.reference}</strong></li>
            <li>Confirme o valor: <strong>${Number(referenceData.amount).toLocaleString('pt-AO')} AOA</strong></li>
            <li>Confirme o pagamento</li>
          </ol>
          <p style="margin-top: 32px; color: #64748b; font-size: 13px;">Esta referência é válida por 3 dias. O pagamento será processado automaticamente após a confirmação.</p>
          <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Se tiver dúvidas, basta responder este email ou entrar em contato pelo WhatsApp: <strong>+244 923 456 789</strong></p>
        </div>
        <div style="background: #f1f5f9; color: #64748b; text-align: center; padding: 16px 0; font-size: 13px;">&copy; 2025 Office365, Lda</div>
      </div>
    `;
    await sendEmail({
      to: userEmail,
      subject,
      html
    });
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
                        description={generateOrderDescription()}
                        orderId={orderId}
                        onSuccess={async (referenceData) => {
                          // Enviar email com referência real
                          if (orderId) {
                            await sendOrderConfirmationWithReference(orderId, referenceData);
                          }
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

                    {paymentMethod === 'multicaixa_express' && (
                      <MulticaixaExpressPayment
                        amount={finalTotal}
                        description={generateOrderDescription()}
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
