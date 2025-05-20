
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { generateTemporaryReference } from '@/hooks/payment/utils/payment-reference';
import MulticaixaExpressModal from './payment/MulticaixaExpressModal';
import { initiateMulticaixaExpressPayment } from '@/hooks/payment/utils/multicaixa-service';

interface MulticaixaExpressPaymentProps {
  amount: number;
  reference: string; // This will be the order ID if available
  onPaymentSuccess: (paymentReference: string) => void;
  onPaymentError: (error: string) => void;
}

const MulticaixaExpressPayment: React.FC<MulticaixaExpressPaymentProps> = ({ 
  amount, 
  reference, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
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
  }, [reference, onPaymentSuccess, onPaymentError, paymentReference]);

  const handlePayment = async () => {
    setIsLoading(true);
    setEmisToken(null);
    setErrorMessage(null);
    
    try {
      console.log("Iniciando pagamento MCX. Valor:", amount, "Referência:", paymentReference);
      
      // Iniciar pagamento usando nossa nova função
      const paymentResult = await initiateMulticaixaExpressPayment({
        orderId: paymentReference,
        amount: amount
      });
      
      if (!paymentResult.success || !paymentResult.id) {
        throw new Error(paymentResult.error || "Falha ao iniciar pagamento");
      }
      
      console.log("Token gerado:", paymentResult.id);
      setEmisToken(paymentResult.id);
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
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-4 w-4" />
        )}
        Pagar com Multicaixa Express
      </Button>

      {/* Multicaixa Express Payment Modal */}
      {showModal && emisToken && (
        <MulticaixaExpressModal
          isOpen={showModal}
          onClose={handleModalClose}
          token={emisToken}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      )}
    </div>
  );
};

export default MulticaixaExpressPayment;
