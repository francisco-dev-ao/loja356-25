
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Utility functions for EMIS token generation and management
 */

interface EmisTokenParams {
  reference: string;
  amount: string;
  token: string;
  callbackUrl: string;
  cssUrl: string;
}

interface EmisTokenResponse {
  id: string;
  status?: string;
  message?: string;
}

/**
 * Generate EMIS token using the server-side edge function
 */
export const generateEmisToken = async (params: EmisTokenParams): Promise<EmisTokenResponse> => {
  try {
    console.log("Calling EMIS token generation with params:", params);

    const { data: emisTokenData, error: emisTokenError } = await supabase
      .functions.invoke('generate-emis-token', {
        body: params
      });

    if (emisTokenError) {
      console.error('Error calling EMIS token function:', emisTokenError);
      throw new Error(`Error calling EMIS token function: ${emisTokenError.message}`);
    }

    if (!emisTokenData) {
      throw new Error('No response data received from EMIS token function');
    }

    if (emisTokenData.error) {
      console.error('EMIS token function returned error:', emisTokenData.error);
      throw new Error(`EMIS token error: ${emisTokenData.error}`);
    }

    if (!emisTokenData.id) {
      console.error('EMIS token response missing ID:', emisTokenData);
      throw new Error('Falha ao obter token de pagamento: ID não encontrado');
    }
    
    console.log('EMIS token response:', emisTokenData);
    return emisTokenData;
  } catch (error: any) {
    console.error('Error generating EMIS token:', error);
    toast.error(`Erro no processamento do pagamento: ${error.message || 'Erro desconhecido'}`);
    throw error;
  }
};

/**
 * Update payment record with EMIS token and response
 */
export const updatePaymentWithEmisToken = async (reference: string, emisToken: string, emisResponse: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('multicaixa_express_payments')
      .update({
        emis_token: emisToken,
        emis_response: emisResponse
      })
      .eq('reference', reference);

    if (error) {
      console.error('Error updating payment with EMIS token:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating payment with EMIS token:', error);
    throw error;
  }
};

/**
 * Construct the iframe URL for the payment page - using direct portal/frame URL format
 */
export const constructIframeUrl = (emisTokenId: string): string => {
  return `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${emisTokenId}`;
};
