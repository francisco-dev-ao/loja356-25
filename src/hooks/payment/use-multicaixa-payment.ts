
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { usePaymentVerification } from './use-payment-verification';
import { generateReference, storePaymentReference } from './utils/payment-reference';
import { getActiveMulticaixaConfig, getMulticaixaSettings } from './utils/payment-config';
import { generateEmisToken, updatePaymentWithEmisToken } from './utils/emis-token';
import { savePaymentTransaction } from './utils/payment-transaction';
import { updateOrderStatus } from './utils/payment-status';

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

      // Process payment using the appropriate configuration
      try {
        // Determine which configuration to use
        const activeConfig = configData || await getMulticaixaSettings();
        
        if (!activeConfig) {
          throw new Error('Configurações não encontradas');
        }
        
        console.log('Using Multicaixa Express configuration:', activeConfig);
        
        const frameToken = configData ? 
          configData.frame_token : 
          activeConfig.multicaixa_frametoken;
          
        if (!frameToken) {
          throw new Error('Token do Multicaixa Express não configurado');
        }
        
        const callbackUrl = configData ?
          configData.callback_url :
          activeConfig.multicaixa_callback || `${window.location.origin}/api/payment-callback`;
          
        const cssUrl = configData ?
          configData.css_url :
          activeConfig.multicaixa_cssurl || `${window.location.origin}/multicaixa-express.css`;
        
        // Generate token from edge function
        const emisTokenData = await generateEmisToken({
          reference: reference,
          amount: amount.toString(),
          token: frameToken,
          callbackUrl: callbackUrl,
          cssUrl: cssUrl
        });

        // Update payment record with token
        await updatePaymentWithEmisToken(
          reference, 
          emisTokenData.id,
          emisTokenData
        );
        
        // Store the token for the modal
        setPaymentToken(emisTokenData.id);
        
        // Call the callback if provided
        if (onTokenGenerated) {
          onTokenGenerated(emisTokenData.id);
        }
          
      } catch (error: any) {
        console.error('Error processing EMIS token:', error);
        
        // Use mock token for development purposes
        const mockToken = `mock-token-${Date.now()}`;
        console.log('Using fallback mock token:', mockToken);
        
        setPaymentToken(mockToken);
        
        // Call the callback if provided
        if (onTokenGenerated) {
          onTokenGenerated(mockToken);
        }
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

  return {
    isProcessing,
    setIsProcessing,
    paymentToken,
    paymentStatus,
    handlePayment,
    updateOrderStatus
  };
};
