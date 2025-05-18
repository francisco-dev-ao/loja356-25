import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState(0);
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

  // Setup loading progress simulation
  useEffect(() => {
    let interval: number | undefined;
    
    if (isProcessing && !iframeLoaded && showIframe) {
      setPaymentStatus('processing');
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          return prev + 5;
        });
      }, 500);
    }
    
    if (iframeLoaded) {
      setProgress(100);
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, iframeLoaded, showIframe]);

  // Auto-initiate payment when component mounts if orderId exists
  useEffect(() => {
    if (orderId && !showIframe) {
      handlePayment();
    }
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
    setProgress(10);
    
    try {
      // Generate payment reference
      const reference = generateReference();
      
      // Create EMIS payment session
      const emisPaymentUrl = await createEmisSession(amount, reference);
      
      if (!emisPaymentUrl) {
        throw new Error('Falha ao gerar sessão de pagamento');
      }
      
      // Store reference in local storage (similar to PHP session)
      localStorage.setItem(`refer_rce_${orderId}`, reference);
      
      console.log('Payment URL generated:', emisPaymentUrl);
      
      // Show the iframe and set its source to the payment URL
      setShowIframe(true);
      if (iframeRef.current) {
        iframeRef.current.src = emisPaymentUrl;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('failed');
      toast.error('Ocorreu um erro ao iniciar o pagamento');
      setIsProcessing(false);
    }
  };
  
  // Create EMIS payment session using production values
  const createEmisSession = async (amount: number, reference: string): Promise<string> => {
    try {
      // These are production values from EMIS based on the PHP code
      const frameToken = "YOUR_FRAME_TOKEN"; // Using the placeholder from PHP code
      const callbackUrl = window.location.origin + "/api/payment-callback"; // Replace with your actual callback URL
      const cssUrl = window.location.origin + "/multicaixa-express.css";
      
      // Using the production URL from PHP code
      const emisBaseUrl = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame";
      
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
      
      return `${emisBaseUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error creating EMIS session:', error);
      return '';
    }
  };

  // Function to verify payment status
  const checkPaymentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, payment_status')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      if (data && data.payment_status === 'paid') {
        setPaymentStatus('completed');
        toast.success('Pagamento confirmado!');
        clearCart();
        navigate(`/checkout/success?orderId=${orderId}`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
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
        <div className="transition-all duration-300">
          {!iframeLoaded && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-center text-gray-500 mb-2">Carregando página de pagamento segura...</p>
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-xs text-center text-gray-400">{progress}%</p>
              <div className="flex justify-center mt-2">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}
          <div className={`${iframeLoaded ? 'opacity-100' : 'opacity-40'} border rounded-lg overflow-hidden transition-all`}>
            <iframe
              ref={iframeRef}
              onLoad={handleIframeLoad}
              className="w-full h-[500px] border-0"
              title="Pagamento Multicaixa Express"
            />
          </div>
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
    </div>
  );
};

export default MulticaixaExpressPayment;
