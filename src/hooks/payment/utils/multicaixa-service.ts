
import { supabase } from '@/integrations/supabase/client';
import { MulticaixaConfig, MulticaixaPayment } from '@/types/database';
import { generateReference } from './payment-reference';

// Function to get active Multicaixa Express configuration
export const getActiveMulticaixaConfig = async (): Promise<MulticaixaConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('multicaixa_express_config')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Error fetching Multicaixa Express config: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to get active Multicaixa configuration:', error);
    return null;
  }
};

// Function to get all Multicaixa settings
export const getMulticaixaSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('multicaixa_frametoken, multicaixa_callback, multicaixa_success, multicaixa_error, multicaixa_cssurl')
      .single();

    if (error) {
      throw new Error(`Error fetching Multicaixa settings: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to get Multicaixa settings:', error);
    return null;
  }
};

// Direct integration with EMIS API - this would normally be handled server-side
export const initiateMulticaixaExpressPayment = async ({ 
  orderId, 
  amount, 
  maxRetries = 3
}: { 
  orderId: string; 
  amount: number;
  maxRetries?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> => {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // First, get the active Multicaixa Express configuration
      const config = await getActiveMulticaixaConfig();
      if (!config) {
        throw new Error("No active Multicaixa Express configuration found");
      }

      // Generate a unique payment reference
      const reference = generateReference(orderId);

      console.log("Enviando requisição para API EMIS:", {
        reference,
        amount,
        token: config.frame_token,
        mobile: "PAYMENT",
        card: "DISABLED",
        qrCode: "PAYMENT",
        cssUrl: config.css_url || "https://pagamentonline.emis.co.ao/gpoconfig/qr_code_mobile_v2.css",
        callbackUrl: config.callback_url
      });

      // Create a record in the database for this payment attempt
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
        throw new Error(`Error creating payment record: ${paymentError.message}`);
      }

      // In a real implementation, we would call the EMIS API here
      // Since we're using a mock/simulation, we'll just return the reference as the token
      // and handle the UI flow separately
      
      // Return success with the payment reference as the ID
      return {
        success: true,
        id: reference
      };
    } catch (error: any) {
      console.error("Error calling EMIS API:", error);
      retryCount++;

      if (retryCount >= maxRetries) {
        return {
          success: false,
          error: error.message || "Failed to initiate payment after multiple attempts"
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
    }
  }

  return {
    success: false,
    error: "Maximum retry attempts exceeded"
  };
};

// Function to verify the payment status
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

// Function to update payment status
export const updateMulticaixaPaymentStatus = async (
  paymentReference: string, 
  status: 'pending' | 'completed' | 'failed', 
  emisResponse?: any
): Promise<void> => {
  try {
    const updateData: Partial<MulticaixaPayment> = {
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

// Function to construct EMIS iframe URL
export const constructEmisIframeUrl = (paymentReference: string): string => {
  if (!paymentReference) {
    throw new Error("Payment reference is required");
  }
  
  // Direct integration with EMIS iframe URL
  return `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${paymentReference}`;
};
