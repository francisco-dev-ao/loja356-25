import { useState } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // Removido - não chamaremos mais a Supabase Function
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface MulticaixaExpressPaymentProps {
  amount: number;
  reference: string; // Este será o ID do pedido
  onPaymentSuccess: (paymentReference: string) => void;
  onPaymentError: (error: string) => void;
}

// ATENÇÃO: Mover esta lógica e especialmente o GPO_FRAME_TOKEN para o frontend é um RISCO DE SEGURANÇA.
// Considere usar variáveis de ambiente (ex: import.meta.env.VITE_GPO_FRAME_TOKEN) e esteja ciente das implicações.
// A GPO_CALLBACK_URL DEVE apontar para a sua função de backend (ex: Supabase payment-callback).
const GPO_FRAME_TOKEN = import.meta.env.VITE_GPO_FRAME_TOKEN as string;
const GPO_CSS_URL = import.meta.env.VITE_GPO_CSS_URL as string;
const GPO_CALLBACK_URL = import.meta.env.VITE_GPO_CALLBACK_URL as string;

// Função para formatar a referência como na Edge Function original
function formatEmisReference(orderId: string): string {
  try {
    const alphanumericOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    const randomSuffix = Math.floor(Math.random() * 90) + 10; // Simula rand(10, 99)
    const rawReference = `${alphanumericOrderId}-AH-${randomSuffix}`;
    return rawReference.substring(0, 20);
  } catch (e) {
    console.error("Error formatting EMIS reference for orderId:", orderId, e);
    return orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20); // Fallback
  }
}

const MulticaixaExpressPayment: React.FC<MulticaixaExpressPaymentProps> = ({ amount, reference, onPaymentSuccess, onPaymentError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emisToken, setEmisToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const GPO_IFRAME_BASE_URL = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=";

  const handlePayment = async () => {
    setIsLoading(true);
    setEmisToken(null);
    setShowModal(true);
    console.log("Initiating MCX Payment (Frontend Token Generation). Amount:", amount, "Reference:", reference);

    if (!GPO_FRAME_TOKEN || GPO_FRAME_TOKEN === 'a53787fd-b49e-4469-a6ab-fa6acf19db48' || !GPO_CALLBACK_URL.includes('supabase.co')) {
        // Alerta para o desenvolvedor se as URLs padrão não foram alteradas
        console.warn("ALERTA DESENVOLVEDOR: GPO_FRAME_TOKEN ou GPO_CALLBACK_URL parecem não estar configurados para produção.");
        // Em um cenário real, você pode querer impedir a transação ou mostrar um erro mais específico.
    }
    
    try {
      const formattedReference = formatEmisReference(reference);
      const formattedAmount = amount.toFixed(2);

      const emisApiUrl = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken";
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

      console.log("EMIS API Request (Frontend): URL:", emisApiUrl, "Payload:", JSON.stringify(params));

      const emisResponse = await fetch(emisApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const responseText = await emisResponse.text();
      console.log(`EMIS API Response (Frontend): Status: ${emisResponse.status}, Raw Body: ${responseText}`);

      if (!emisResponse.ok) {
        console.error(`EMIS API ERROR (Frontend): Responded with status ${emisResponse.status}. Body: ${responseText}`);
        throw new Error(`EMIS API request failed with status: ${emisResponse.status}. Response: ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("EMIS API PARSE ERROR (Frontend): Invalid JSON response from EMIS API. Raw text:", responseText, "Error:", e);
        throw new Error(`Invalid JSON response from EMIS API. Content: ${responseText}`);
      }

      if (!responseData || typeof responseData.id !== 'string' || !responseData.id.trim()) {
        console.error("EMIS API LOGIC ERROR (Frontend): Response missing or invalid token ID. Full response:", responseData);
        throw new Error(`EMIS API response missing or invalid token ID. Received: ${JSON.stringify(responseData)}`);
      }
      
      console.log("EMIS Token received (Frontend):", responseData.id);
      setEmisToken(responseData.id);

    } catch (err: any) {
      console.error("MCX Payment Initialization Error (Frontend Token Generation):", err);
      toast({
        title: "Erro ao Iniciar Pagamento MCX",
        description: err.message || "Não foi possível obter o token de pagamento da EMIS.",
        variant: "destructive",
      });
      if (typeof onPaymentError === 'function') {
        onPaymentError(err.message || "Falha ao iniciar o pagamento Multicaixa Express.");
      } else {
        console.error("onPaymentError is not a function. Passed props:", {onPaymentSuccess, onPaymentError});
      }
      setShowModal(false); // Fechar o modal em caso de erro na obtenção do token
      // setIsLoading(false); // Já é tratado no onIframeLoad/Error ou aqui se o modal fecha
    } 
    // Não definir setIsLoading(false) aqui, pois o iframe ainda precisa carregar.
    // Ele será definido como false em onIframeLoad ou onIframeError.
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsLoading(false);
    console.log("Modal de pagamento fechado pelo usuário.");
  }

  const onIframeLoad = () => {
    console.log("MCX Iframe loaded successfully.");
    setIsLoading(false); 
  }

  const onIframeError = () => {
    console.error("MCX Iframe failed to load.");
    setIsLoading(false);
    setShowModal(false);
    toast({
        title: "Erro no Iframe de Pagamento",
        description: "Não foi possível carregar o ambiente de pagamento. Tente novamente.",
        variant: "destructive",
    });
    if (typeof onPaymentError === 'function') {
      onPaymentError("Falha ao carregar o iframe de pagamento MCX.");
    } else {
      console.error("onPaymentError is not a function during iframe error. Passed props:", {onPaymentSuccess, onPaymentError});
    }
  }

  return (
    <div className="mt-4">
      <Button onClick={handlePayment} disabled={isLoading && showModal} className="w-full">
        {isLoading && showModal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pagar com Multicaixa Express
      </Button>

      {showModal && (
        <Dialog open={showModal} onOpenChange={(open) => !open && handleModalClose()}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[450px] p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Pagamento Multicaixa Express</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-2 pb-4 min-h-[400px] flex flex-col items-center justify-center">
              {isLoading && !emisToken && (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Aguarde, a preparar o pagamento...</p>
                </div>
              )}
              {emisToken && (
                <iframe
                  src={`${GPO_IFRAME_BASE_URL}${emisToken}`}
                  height="500px" 
                  width="100%" 
                  title="Multicaixa Express Payment Gateway"
                  style={{ border: 'none' }}
                  onLoad={onIframeLoad}
                  onError={onIframeError}
                ></iframe>
              )}
              {!isLoading && !emisToken && emisToken !== null && ( // Adicionado emisToken !== null para diferenciar do estado inicial
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-destructive mb-4">Não foi possível carregar o terminal de pagamento.</p>
                    <p className="text-sm text-muted-foreground">Verifique a consola para mais detalhes e certifique-se que as configurações (GPO_FRAME_TOKEN, etc.) estão corretas.</p>
                    <p className="text-sm text-muted-foreground">Por favor, feche esta janela e tente novamente.</p>
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
      )}
    </div>
  );
};

export default MulticaixaExpressPayment;
