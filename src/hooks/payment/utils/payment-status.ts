
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for payment status updates
 */

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

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

/**
 * Function to verify the payment status
 */
export const verifyMulticaixaPaymentStatus = async (paymentReference: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('multicaixa_express_payments')
      .select('status')
      .eq('reference', paymentReference)
      .single();

    if (error) {
      throw new Error(`Error verifying payment status: ${error.message}`);
    }

    return data?.status || 'pending';
  } catch (error) {
    console.error('Failed to verify payment status:', error);
    return 'pending';
  }
};

/**
 * Function to update payment status
 */
export const updateMulticaixaPaymentStatus = async (
  paymentReference: string, 
  status: 'pending' | 'completed' | 'failed', 
  emisResponse?: any
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (emisResponse) {
      updateData.emis_response = emisResponse;
    }

    const { error } = await supabase
      .from('multicaixa_express_payments')
      .update(updateData)
      .eq('reference', paymentReference);

    if (error) {
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
};
