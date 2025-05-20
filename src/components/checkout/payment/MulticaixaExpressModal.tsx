
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { generateReference } from '@/hooks/payment/utils/payment-reference';

interface MulticaixaExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onPaymentSuccess?: (reference: string) => void;
  onPaymentError?: (error: string) => void;
}

const MulticaixaExpressModal = ({ 
  isOpen, 
  onClose, 
  token,
  onPaymentSuccess,
  onPaymentError
}: MulticaixaExpressModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);
  
  // Timer for auto-close if no interaction
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up timers and cleanup
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setCountdown(120);
      
      // Simulate loading completion after 2 seconds
      const loadTimer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      // Set up countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set up auto-close timer after 2 minutes of inactivity
      autoCloseTimerRef.current = setTimeout(() => {
        console.log("Auto-closing Multicaixa Express modal due to inactivity");
        onClose();
      }, 120000); // 2 minutes
      
      return () => {
        clearTimeout(loadTimer);
        clearTimeout(autoCloseTimerRef.current!);
        clearInterval(countdownInterval);
      };
    }
  }, [isOpen, onClose]);

  // Set up message handler to listen for payment events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (EMIS production domain)
      if (event.origin !== 'https://pagamentonline.emis.co.ao') {
        console.log('Received message from unauthorized origin:', event.origin);
        return;
      }
      
      try {
        console.log('Received message from EMIS:', event.data);
        
        if (event.data && typeof event.data === 'object') {
          if (event.data.status === 'ACCEPTED') {
            // Payment successful
            const paymentReference = generateReference();
            if (onPaymentSuccess) {
              onPaymentSuccess(paymentReference);
            }
            onClose();
          } else if (event.data.status === 'DECLINED') {
            // Payment declined
            if (onPaymentError) {
              onPaymentError('Pagamento rejeitado pelo Multicaixa Express');
            }
            onClose();
          } else if (event.data.status === 'CANCELLED') {
            // Payment cancelled by user
            if (onPaymentError) {
              onPaymentError('Pagamento cancelado pelo usuário');
            }
            onClose();
          }
        }
      } catch (err) {
        console.error('Error processing message from EMIS:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, onPaymentSuccess, onPaymentError]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl min-h-[500px] p-6" aria-describedby="payment-description">
        <div id="payment-description" className="sr-only">
          Diálogo de pagamento com Multicaixa Express
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Carregando pagamento...</p>
            <p className="text-sm text-muted-foreground">
              Por favor, aguarde enquanto conectamos ao sistema de pagamento.
            </p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
            <div className="text-center p-6 max-w-md">
              <p className="mb-6 text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col h-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Multicaixa Express</h2>
              <p className="text-muted-foreground">Complete o pagamento usando um dos métodos abaixo.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 flex-1">
              <div className="border rounded-lg p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-4">QR Code</h3>
                <div className="bg-gray-200 w-48 h-48 flex items-center justify-center rounded-lg mb-4">
                  <span className="text-sm text-muted-foreground">QR Code do Pagamento</span>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Abra o aplicativo Multicaixa Express e escaneie este QR Code para pagar.
                </p>
              </div>
              
              <div className="border rounded-lg p-6 flex flex-col">
                <h3 className="text-lg font-medium mb-4">Pagamento por Telefone</h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-sm font-medium">Referência</p>
                    <p className="font-mono text-lg">{token.substring(0, 9)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Valor</p>
                    <p className="font-mono text-lg">AOA 105.000,00</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tempo restante</p>
                    <p className="font-mono">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-sm text-muted-foreground">
                      Insira o código de referência no aplicativo Multicaixa Express para completar o pagamento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MulticaixaExpressModal;
