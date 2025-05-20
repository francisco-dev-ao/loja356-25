
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import MulticaixaExpressPayment from './MulticaixaExpressPayment';
import BankTransferPayment from './BankTransferPayment';
import { Loader2 } from 'lucide-react';
import { useMulticaixaPayment } from '@/hooks/payment/use-multicaixa-payment';
import { generateTemporaryReference } from '@/hooks/payment/utils/payment-reference';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/use-cart';

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
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [tempReference, setTempReference] = useState<string>('');
  
  useEffect(() => {
    // Generate a temporary reference when component mounts
    if (!tempReference) {
      setTempReference(generateTemporaryReference());
    }
  }, [tempReference]);
  
  // Handle successful payment
  const handlePaymentSuccess = async (paymentReference: string) => {
    try {
      toast.success('Pagamento processado com sucesso!');
      
      // If we don't have an order yet, create it now (payment initiated before order creation)
      if (!orderId) {
        await handleCreateOrder();
      }
      
      // Get the actual order ID (either existing or newly created)
      const finalOrderId = orderId || localStorage.getItem('latest_order_id');
      
      if (finalOrderId) {
        // Update order status in the database
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            payment_status: 'paid',
            payment_reference: paymentReference,
            updated_at: new Date().toISOString()
          })
          .eq('id', finalOrderId);
          
        if (error) {
          console.error('Error updating order status:', error);
          toast.error('Erro ao atualizar status do pedido');
        } else {
          // Clear cart and redirect to success page
          clearCart();
          navigate(`/checkout/success?orderId=${finalOrderId}`);
        }
      } else {
        toast.error('ID do pedido não encontrado');
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast.error('Erro ao processar pagamento');
    }
  };
  
  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    toast.error(`Falha no pagamento: ${errorMessage}`);
  };

  if (isProcessing && !orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Criando pedido...</p>
      </div>
    );
  }

  // For payment before order creation
  if (!orderId && paymentMethod === 'multicaixa') {
    return <MulticaixaExpressPayment 
             amount={total} 
             reference={tempReference}
             onPaymentSuccess={handlePaymentSuccess} 
             onPaymentError={handlePaymentError} 
           />;
  }

  // Normal flow - create order first
  if (!paymentMethod) {
    return (
      <Button 
        onClick={handleCreateOrder}
        className="w-full"
        disabled={isProcessing}
      >
        Finalizar Pedido
      </Button>
    );
  }

  // After order creation, display payment method
  if (orderId) {
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
  }

  return null;
};

export default PaymentProcessor;
