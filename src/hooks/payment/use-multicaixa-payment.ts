
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { usePaymentVerification } from './use-payment-verification';
import { generateReference, storePaymentReference } from './utils/payment-reference';
import { getActiveMulticaixaConfig, getMulticaixaSettings } from './utils/payment-config';
import { savePaymentTransaction } from './utils/payment-transaction';
import { updateOrderStatus } from './utils/payment-status';
import { MulticaixaConfig, Settings } from '@/types/database';

interface UseMulticaixaPaymentProps {
  amount: number;
  orderId: string;
  onTokenGenerated?: (token: string) => void;
}

export const useMulticaixaPayment = ({ 
  amount, 
  orderId, 
  onTokenGenerated 
}: UseMulticaixaPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const { clearCart } = useCart();
  
  // Use the smaller hooks we created
  const { paymentStatus, setPaymentStatus } = usePaymentVerification({ orderId });
  
  const handlePayment = async (userId: string | undefined) => {
    if (!userId) {
      toast.error('Você precisa estar logado para efetuar o pagamento');
      return;
    }
    
    if (!orderId) {
      toast.error('Necessário criar pedido antes de prosseguir com o pagamento');
      return;
    }
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Generate payment reference
      const reference = generateReference(orderId);
      
      // Store reference in local storage
      storePaymentReference(orderId, reference);
      
      // First check if there's a configuration in multicaixa_express_config
      const configData = await getActiveMulticaixaConfig();

      // Save the payment transaction to the database
      const { data: paymentData, error: paymentError } = await savePaymentTransaction({
        order_id: orderId,
        reference: reference,
        amount: amount,
        status: 'pending',
        payment_method: 'multicaixa'
      });
        
      if (paymentError) {
        throw new Error(`Erro ao registrar transação: ${paymentError.message}`);
      }

      // A token não será gerada neste momento, pois usamos implementação direta no componente MulticaixaExpressPayment
      // Isso permite uma integração mais limpa sem depender de funções Supabase Edge

      // Store token for modal (this will be null initially and set by the component)
      setPaymentToken(reference);
      
      // Call the callback if provided
      if (onTokenGenerated) {
        onTokenGenerated(reference);
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('failed');
      toast.error(error.message || 'Ocorreu um erro ao iniciar o pagamento');
    } finally {
      // Always set processing to false when done
      setIsProcessing(false);
    }
  };

  // Handler for when the payment is successful via MulticaixaExpressPayment component
  const handlePaymentSuccess = async (paymentRef: string) => {
    try {
      setPaymentStatus('completed');
      
      // Update order status to completed
      await updateOrderStatus(orderId, 'completed', 'paid');
      
      // Clear cart
      clearCart();
      
      // Navigate to success page
      navigate(`/checkout/success?orderId=${orderId}`);
    } catch (error: any) {
      console.error('Error handling successful payment:', error);
      toast.error('Erro ao processar pagamento bem-sucedido');
    }
  };
  
  // Handler for when the payment fails via MulticaixaExpressPayment component
  const handlePaymentError = async (error: string) => {
    setPaymentStatus('failed');
    toast.error(`Falha no pagamento: ${error}`);
    
    try {
      await updateOrderStatus(orderId, 'pending', 'failed');
    } catch (err) {
      console.error('Error updating order status after payment failure:', err);
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    paymentToken,
    paymentStatus,
    handlePayment,
    handlePaymentSuccess,
    handlePaymentError,
    updateOrderStatus
  };
};
