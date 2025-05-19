
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMulticaixaPayment } from '@/hooks/payment/use-multicaixa-payment';
import { usePaymentMessageHandler } from '@/hooks/payment/use-payment-message-handler';
import PaymentInfo from './payment/PaymentInfo';
import PaymentButton from './payment/PaymentButton';
import PaymentFrame from './payment/PaymentFrame';
import PaymentTips from './payment/PaymentTips';

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const { user } = useAuth();
  const { 
    isProcessing,
    showIframe,
    paymentUrl,
    paymentStatus,
    setIframeLoaded,
    handlePayment,
    updateOrderStatus
  } = useMulticaixaPayment({ amount, orderId });

  // Use the message handler hook with a wrapper function to adapt the signature
  usePaymentMessageHandler({
    orderId,
    updateOrderStatus: (status, paymentStatus) => {
      return updateOrderStatus(orderId, status, paymentStatus);
    },
    setPaymentStatus: () => {} // We're handling this in useMulticaixaPayment
  });

  // Auto-initiate payment when component mounts if orderId exists
  useEffect(() => {
    if (orderId && !showIframe && user) {
      handlePayment(user.id);
    }
  }, [orderId, showIframe, user]);

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setIframeLoaded(true);
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
      
      {showIframe ? (
        <PaymentFrame 
          src={paymentUrl}
          onLoad={handleIframeLoad}
        />
      ) : (
        <PaymentButton 
          onClick={() => handlePayment(user?.id)}
          isProcessing={isProcessing}
        />
      )}
      
      <PaymentTips />
    </div>
  );
};

export default MulticaixaExpressPayment;
