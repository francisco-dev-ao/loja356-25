
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { OrderStatus, PaymentStatus } from './utils/payment-status';

interface UsePaymentMessageHandlerProps {
  orderId: string;
  updateOrderStatus: (status: string, paymentStatus: string) => Promise<void>;
  setPaymentStatus: (status: 'pending' | 'processing' | 'completed' | 'failed') => void;
  setShowIframe?: (show: boolean) => void;
  setIsProcessing?: (processing: boolean) => void;
}

export const usePaymentMessageHandler = ({
  orderId,
  updateOrderStatus,
  setPaymentStatus,
  setShowIframe,
  setIsProcessing
}: UsePaymentMessageHandlerProps) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

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
          if (setIsProcessing) setIsProcessing(false);
          if (setShowIframe) setShowIframe(false);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [orderId, navigate, clearCart, updateOrderStatus, setPaymentStatus]);
};
