
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { usePaymentVerification } from './use-payment-verification';
import { useMulticaixaIframe } from './use-multicaixa-iframe';
import { generateReference, storePaymentReference } from './utils/payment-reference';
import { getActiveMulticaixaConfig, getMulticaixaSettings } from './utils/payment-config';
import { generateEmisToken, updatePaymentWithEmisToken } from './utils/emis-token';
import { savePaymentTransaction } from './utils/payment-transaction';
import { updateOrderStatus } from './utils/payment-status';

interface UseMulticaixaPaymentProps {
  amount: number;
  orderId: string;
}

export const useMulticaixaPayment = ({ amount, orderId }: UseMulticaixaPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();
  
  // Use the smaller hooks we created
  const { paymentStatus, setPaymentStatus } = usePaymentVerification({ orderId });
  const { 
    iframeLoaded, showIframe, paymentUrl, 
    setIframeLoaded, setShowIframe, showPaymentIframe 
  } = useMulticaixaIframe();
  
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
      if (configData) {
        console.log('Using Multicaixa Express configuration from config table:', configData);

        try {
          // Generate token from edge function
          const emisTokenData = await generateEmisToken({
            reference: reference,
            amount: amount.toString(),
            token: configData.frame_token,
            callbackUrl: configData.callback_url,
            cssUrl: configData.css_url || window.location.origin + "/multicaixa-express.css"
          });

          // Update payment record with token
          await updatePaymentWithEmisToken(
            reference, 
            emisTokenData.id,
            emisTokenData
          );
          
          // Show the payment iframe
          showPaymentIframe(emisTokenData.id);
          
        } catch (error: any) {
          console.error('Error processing EMIS token:', error);
          
          // For demo purposes only - show a fallback interface
          const mockToken = `mock-token-${Date.now()}`;
          showPaymentIframe(mockToken);
        }
      } else {
        // Fallback to settings table if no active config found
        const settingsData = await getMulticaixaSettings();
        
        if (!settingsData) {
          throw new Error('Configurações não encontradas');
        }
        
        console.log('Using Multicaixa Express configuration from settings table:', settingsData);
        
        if (!settingsData.multicaixa_frametoken) {
          throw new Error('Token do Multicaixa Express não configurado');
        }
        
        try {
          // Generate token from edge function
          const emisTokenData = await generateEmisToken({
            reference: reference,
            amount: amount.toString(),
            token: settingsData.multicaixa_frametoken,
            callbackUrl: settingsData.multicaixa_callback || window.location.origin + "/api/payment-callback",
            cssUrl: settingsData.multicaixa_cssurl || window.location.origin + "/multicaixa-express.css"
          });

          // Update payment record with token
          await updatePaymentWithEmisToken(
            reference, 
            emisTokenData.id,
            emisTokenData
          );
          
          // Show the payment iframe
          showPaymentIframe(emisTokenData.id);
          
        } catch (error) {
          console.error('Error processing EMIS token:', error);
          
          // FALLBACK for demo/development
          console.log('Using fallback mock payment URL due to CORS/API issues');
          const mockToken = `mock-token-${Date.now()}`;
          showPaymentIframe(mockToken);
        }
      }
      
      // Always set processing to false when done
      setIsProcessing(false);
      
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('failed');
      toast.error(error.message || 'Ocorreu um erro ao iniciar o pagamento');
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    iframeLoaded,
    showIframe,
    paymentUrl,
    paymentStatus,
    setIframeLoaded,
    handlePayment,
    updateOrderStatus
  };
};
