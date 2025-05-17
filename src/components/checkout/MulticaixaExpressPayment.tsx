
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/formatters';

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  const { clearCart } = useCart();

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (should match EMIS domain in production)
      const allowedOrigins = ['https://multicaixaexpress.co.ao', 'https://test.multicaixaexpress.co.ao'];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('Received message from unauthorized origin:', event.origin);
        return;
      }
      
      try {
        // Handle payment success message from EMIS iframe
        if (event.data && event.data.status === 'payment_success') {
          toast.success('Pagamento efetuado com sucesso!');
          
          // Update order status in the database
          updateOrderStatus('completed', 'paid');
          
          // Clear cart
          clearCart();
          
          // Redirect to success page
          navigate(`/checkout/success?orderId=${orderId}`);
        }
        
        // Handle payment failure message from EMIS iframe
        if (event.data && event.data.status === 'payment_failed') {
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

  useEffect(() => {
    // Auto-initiate payment when component mounts if orderId exists
    if (orderId && !showIframe) {
      handlePayment();
    }
  }, [orderId]);

  const handleIframeLoad = () => {
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
    
    try {
      // In a real production environment, this would be an API call to your backend
      // that would generate a payment session with EMIS and return the payment URL
      
      // For now, we'll simulate getting a payment URL from a backend
      const emisPaymentUrl = generatePaymentUrl(amount, orderId);
      
      // Show the iframe and set its source to the payment URL
      setShowIframe(true);
      if (iframeRef.current) {
        iframeRef.current.src = emisPaymentUrl;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Ocorreu um erro ao iniciar o pagamento');
      setIsProcessing(false);
    }
  };
  
  // Helper function to generate the payment URL
  // In production, this would come from your backend after registering the payment with EMIS
  const generatePaymentUrl = (amount: number, orderId: string) => {
    // In production, replace with the actual EMIS payment URL
    const baseUrl = "https://multicaixaexpress.co.ao/payment";
    
    // Add relevant parameters
    const url = new URL(baseUrl);
    url.searchParams.append("amount", amount.toString());
    url.searchParams.append("orderId", orderId);
    url.searchParams.append("merchantId", "YOUR_MERCHANT_ID"); // Replace with your merchant ID in production
    url.searchParams.append("returnUrl", window.location.origin + "/checkout/success");
    
    return url.toString();
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
          Total a pagar: <strong>{formatCurrency(amount)} kz</strong>
        </p>
      </div>
      
      {showIframe ? (
        <div className={`transition-all duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-40'}`}>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-center text-gray-500 mb-2">Carregando página de pagamento segura...</p>
            {!iframeLoaded && (
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="w-full h-[500px] border-0 rounded-lg"
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
    </div>
  );
};

export default MulticaixaExpressPayment;
