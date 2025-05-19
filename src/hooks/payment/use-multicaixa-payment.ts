
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';

interface UseMulticaixaPaymentProps {
  amount: number;
  orderId: string;
}

export const useMulticaixaPayment = ({ amount, orderId }: UseMulticaixaPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const { clearCart } = useCart();

  // Generate a unique reference ID based on order ID
  const generateReference = () => {
    return `${orderId}-AH-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
  };

  // Verify if payment was completed
  const verifyPaymentStatus = async () => {
    try {
      console.log('Checking payment status for order:', orderId);
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      if (data && data.payment_status === 'paid') {
        console.log('Payment confirmed as paid!');
        setPaymentStatus('completed');
        clearCart();
        navigate(`/checkout/success?orderId=${orderId}`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Setup automatic payment verification checking
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(verifyPaymentStatus, 1500);
    return () => clearInterval(interval);
  }, [orderId]);

  const updateOrderStatus = async (status: string, paymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: status,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

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
      const reference = generateReference();
      
      // Store reference in local storage (similar to PHP session)
      localStorage.setItem(`refer_rce_${orderId}`, reference);
      
      // Get settings from the database
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (settingsError) {
        throw new Error('Erro ao buscar configurações de pagamento');
      }
      
      if (!settingsData) {
        throw new Error('Configurações não encontradas');
      }
      
      // Create payment parameters
      const frameToken = settingsData.multicaixa_frametoken || 'a53787fd-b49e-4469-a6ab-fa6acf19db48';
      const callbackUrl = settingsData.multicaixa_callback || window.location.origin + "/api/payment-callback";
      const cssUrl = window.location.origin + "/multicaixa-express.css";
      
      // Construct the payment URL with the correct params
      const emisBaseUrl = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken";
      
      // Save the payment transaction to the database
      const { data: paymentData, error: paymentError } = await supabase
        .from('multicaixa_express_payments')
        .insert({
          order_id: orderId,
          reference: reference,
          amount: amount,
          status: 'pending',
          payment_method: 'multicaixa'
        })
        .select()
        .single();
        
      if (paymentError) {
        throw new Error(`Erro ao registrar transação: ${paymentError.message}`);
      }
      
      // URL parameters for EMIS payment page - this matches the PHP implementation
      const params = {
        reference: reference,
        amount: amount.toString(),
        token: frameToken,
        mobile: 'PAYMENT',
        card: 'DISABLED',
        qrCode: 'PAYMENT',
        cssUrl: cssUrl,
        callbackUrl: callbackUrl
      };
      
      // Make API request to EMIS
      const response = await fetch(emisBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      const responseData = await response.json();
      
      if (!responseData.id) {
        throw new Error(responseData.message || 'Erro ao gerar token de pagamento');
      }
      
      // Update payment record with token
      await supabase
        .from('multicaixa_express_payments')
        .update({
          emis_token: responseData.id
        })
        .eq('reference', reference);
      
      // Construct the iframe URL
      const iframeUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${responseData.id}`;
      console.log('Generated payment URL:', iframeUrl);
      
      // Show the iframe and set its source
      setPaymentUrl(iframeUrl);
      setShowIframe(true);
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
