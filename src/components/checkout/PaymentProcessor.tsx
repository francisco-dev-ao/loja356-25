import React from 'react';
import { Button } from '@/components/ui/button';
import MulticaixaExpressPayment from './MulticaixaExpressPayment';
import BankTransferPayment from './BankTransferPayment';

interface PaymentProcessorProps {
  paymentMethod: string;
  isProcessing: boolean;
  orderId: string | null;
  total: number;
  handleCreateOrder: () => Promise<void>;
}

const PaymentProcessor = ({ 
  paymentMethod, 
  isProcessing, 
  orderId, 
  total, 
  handleCreateOrder 
}: PaymentProcessorProps) => {
  if (isProcessing && !orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-microsoft-blue border-t-transparent rounded-full mb-4"></div>
        <p>Criando pedido...</p>
      </div>
    );
  }

  if (!paymentMethod || !orderId) {
    return (
      <Button 
        onClick={handleCreateOrder}
        className="w-full"
        disabled={!paymentMethod || isProcessing}
      >
        Finalizar Pedido
      </Button>
    );
  }

  const handlePaymentSuccess = (paymentReference: string) => {
    console.log('Payment successful:', { paymentReference });
    // TODO: Add logic to handle successful payment, e.g., redirect to a success page or update order status
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    // TODO: Add logic to handle payment error, e.g., show an error message to the user
  };

  if (paymentMethod === 'multicaixa') {
    return <MulticaixaExpressPayment 
             amount={total} 
             reference={orderId} 
             onPaymentSuccess={handlePaymentSuccess} 
             onPaymentError={handlePaymentError} 
           />;
  } 
  if (paymentMethod === 'bank_transfer') {
    return <BankTransferPayment total={total} orderId={orderId} />;
  }

  return null;
};

export default PaymentProcessor;
