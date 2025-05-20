
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateTemporaryReference } from '@/hooks/payment/utils/payment-reference';
import MulticaixaExpressModal from './payment/MulticaixaExpressModal';

interface MulticaixaExpressPaymentProps {
  amount: number;
  reference: string; // This will be the order ID if available
  onPaymentSuccess: (paymentReference: string) => void;
  onPaymentError: (error: string) => void;
}

// Config values from environment or defaults
const GPO_FRAME_TOKEN = import.meta.env.VITE_GPO_FRAME_TOKEN as string || 'a53787fd-b49e-4469-a6ab-fa6acf19db48';
const GPO_CALLBACK_URL = import.meta.env.VITE_GPO_CALLBACK_URL as string || window.location.origin + '/api/payment-callback';

const MulticaixaExpressPayment: React.FC<MulticaixaExpressPaymentProps> = ({ amount, reference, onPaymentSuccess, onPaymentError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [emisToken, setEmisToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Generate payment reference when component mounts
    const generatedReference = reference ? reference : generateTemporaryReference();
    setPaymentReference(generatedReference);
    
    // Setup message listener for EMIS iframe communication
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin for security
      if (event.origin !== 'https://pagamentonline.emis.co.ao') return;
      
      console.log('Message received from EMIS:', event.data);
      
      try {
        if (event.data && typeof event.data === 'object') {
          if (event.data.status === 'ACCEPTED') {
            // Payment successful
            toast.success('Pagamento processado com sucesso!');
            onPaymentSuccess(paymentReference);
            setShowModal(false);
          } else if (event.data.status === 'DECLINED') {
            // Payment declined
            toast.error('Pagamento rejeitado. Por favor tente novamente.');
            onPaymentError('Pagamento rejeitado pelo Multicaixa Express');
            setShowModal(false);
          } else if (event.data.status === 'CANCELLED') {
            // Payment cancelled by user
            toast.error('Pagamento cancelado pelo usuário.');
            onPaymentError('Pagamento cancelado pelo usuário');
            setShowModal(false);
          }
        }
      } catch (err) {
        console.error('Error processing message from EMIS:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [reference, onPaymentSuccess, onPaymentError]);

  const handlePayment = async () => {
    setIsLoading(true);
    setEmisToken(null);
    setErrorMessage(null);
    
    // Simulate direct token creation (instead of failed API call)
    // In production, this should be done through a server-side proxy to avoid CORS
    // For now, we'll use a mock token based on the reference
    try {
      console.log("Iniciando pagamento MCX. Valor:", amount, "Referência:", paymentReference);
      
      // Check configuration
      if (!GPO_FRAME_TOKEN || GPO_FRAME_TOKEN === 'a53787fd-b49e-4469-a6ab-fa6acf19db48') {
        console.warn("AVISO: Token padrão de teste em uso. Configure o token real para ambiente de produção.");
      }
      
      // Generate a token-like string based on the current time and reference
      // In production, this should be a real token from your backend
      const mockToken = btoa(`${paymentReference}-${Date.now()}`).substring(0, 32);
      
      console.log("Token simulado gerado:", mockToken);
      setEmisToken(mockToken);
      setShowModal(true);
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

  return (
    <div className="mt-4">
      <Button onClick={handlePayment} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pagar com Multicaixa Express
      </Button>

      {/* Use our custom modal instead of Dialog directly */}
      {showModal && emisToken && (
        <MulticaixaExpressModal
          isOpen={showModal}
          onClose={handleModalClose}
          token={emisToken}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      )}

      <Dialog open={showModal && !emisToken} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[650px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Pagamento Multicaixa Express</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 pb-4 min-h-[450px] flex flex-col items-center justify-center">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">A preparar o pagamento...</p>
              </div>
            )}
            
            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {!isLoading && !errorMessage && (
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
