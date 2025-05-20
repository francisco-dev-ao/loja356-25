
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PaymentLoader } from './payment-components/PaymentLoader';
import { PaymentError } from './payment-components/PaymentError';
import PaymentFrame from './PaymentFrame';

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
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  
  // A URL da iframe para o pagamento é construída usando o token
  useEffect(() => {
    if (token) {
      // Esta é a URL real da EMIS para o portal de pagamento
      const url = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${token}`;
      setIframeUrl(url);
    }
  }, [token]);

  // Set up message handler to listen for payment events from the iframe
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
            if (onPaymentSuccess) {
              onPaymentSuccess(token);
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
  }, [onClose, onPaymentSuccess, onPaymentError, token]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl min-h-[500px] p-0">
        <DialogTitle className="sr-only">Pagamento Multicaixa Express</DialogTitle>
        
        {loading && <PaymentLoader />}
        
        {error && <PaymentError message={error} />}

        {iframeUrl && (
          <div className={`${loading ? 'hidden' : 'block'} h-[600px]`}>
            <PaymentFrame 
              src={iframeUrl} 
              onLoad={handleIframeLoad} 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MulticaixaExpressModal;
