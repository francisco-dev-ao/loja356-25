
import React from 'react';
import { Button } from '@/components/ui/button';
import MulticaixaExpressPayment from './MulticaixaExpressPayment';
import BankTransferPayment from './BankTransferPayment';
import { Loader2 } from 'lucide-react';
import { useMulticaixaPayment } from '@/hooks/payment/use-multicaixa-payment';

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
  // Use a hook para gerenciar pagamentos Multicaixa Express
  const { 
    handlePaymentSuccess: onPaymentSuccess, 
    handlePaymentError: onPaymentError 
  } = useMulticaixaPayment({ 
    amount: total, 
    orderId: orderId || ''
  });

  if (isProcessing && !orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
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

  if (paymentMethod === 'multicaixa') {
    return <MulticaixaExpressPayment 
             amount={total} 
             reference={orderId} 
             onPaymentSuccess={onPaymentSuccess} 
             onPaymentError={onPaymentError} 
           />;
  } 
  if (paymentMethod === 'bank_transfer') {
    return <BankTransferPayment total={total} orderId={orderId} />;
  }

  return null;
};

export default PaymentProcessor;
