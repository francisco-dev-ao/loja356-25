
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { verifyPaymentStatus, updateOrderStatus } from './utils/payment-status';

interface UsePaymentVerificationProps {
  orderId: string | null;
}

export const usePaymentVerification = ({ orderId }: UsePaymentVerificationProps) => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const { clearCart } = useCart();

  // Setup automatic payment verification checking
  useEffect(() => {
    if (!orderId) return;

    const checkStatus = async () => {
      try {
        const status = await verifyPaymentStatus(orderId);
        
        if (status === 'paid') {
          setPaymentStatus('completed');
          clearCart();
          navigate(`/checkout/success?orderId=${orderId}`);
        }
      } catch (error) {
        console.error('Error in payment verification:', error);
      }
    };

    const interval = setInterval(checkStatus, 1500);
    return () => clearInterval(interval);
  }, [orderId, navigate, clearCart]);

  return {
    paymentStatus,
    setPaymentStatus,
    updateOrderStatus
  };
};
