
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for payment status updates
 */

type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

/**
 * Update the order status in the database
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus, 
  paymentStatus: PaymentStatus
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Verify if payment was completed by checking the database
 */
export const verifyPaymentStatus = async (orderId: string): Promise<PaymentStatus> => {
  try {
    console.log('Checking payment status for order:', orderId);
    const { data, error } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data && data.payment_status === 'paid') {
      console.log('Payment confirmed as paid!');
      return 'paid';
    }
    
    return (data?.payment_status as PaymentStatus) || 'pending';
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};
