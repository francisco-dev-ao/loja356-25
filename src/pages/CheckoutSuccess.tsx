import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { InvoicePDFGenerator } from '@/lib/invoice-pdf-generator';
import { formatCurrency, formatPrice } from '@/lib/formatters';
import { sendEmail } from '@/services/email';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  productName?: string;
}

interface Order {
  id: string;
  user_id: string;
  created_at: string;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  items?: OrderItem[];
}

interface CompanyInfo {
  name: string;
  address: string;
  nif: string;
  phone: string;
  email: string;
  website: string;
}

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId') || 'N/A';
  const [seconds, setSeconds] = useState(5);
  const [order, setOrder] = useState<Order | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Informações da empresa
  const companyInfo: CompanyInfo = {
    name: "Office365, Lda",
    address: "Rua Comandante Gika, n.º 100, Luanda, Angola",
    nif: "5417124080",
    phone: "+244 923 456 789",
    email: "financeiro@office365.ao",
    website: "www.office365.ao"
  };

  // Adicionar estado para referência de pagamento
  const [paymentReference, setPaymentReference] = useState<any>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Buscar detalhes do pedido
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (orderError) throw orderError;

        // Buscar itens do pedido
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
          
        if (itemsError) throw itemsError;

        // Buscar detalhes dos produtos
        const productIds = orderItems.map(item => item.product_id);
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
          
        if (productsError) throw productsError;

        // Associar nomes de produtos aos itens do pedido
        const itemsWithProductNames = orderItems.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            productName: product?.name || 'Produto não encontrado'
          };
        });

        // Atualizar o estado com todos os dados do pedido
        const orderWithItems = {
          ...orderData,
          items: itemsWithProductNames
        };
        
        setOrder(orderWithItems);

        // Simular tempo para gerar fatura
        const timer = setInterval(() => {
          setSeconds((prevSeconds) => {
            if (prevSeconds <= 1) {
              clearInterval(timer);
              setIsGenerating(false);
            }
            return prevSeconds - 1;
          });
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        toast.error('Não foi possível carregar os detalhes do pedido');
        setIsGenerating(false);
      }
    };

    if (orderId && orderId !== 'N/A') {
      fetchOrderDetails();
    }

    // Buscar referência de pagamento do localStorage
    if (orderId) {
      const paymentRefData = localStorage.getItem(`payment_ref_${orderId}`);
      if (paymentRefData) {
        setPaymentReference(JSON.parse(paymentRefData));
      }
    }
  }, [orderId]);

  const generateInvoicePDF = async () => {
    if (!order || !profile) {
      toast.error('Dados insuficientes para gerar a fatura');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Get payment reference data if exists
      const paymentRefData = orderId ? localStorage.getItem(`payment_ref_${orderId}`) : null;
      let paymentReference = null;
      if (paymentRefData) {
        paymentReference = JSON.parse(paymentRefData);
      }

      // Create professional PDF
      const pdfGenerator = new InvoicePDFGenerator();
      pdfGenerator.generateProfessionalInvoice({
        order,
        profile,
        companyInfo,
        paymentReference
      });

      // Save the PDF
      pdfGenerator.save(`FATURA-${orderId.substring(0, 8)}.pdf`);

      // Enviar por e-mail
      const pdfBase64 = pdfGenerator.output().split(',')[1];
      await sendEmail({
        to: profile.email,
        subject: 'Sua Proforma/Confirmação de Pedido',
        html: `<p>Olá, ${profile.name || 'cliente'}!<br>Sua Proforma está em anexo.<br>Qualquer dúvida, estamos à disposição.</p>`,
        attachments: [
          {
            filename: `PROFORMA-${orderId.substring(0, 8)}.pdf`,
            content: pdfBase64
          }
        ]
      });
      toast.success('Proforma enviada para seu e-mail!');
    } catch (error) {
      console.error('Erro ao gerar/enviar PDF:', error);
      toast.error('Erro ao gerar ou enviar a Proforma por e-mail');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check size={32} className="text-green-600" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-3">Pedido Confirmado!</h1>
              <p className="text-lg text-muted-foreground mb-0">
                Seu pedido foi recebido e está sendo processado.
              </p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-lg font-medium mb-3">Informações do Pedido</h2>
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Número do Pedido:</span>
                      <span className="font-medium">{order ? `PED-${order.id.substring(0, 8).toUpperCase()}` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">{order ? new Date(order.created_at).toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                        {order?.status === 'pending' ? 'Pendente' : 
                         order?.status === 'processing' ? 'Processando' :
                         order?.status === 'completed' ? 'Completo' : 'Processando'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Método de Pagamento:</span>
                      <span className="font-medium">
                        {order?.payment_method === 'multicaixa_ref' ? 'Multicaixa Referência' : 
                         order?.payment_method === 'bank_transfer' ? 'Transferência Bancária' : 
                         'Não especificado'}
                      </span>
                    </div>
                  </div>

                  {/* Exibir dados da referência Multicaixa se houver */}
                  {order?.payment_method === 'multicaixa_ref' && paymentReference && (
                    <div className="mt-6 border rounded-md p-4 bg-blue-50">
                      <h3 className="font-medium mb-2 text-blue-900 flex items-center gap-2">
                        <span>Referência Multicaixa</span>
                      </h3>
                      <div className="grid grid-cols-1 gap-2 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Entidade:</span>
                          <span className="font-mono font-bold">{paymentReference.entity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Referência:</span>
                          <span className="font-mono font-bold">{paymentReference.reference}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Valor:</span>
                          <span className="font-mono font-bold">{formatPrice(paymentReference.amount)}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="font-medium mb-1">Como pagar:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Vá a um ATM ou Multicaixa Express</li>
                          <li>Selecione "Pagamentos" → "Outros Serviços"</li>
                          <li>Digite a Entidade: <span className="font-mono font-bold">{paymentReference.entity}</span></li>
                          <li>Digite a Referência: <span className="font-mono font-bold">{paymentReference.reference}</span></li>
                          <li>Confirme o valor: <span className="font-mono font-bold">{formatPrice(paymentReference.amount)}</span></li>
                          <li>Confirme o pagamento</li>
                        </ol>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Esta referência é válida por 3 dias. O pagamento será processado automaticamente após a confirmação.
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-medium mb-3">Fatura Profissional</h2>
                  <div className="border rounded-md p-4 text-center">
                    {isGenerating ? (
                      <div className="p-4">
                        <div className="animate-pulse flex flex-col items-center justify-center">
                          <div className="h-10 w-10 mb-3 rounded-full bg-gray-200"></div>
                          <div className="h-4 w-24 mb-2 rounded bg-gray-200"></div>
                          <div className="h-3 w-32 rounded bg-gray-200"></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Preparando fatura... {seconds}s
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4 text-sm">Sua fatura profissional está pronta para download</p>
                        <Button 
                          className="bg-primary hover:bg-primary/90"
                          onClick={generateInvoicePDF}
                          disabled={isGeneratingPdf}
                        >
                          {isGeneratingPdf ? (
                            <span className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Gerando PDF...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Download size={16} className="mr-2" />
                              Baixar Fatura PDF
                            </span>
                          )}
                        </Button>
                        {emailSent && (
                          <p className="mt-4 text-xs text-green-600">
                            Uma confirmação foi enviada para seu email.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6 mb-8">
                <h2 className="text-lg font-medium mb-4">Próximos Passos</h2>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                      1
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium">Verificação do Pagamento</h3>
                      <p className="text-sm text-muted-foreground">
                        Nosso sistema irá verificar o pagamento e confirmar a transação.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                      2
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium">Entrega Digital</h3>
                      <p className="text-sm text-muted-foreground">
                        Você receberá um e-mail com as licenças e instruções de ativação.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                      3
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium">Suporte Técnico</h3>
                      <p className="text-sm text-muted-foreground">
                        Nossa equipe está disponível para ajudar com a instalação e configuração.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={() => navigate('/cliente/login')}>
                  Área do Cliente
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/')}
                >
                  Voltar à Página Inicial
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;