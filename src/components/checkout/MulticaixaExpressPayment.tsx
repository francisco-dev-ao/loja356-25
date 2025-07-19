import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Globe, Copy, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { 
  createMulticaixaExpressPayment,
  verifyMulticaixaExpressPayment,
  getMulticaixaExpressPaymentUrl,
  type MulticaixaExpressRequest,
  type MulticaixaExpressResponse
} from '@/services/payment/multicaixa-express';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

interface MulticaixaExpressPaymentProps {
  amount: number;
  description: string;
  orderId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const MulticaixaExpressPayment = ({ 
  amount, 
  description, 
  orderId,
  onSuccess, 
  onError 
}: MulticaixaExpressPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<MulticaixaExpressResponse | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { items } = useCart();
  const { user, profile } = useAuth();

  const handleCreatePayment = async () => {
    if (!user || !profile) {
      onError('Dados do usuário não encontrados');
      return;
    }

    setIsLoading(true);

    try {
      const customerName = profile.name || 'Cliente';

      console.log('💰 Valor recebido (amount):', amount);
      console.log('💰 Valor que será enviado (centavos):', amount * 100);

      const paymentRequest: MulticaixaExpressRequest = {
        valor: amount * 100, // Convert to centavos
        tipo: 'fatura',
        descricao: description || 'Pagamento de produtos',
        cliente: {
          nome: customerName,
          email: user.email || '',
        },
      };

      console.log('🔄 Criando pagamento:', paymentRequest);
      
      const response = await createMulticaixaExpressPayment(paymentRequest);
      
      if (response.success && response.paymentUrl) {
        setPaymentData(response);
        setPaymentUrl(response.paymentUrl);
        toast.success('Token de pagamento criado com sucesso!');
        
        // Store payment data locally
        if (orderId && response.servicoId) {
          localStorage.setItem(`multicaixa_express_${orderId}`, JSON.stringify({
            servicoId: response.servicoId,
            token: response.token,
            paymentUrl: response.paymentUrl
          }));
        }
      } else {
        throw new Error(response.error || 'Erro ao criar pagamento');
      }
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      onError(error.message || 'Erro ao criar pagamento');
      toast.error('Erro ao criar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPayment = () => {
    if (paymentUrl && paymentData?.servicoId) {
      // Abrir em nova janela/modal
      const popup = window.open(
        paymentUrl, 
        'MulticaixaExpressPayment', 
        'width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,location=no,menubar=no'
      );
      
      if (popup) {
        toast.success('Página de pagamento aberta! Complete o pagamento na nova janela.');
        
        // Start verification polling
        startPaymentVerification(paymentData.servicoId);
        
        // Monitor se a janela foi fechada
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            console.log('Janela de pagamento foi fechada');
          }
        }, 1000);
      } else {
        toast.error('Não foi possível abrir a janela de pagamento. Verifique se o popup não foi bloqueado.');
      }
    }
  };

  const startPaymentVerification = async (servicoId: string) => {
    setIsVerifying(true);
    
    const maxAttempts = 30; // 5 minutes
    let attempts = 0;
    
    const verifyPayment = async () => {
      try {
        const result = await verifyMulticaixaExpressPayment(servicoId);
        
        if (result.status === 'aprovado' || result.status === 'pago') {
          setIsVerifying(false);
          toast.success('Pagamento confirmado!');
          onSuccess();
          return;
        }
        
        if (result.status === 'erro' || result.status === 'cancelado') {
          setIsVerifying(false);
          toast.error('Pagamento não foi aprovado. Tente novamente.');
          return;
        }
        
        // Continue polling if still pending
        attempts++;
        if (attempts < maxAttempts && result.status === 'pendente') {
          setTimeout(verifyPayment, 10000); // Check every 10 seconds
        } else if (attempts >= maxAttempts) {
          setIsVerifying(false);
          toast.info('Verificação de pagamento interrompida. Por favor, verifique manualmente.');
        }
      } catch (error) {
        console.error('Erro na verificação:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(verifyPayment, 10000);
        } else {
          setIsVerifying(false);
          toast.error('Erro ao verificar status do pagamento.');
        }
      }
    };
    
    verifyPayment();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  // If payment is created, show payment interface
  if (paymentData && paymentUrl) {
    return (
      <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Multicaixa Express
            <Badge variant="secondary" className="ml-auto">
              {isVerifying ? 'Verificando...' : 'Pronto'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {paymentData.servicoId && (
              <div className="p-4 bg-white/50 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">ID do Serviço</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentData.servicoId!)}
                    className="h-auto p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="font-mono text-sm break-all">{paymentData.servicoId}</p>
              </div>
            )}

            <div className="p-4 bg-white/50 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Valor</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {(amount).toLocaleString('pt-AO')} AOA
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleOpenPayment}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando Pagamento...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Página de Pagamento
                </>
              )}
            </Button>

            {isVerifying && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Aguardando confirmação do pagamento...
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Esta verificação será automaticamente interrompida em alguns minutos.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-white/30 rounded-lg border border-dashed border-primary/30">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Clique no botão "Abrir Página de Pagamento"</li>
                  <li>Uma nova janela será aberta com o formulário de pagamento</li>
                  <li>Preencha os dados solicitados e confirme o pagamento</li>
                  <li>Aguarde a confirmação automática do pagamento</li>
                  <li>Pode fechar a janela após completar o pagamento</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial state - show create checkout button
  return (
    <Card className="mt-6">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Multicaixa Express</h3>
            <p className="text-muted-foreground mb-4">
              Pague de forma rápida e segura através do Multicaixa Express
            </p>
            <p className="text-2xl font-bold text-primary mb-6">
              {amount.toLocaleString('pt-AO')} AOA
            </p>
          </div>

          <Button 
            onClick={handleCreatePayment}
            disabled={isLoading}
            className="w-full max-w-sm h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando token...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 mr-2" />
                Pagar com Multicaixa Express
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MulticaixaExpressPayment;