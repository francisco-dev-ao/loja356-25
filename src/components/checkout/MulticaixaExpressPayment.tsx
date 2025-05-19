
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMulticaixaPayment } from '@/hooks/payment/use-multicaixa-payment';
import { usePaymentMessageHandler } from '@/hooks/payment/use-payment-message-handler';
import PaymentInfo from './payment/PaymentInfo';
import PaymentButton from './payment/PaymentButton';
import PaymentTips from './payment/PaymentTips';
import MulticaixaExpressModal from './payment/MulticaixaExpressModal';

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  
  const { 
    isProcessing,
    paymentStatus,
    handlePayment,
    updateOrderStatus
  } = useMulticaixaPayment({ 
    amount, 
    orderId,
    onTokenGenerated: (token) => {
      setPaymentToken(token);
      setIsModalOpen(true);
    }
  });

  // Use the message handler hook with a wrapper function to adapt the signature
  usePaymentMessageHandler({
    orderId,
    updateOrderStatus: (status, paymentStatus) => {
      // Convert string parameters to the required types
      const typedStatus = status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      const typedPaymentStatus = paymentStatus as 'pending' | 'processing' | 'paid' | 'failed';
      
      return updateOrderStatus(orderId, typedStatus, typedPaymentStatus);
    },
    setPaymentStatus: () => {}, // We're handling this in useMulticaixaPayment
    setIsModalOpen: setIsModalOpen
  });

  // Auto-initiate payment when component mounts if orderId exists
  useEffect(() => {
    if (orderId && !isModalOpen && !paymentToken && user) {
      handlePayment(user.id);
    }
  }, [orderId, isModalOpen, paymentToken, user, handlePayment]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
          onClick={() => handlePayment(user?.id)}
          isProcessing={isProcessing}
        />
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
