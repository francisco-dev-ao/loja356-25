
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { initiateMulticaixaExpressPayment } from '@/hooks/payment/utils/multicaixa-service';
import MulticaixaExpressModal from './payment/MulticaixaExpressModal';

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
  const [emisToken, setEmisToken] = useState<string | null>(null);
  
  const handlePayment = async () => {
    setIsLoading(true);
    setEmisToken(null);
    
    try {
      console.log("Iniciando pagamento MCX. Valor:", amount, "Referência:", reference);
      
      // Iniciar pagamento usando nossa função
      const paymentResult = await initiateMulticaixaExpressPayment({
        orderId: reference,
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
    console.log("Modal de pagamento fechado pelo usuário.");
  };

  const handlePaymentSuccess = (token: string) => {
    console.log("Pagamento concluído com sucesso:", token);
    toast.success("Pagamento processado com sucesso!");
    onPaymentSuccess(token);
  };

  const handlePaymentError = (error: string) => {
    console.error("Erro no pagamento:", error);
    toast.error("Erro no pagamento: " + error);
    onPaymentError(error);
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

      {/* EMIS Payment Modal */}
      {showModal && emisToken && (
        <MulticaixaExpressModal
          isOpen={showModal}
          onClose={handleModalClose}
          token={emisToken}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default MulticaixaExpressPayment;
