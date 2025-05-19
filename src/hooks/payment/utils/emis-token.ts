
import { supabase } from '@/integrations/supabase/client';

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
    const { data: emisTokenData, error: emisTokenError } = await supabase
      .functions.invoke('generate-emis-token', {
        body: params
      });

    if (emisTokenError) {
      throw new Error(`Error calling EMIS token function: ${emisTokenError.message}`);
    }

    if (!emisTokenData || !emisTokenData.id) {
      throw new Error('Falha ao obter token de pagamento');
    }
    
    console.log('EMIS token response:', emisTokenData);
    return emisTokenData;
  } catch (error: any) {
    console.error('Error generating EMIS token:', error);
    // For development purposes, return a mock token
    const mockToken = `mock-token-${Date.now()}`;
    return { 
      id: mockToken,
      status: "MOCK", 
      message: "Mock token for development (EMIS API unreachable)" 
    };
  }
};

/**
 * Update payment record with EMIS token and response
 */
export const updatePaymentWithEmisToken = async (reference: string, emisToken: string, emisResponse: any): Promise<void> => {
  try {
    await supabase
      .from('multicaixa_express_payments')
      .update({
        emis_token: emisToken,
        emis_response: emisResponse
      })
      .eq('reference', reference);
  } catch (error) {
    console.error('Error updating payment with EMIS token:', error);
  }
};

/**
 * Construct the iframe URL for the payment page
 */
export const constructIframeUrl = (emisTokenId: string): string => {
  return `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${emisTokenId}`;
};
