
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MulticaixaExpressPaymentProps {
  amount: number;
  reference: string; // Este será o ID do pedido
  onPaymentSuccess: (paymentReference: string) => void;
  onPaymentError: (error: string) => void;
}

// ATENÇÃO: Esta configuração deve ser feita através das configurações do sistema
// Considere usar variáveis de ambiente para estes valores
const GPO_FRAME_TOKEN = import.meta.env.VITE_GPO_FRAME_TOKEN as string || 'a53787fd-b49e-4469-a6ab-fa6acf19db48';
const GPO_CSS_URL = import.meta.env.VITE_GPO_CSS_URL as string || window.location.origin + '/multicaixa-express.css';
const GPO_CALLBACK_URL = import.meta.env.VITE_GPO_CALLBACK_URL as string || window.location.origin + '/api/payment-callback';
const GPO_IFRAME_BASE_URL = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=";

// Função para formatar a referência como na classe PHP original
function formatEmisReference(orderId: string): string {
  try {
    // Seguindo a mesma lógica do método PHP generateref()
    return `${orderId}-AH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  } catch (e) {
    console.error("Error formatting EMIS reference for orderId:", orderId, e);
    return orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20); // Fallback
  }
}

const MulticaixaExpressPayment: React.FC<MulticaixaExpressPaymentProps> = ({ amount, reference, onPaymentSuccess, onPaymentError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emisToken, setEmisToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manipular o evento de mensagem do iframe para integração com o sistema de pagamento
  const setupMessageListener = () => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar a origem para segurança
      if (event.origin !== 'https://pagamentonline.emis.co.ao') return;
      
      console.log('Mensagem recebida do EMIS:', event.data);
      
      try {
        // Processar a resposta do EMIS
        if (event.data && typeof event.data === 'object') {
          if (event.data.status === 'ACCEPTED') {
            // Pagamento aceito
            toast.success('Pagamento processado com sucesso!');
            onPaymentSuccess(reference);
            setShowModal(false);
          } else if (event.data.status === 'DECLINED') {
            // Pagamento rejeitado
            toast.error('Pagamento rejeitado. Por favor tente novamente.');
            onPaymentError('Pagamento rejeitado pelo Multicaixa Express');
            setShowModal(false);
          } else if (event.data.status === 'CANCELLED') {
            // Pagamento cancelado pelo usuário
            toast.error('Pagamento cancelado pelo usuário.');
            onPaymentError('Pagamento cancelado pelo usuário');
            setShowModal(false);
          }
        }
      } catch (err) {
        console.error('Erro ao processar mensagem do EMIS:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setEmisToken(null);
    setErrorMessage(null);
    setShowModal(true);
    
    console.log("Iniciando pagamento MCX. Valor:", amount, "Referência:", reference);
    
    // Verificar configurações
    if (!GPO_FRAME_TOKEN || GPO_FRAME_TOKEN === 'a53787fd-b49e-4469-a6ab-fa6acf19db48') {
      console.warn("AVISO: Token padrão de teste em uso. Configure o token real para ambiente de produção.");
    }
    
    try {
      const formattedReference = formatEmisReference(reference);
      const formattedAmount = amount.toFixed(2);

      // Parâmetros para a API do EMIS, seguindo o exemplo PHP
      const params = {
        reference: formattedReference,
        amount: formattedAmount,
        token: GPO_FRAME_TOKEN,
        mobile: 'PAYMENT',
        card: 'DISABLED',
        qrCode: 'PAYMENT',
        cssUrl: GPO_CSS_URL,
        callbackUrl: GPO_CALLBACK_URL 
      };

      console.log("Chamada API EMIS com parâmetros:", JSON.stringify(params));

      // Fazer a chamada direta para a API do EMIS para gerar o token
      const emisResponse = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });

      // Processar a resposta da API
      const responseText = await emisResponse.text();
      
      if (!emisResponse.ok) {
        console.error(`Erro na API EMIS: Status ${emisResponse.status}. Resposta: ${responseText}`);
        throw new Error(`Falha na solicitação da API EMIS: ${emisResponse.status}. ${responseText}`);
      }

      // Converter resposta para JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao interpretar resposta da API EMIS:", responseText, e);
        throw new Error(`Resposta inválida da API EMIS: ${responseText}`);
      }

      // Verificar se o token foi gerado corretamente
      if (!responseData || typeof responseData.id !== 'string' || !responseData.id.trim()) {
        console.error("Resposta da API EMIS sem token válido:", responseData);
        throw new Error(`Resposta da API EMIS sem token válido: ${JSON.stringify(responseData)}`);
      }
      
      console.log("Token EMIS recebido:", responseData.id);
      
      // Definir o token para exibir o iframe
      setEmisToken(responseData.id);
      
      // Configurar listener de mensagens para integração com o iframe
      setupMessageListener();

    } catch (err: any) {
      console.error("Erro ao iniciar pagamento MCX:", err);
      setErrorMessage(err.message || "Não foi possível conectar ao serviço de pagamento. Tente novamente mais tarde.");
      toast.error("Erro ao iniciar pagamento: " + (err.message || "Falha na conexão"));
      
      if (typeof onPaymentError === 'function') {
        onPaymentError(err.message || "Falha ao iniciar o pagamento Multicaixa Express");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsLoading(false);
    setEmisToken(null);
    console.log("Modal de pagamento fechado pelo usuário.");
  };

  const onIframeLoad = () => {
    console.log("Iframe MCX carregado com sucesso.");
    setIsLoading(false);
  };

  const onIframeError = () => {
    console.error("Erro ao carregar iframe MCX.");
    setIsLoading(false);
    setErrorMessage("Não foi possível carregar o terminal de pagamento. Verifique sua conexão e tente novamente.");
    
    if (typeof onPaymentError === 'function') {
      onPaymentError("Falha ao carregar o iframe de pagamento MCX");
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={handlePayment} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pagar com Multicaixa Express
      </Button>

      <Dialog open={showModal} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[650px] p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Pagamento Multicaixa Express</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 pb-4 min-h-[450px] flex flex-col items-center justify-center">
            {isLoading && !emisToken && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">A preparar o pagamento...</p>
              </div>
            )}
            
            {emisToken && (
              <iframe
                src={`${GPO_IFRAME_BASE_URL}${emisToken}`}
                height="550px" 
                width="100%" 
                title="Multicaixa Express Payment Gateway"
                style={{ border: 'none' }}
                onLoad={onIframeLoad}
                onError={onIframeError}
              ></iframe>
            )}
            
            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {!isLoading && !emisToken && !errorMessage && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-muted-foreground mb-4">Aguardando conexão com o terminal de pagamento...</p>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button type="button" variant="outline" onClick={handleModalClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MulticaixaExpressPayment;
