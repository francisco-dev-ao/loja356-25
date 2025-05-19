
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for payment transactions
 */

interface PaymentTransaction {
  order_id: string;
  reference: string;
  amount: number;
  status: string;
  payment_method: string;
}

/**
 * Save a payment transaction to the database
 */
export const savePaymentTransaction = async (
  transaction: PaymentTransaction
): Promise<{data: any, error: any}> => {
  try {
    const { data, error } = await supabase
      .from('multicaixa_express_payments')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao registrar transação: ${error.message}`);
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error saving payment transaction:', error);
    return { data: null, error };
  }
};
