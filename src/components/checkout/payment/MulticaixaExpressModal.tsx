
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { generateReference } from '@/hooks/payment/utils/payment-reference';
import { PaymentLoader } from './payment-components/PaymentLoader';
import { PaymentError } from './payment-components/PaymentError';
import { PaymentMethods } from './payment-components/PaymentMethods';

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

  // Efeito para fechar o modal se o countdown chegar a zero
  useEffect(() => {
    if (countdown === 0) {
      if (onPaymentError) {
        onPaymentError('Tempo para pagamento expirado');
      }
      onClose();
    }
  }, [countdown, onClose, onPaymentError]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl min-h-[500px] p-6" aria-describedby="payment-description">
        <div id="payment-description" className="sr-only">
          Diálogo de pagamento com Multicaixa Express
        </div>
        
        {loading && <PaymentLoader />}
        
        {error && <PaymentError message={error} />}

        {!loading && !error && (
          <PaymentMethods token={token} countdown={countdown} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MulticaixaExpressModal;
