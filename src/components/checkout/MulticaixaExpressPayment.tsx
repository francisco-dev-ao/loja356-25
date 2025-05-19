
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMulticaixaPayment } from '@/hooks/payment/use-multicaixa-payment';
import { usePaymentMessageHandler } from '@/hooks/payment/use-payment-message-handler';
import PaymentInfo from './payment/PaymentInfo';
import PaymentButton from './payment/PaymentButton';
import PaymentTips from './payment/PaymentTips';
import MulticaixaExpressModal from './payment/MulticaixaExpressModal';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    isProcessing,
    setIsProcessing,
    paymentStatus,
    handlePayment,
    updateOrderStatus
  } = useMulticaixaPayment({ 
    amount, 
    orderId,
    onTokenGenerated: (token) => {
      setPaymentToken(token);
      setIsModalOpen(true);
      setError(null);
    }
  });

  // Use the message handler hook
  usePaymentMessageHandler({
    orderId,
    updateOrderStatus: (status, paymentStatus) => {
      // Convert string parameters to the required types
      const typedStatus = status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      const typedPaymentStatus = paymentStatus as 'pending' | 'processing' | 'paid' | 'failed';
      
      return updateOrderStatus(orderId, typedStatus, typedPaymentStatus);
    },
    setPaymentStatus: () => {}, // We're handling this in useMulticaixaPayment
    setIsModalOpen,
    setIsProcessing
  });

  // Auto-initiate payment when component mounts if orderId exists
  useEffect(() => {
    if (orderId && !isModalOpen && !paymentToken && user && retryCount === 0) {
      handlePayment(user.id).catch(err => {
        console.error('Erro ao iniciar pagamento automático:', err);
        setError('Não foi possível iniciar o pagamento automaticamente. Por favor, tente manualmente.');
        toast.error('Erro ao iniciar pagamento. Por favor, tente novamente.');
      });
    }
  }, [orderId, isModalOpen, paymentToken, user, handlePayment, retryCount]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRetryPayment = () => {
    if (user) {
      setError(null);
      setPaymentToken(null);
      setRetryCount(prev => prev + 1);
      setIsProcessing(true);
      handlePayment(user.id).catch(err => {
        console.error('Erro ao tentar novamente o pagamento:', err);
        setError('Não foi possível processar o pagamento. Por favor, tente novamente mais tarde.');
        toast.error('Erro ao processar pagamento. Por favor, tente novamente mais tarde.');
        setIsProcessing(false);
      });
    }
  };

  if (!orderId) {
    return (
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-600">Processando seu pedido...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PaymentInfo amount={amount} />
      
      {!paymentToken && (
        <PaymentButton 
          onClick={() => user && handlePayment(user.id)}
          isProcessing={isProcessing}
        />
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro no Pagamento</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryPayment} 
              disabled={isProcessing}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {paymentToken && !isModalOpen && (
        <div className="flex flex-col space-y-4 mt-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pagamento Interrompido</AlertTitle>
            <AlertDescription>
              O pagamento anterior foi cancelado ou falhou. Por favor, tente novamente.
            </AlertDescription>
          </Alert>
          <PaymentButton 
            onClick={handleRetryPayment}
            isProcessing={isProcessing}
            label="Tentar Novamente"
          />
        </div>
      )}
      
      <PaymentTips />

      {paymentToken && (
        <MulticaixaExpressModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          token={paymentToken}
        />
      )}
    </div>
  );
};

export default MulticaixaExpressPayment;
