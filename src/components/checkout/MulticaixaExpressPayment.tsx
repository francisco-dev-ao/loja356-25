
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (should match EMIS domain in production)
      // In development, you might want to accept all origins for testing
      
      try {
        // Handle payment success message from EMIS iframe
        if (event.data && event.data.status === 'payment_success') {
          toast.success('Pagamento efetuado com sucesso!');
          
          // Update order status in the database
          updateOrderStatus('completed', 'paid');
          
          // Redirect to success page
          navigate(`/checkout/success?orderId=${orderId}`);
        }
        
        // Handle payment failure message from EMIS iframe
        if (event.data && event.data.status === 'payment_failed') {
          toast.error('Falha no pagamento. Por favor, tente novamente.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [orderId, navigate]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
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
    
    setIsProcessing(true);
    
    // In a real implementation, we would integrate with the EMIS API
    // For now, we'll simulate the payment process
    
    try {
      // For a real implementation, we would:
      // 1. Send a request to our backend to initiate payment with EMIS
      // 2. Receive a payment URL or token to redirect the user
      // 3. Either redirect or display the payment iframe
      
      // Simulate loading the payment iframe
      setTimeout(() => {
        if (iframeRef.current) {
          // In a real implementation, the src would be set to the EMIS payment URL
          iframeRef.current.src = "https://..."; // EMIS payment URL would go here
        }
        
        // For demo purposes, we'll just show a success message after a delay
        setTimeout(() => {
          toast.success('Demonstração: Pagamento processado com sucesso!');
          updateOrderStatus('completed', 'paid');
          navigate(`/checkout/success?orderId=${orderId}`);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Ocorreu um erro ao processar o pagamento');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800">Informação de Pagamento</h3>
        <p className="text-sm text-blue-600 mt-1">
          Será redirecionado para a plataforma Multicaixa Express para completar o seu pagamento de forma segura.
        </p>
      </div>
      
      <div className="hidden">
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          className="w-full h-96 border-0"
          title="Pagamento Multicaixa Express"
        />
      </div>
      
      <Button
        onClick={handlePayment}
        className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 py-6"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Processando pagamento...
          </span>
        ) : (
          <span className="flex items-center">
            Pagar com Multicaixa Express
            <Send size={16} className="ml-2" />
          </span>
        )}
      </Button>
    </div>
  );
};

export default MulticaixaExpressPayment;
