
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/formatters';

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  const { clearCart } = useCart();

  // Generate a unique reference ID based on order ID
  const generateReference = () => {
    return `${orderId}-AH-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
  };

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (EMIS production domain)
      const allowedOrigins = ['https://pagamentonline.emis.co.ao'];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('Received message from unauthorized origin:', event.origin);
        return;
      }
      
      try {
        console.log('Received message from EMIS:', event.data);
        
        // Handle payment success message from EMIS iframe
        if (event.data && event.data.status === 'ACCEPTED') {
          setPaymentStatus('completed');
          toast.success('Pagamento efetuado com sucesso!');
          
          // Update order status in the database
          updateOrderStatus('completed', 'paid');
          
          // Clear cart
          clearCart();
          
          // Redirect to success page
          navigate(`/checkout/success?orderId=${orderId}`);
        }
        
        // Handle payment failure message from EMIS iframe
        if (event.data && event.data.status === 'DECLINED') {
          setPaymentStatus('failed');
          toast.error('Falha no pagamento. Por favor, tente novamente.');
          setIsProcessing(false);
          setShowIframe(false);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [orderId, navigate, clearCart]);

  // Auto-initiate payment when component mounts if orderId exists
  useEffect(() => {
    if (orderId && !showIframe) {
      handlePayment();
    }
  }, [orderId]);

  // Setup automatic payment verification checking
  useEffect(() => {
    if (!orderId) return;

    const checkPaymentStatus = () => {
      verifyPaymentStatus();
    };

    const interval = setInterval(checkPaymentStatus, 1500);
    
    return () => clearInterval(interval);
  }, [orderId]);

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setIframeLoaded(true);
    setIsProcessing(false);
  };

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

  const handlePayment = async () => {
    if (!user) {
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
        .select('multicaixa_frametoken, multicaixa_callback, multicaixa_success, multicaixa_error')
        .single();
      
      if (settingsError) {
        throw new Error('Erro ao buscar configurações de pagamento');
      }
      
      // Create payment parameters
      const frameToken = settingsData?.multicaixa_frametoken || 'a53787fd-b49e-4469-a6ab-fa6acf19db48';
      const callbackUrl = settingsData?.multicaixa_callback || window.location.origin + "/api/payment-callback";
      const cssUrl = window.location.origin + "/multicaixa-express.css";
      
      // Construct the payment URL with the correct params
      const emisBaseUrl = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken";
      
      // URL parameters for EMIS payment page
      const params = new URLSearchParams({
        reference: reference,
        amount: amount.toString(),
        token: frameToken,
        mobile: 'PAYMENT',
        card: 'DISABLED',
        qrCode: 'PAYMENT',
        cssUrl: cssUrl,
        callbackUrl: callbackUrl,
      });
      
      const paymentUrl = `${emisBaseUrl}?${params.toString()}`;
      console.log('Generated payment URL:', paymentUrl);
      
      // Show the iframe and set its source
      setPaymentUrl(paymentUrl);
      setShowIframe(true);
      
      // Save the payment transaction to the database
      await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          amount: amount,
          payment_method: 'multicaixa',
          reference: reference,
          status: 'pending',
        });
      
      console.log('Payment transaction recorded in database');
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('failed');
      toast.error('Ocorreu um erro ao iniciar o pagamento');
      setIsProcessing(false);
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
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800">Informação de Pagamento</h3>
        <p className="text-sm text-blue-600 mt-1">
          Total a pagar: <strong>{formatPrice(amount)}</strong>
        </p>
      </div>
      
      {showIframe ? (
        <div className="border rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            src={paymentUrl}
            onLoad={handleIframeLoad}
            className="w-full h-[500px] border-0"
            title="Pagamento Multicaixa Express"
          />
        </div>
      ) : (
        <Button
          onClick={handlePayment}
          className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 py-6"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Iniciando pagamento...
            </span>
          ) : (
            <span className="flex items-center">
              Pagar com Multicaixa Express
              <Send size={16} className="ml-2" />
            </span>
          )}
        </Button>
      )}
      
      <div className="bg-white p-6 rounded-lg text-center text-gray-700 border">
        <h3 className="font-bold text-lg mb-4">Dicas para ter um pagamento de sucesso!</h3>
        <ol className="text-left space-y-2">
          <li>1. Após clicar em pagar escolha a opção Multicaixa Express e clique em confirmar.</li>
          <li>2. Certifique-se que tenha o aplicativo Multicaixa Express instalado.</li>
          <li>3. Insira o seu contacto associado ao Multicaixa Express.</li>
          <li>4. Verifique o valor a ser cobrado no Multicaixa Express e confirme a compra.</li>
        </ol>
      </div>
    </div>
  );
};

export default MulticaixaExpressPayment;
