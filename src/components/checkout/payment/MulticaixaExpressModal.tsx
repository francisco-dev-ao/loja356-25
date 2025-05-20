
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PaymentLoader } from './payment-components/PaymentLoader';
import { PaymentError } from './payment-components/PaymentError';
import PaymentFrame from './PaymentFrame';
import { toast } from 'sonner';
import { constructEmisIframeUrl } from "@/hooks/payment/utils/emis-api";

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
  
  // Construct the iframe URL for payment using the token
  useEffect(() => {
    if (token) {
      try {
        const url = constructEmisIframeUrl(token);
        console.log("Configurando URL do iframe EMIS:", url);
        setIframeUrl(url);
      } catch (err: any) {
        console.error("Error constructing iframe URL:", err);
        setError(err.message || "Erro ao configurar página de pagamento");
        setLoading(false);
      }
    }
  }, [token]);

  // Set up message handler to listen for payment events from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Log all received messages to help with debugging
      console.log('Received message from:', event.origin, 'Data:', event.data);
      
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
            console.log('Pagamento ACEITO pela EMIS');
            if (onPaymentSuccess) {
              onPaymentSuccess(token);
            }
            onClose();
          } else if (event.data.status === 'DECLINED') {
            // Payment declined
            console.log('Pagamento RECUSADO pela EMIS');
            if (onPaymentError) {
              onPaymentError('Pagamento rejeitado pelo Multicaixa Express');
            }
            onClose();
          } else if (event.data.status === 'CANCELLED') {
            // Payment cancelled by user
            console.log('Pagamento CANCELADO pelo usuário');
            if (onPaymentError) {
              onPaymentError('Pagamento cancelado pelo usuário');
            }
            onClose();
          } else {
            console.log('Status de pagamento desconhecido:', event.data.status);
          }
        } else {
          console.log('Formato de mensagem desconhecido:', event.data);
        }
      } catch (err) {
        console.error('Error processing message from EMIS:', err);
      }
    };

    console.log('Registrando event listener para mensagens da EMIS');
    window.addEventListener('message', handleMessage);
    
    return () => {
      console.log('Removendo event listener de mensagens da EMIS');
      window.removeEventListener('message', handleMessage);
    }
  }, [onClose, onPaymentSuccess, onPaymentError, token]);

  const handleIframeLoad = () => {
    console.log('Iframe EMIS carregado com sucesso');
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
