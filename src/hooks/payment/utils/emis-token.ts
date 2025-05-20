
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
 * Generate EMIS token directly from the client
 * Note: This approach should only be used if backend token generation is not available
 * Ideally, token generation should be handled server-side
 */
export const generateEmisToken = async (params: EmisTokenParams): Promise<EmisTokenResponse> => {
  try {
    console.log("Generating EMIS token directly with params:", params);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    };

    const response = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from EMIS API:', response.status, errorText);
      throw new Error(`Erro na API EMIS: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();
    console.log('EMIS API response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Invalid JSON in EMIS response:', responseText, e);
      throw new Error('Resposta inválida da API EMIS');
    }

    if (!data || !data.id) {
      console.error('Missing token ID in EMIS response:', data);
      throw new Error('ID do token não encontrado na resposta da API');
    }

    return data;
  } catch (error: any) {
    console.error('Error generating EMIS token:', error);
    toast.error(`Erro na geração do token: ${error.message || 'Falha na comunicação com EMIS'}`);
    throw error;
  }
};

/**
 * Update payment record with EMIS token and response
 * (This would require database access - included for API compatibility)
 */
export const updatePaymentWithEmisToken = async (reference: string, emisToken: string, emisResponse: any): Promise<void> => {
  // Since we're not using Supabase directly, this can be a no-op or adapted to local storage
  console.log('Payment token stored:', { reference, emisToken, responseData: emisResponse });
  
  // Store the token in localStorage for reference
  localStorage.setItem(`payment_token_${reference}`, emisToken);
  localStorage.setItem(`payment_data_${reference}`, JSON.stringify(emisResponse));
};

/**
 * Construct the iframe URL for the payment page - using direct portal/frame URL format
 */
export const constructIframeUrl = (emisTokenId: string): string => {
  return `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${emisTokenId}`;
};
