
import { supabase } from '@/integrations/supabase/client';
import { generateReference } from './payment-reference';

interface MulticaixaExpressConfig {
  frametoken: string;
  callback: string;
  success: string;
  error: string;
  cssurl?: string;
}

interface MulticaixaResponse {
  id?: string;
  message?: string;
  success: boolean;
  error?: string;
}

interface PaymentDetails {
  orderId: string;
  amount: number;
  items?: any[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// Função para obter as configurações do Multicaixa Express
export const getMulticaixaExpressConfig = async (): Promise<MulticaixaExpressConfig | null> => {
  try {
    // Primeiro, tente obter da tabela multicaixa_express_config
    const { data: configData, error: configError } = await supabase
      .from("multicaixa_express_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (configError) {
      console.error("Error fetching Multicaixa Express config:", configError);
    }

    if (configData) {
      return {
        frametoken: configData.frame_token,
        callback: configData.callback_url,
        success: configData.success_url,
        error: configData.error_url,
        cssurl: configData.css_url || "https://pagamentonline.emis.co.ao/gpoconfig/qr_code_mobile_v2.css"
      };
    }

    // Se não encontrar na tabela específica, tente nas configurações gerais
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "company-settings")
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }

    if (data) {
      return {
        frametoken: data.multicaixa_frametoken || "a53787fd-b49e-4469-a6ab-fa6acf19db48",
        callback: data.multicaixa_callback || `${window.location.origin}/api/payment-callback`,
        success: data.multicaixa_success || `${window.location.origin}/checkout/success`,
        error: data.multicaixa_error || `${window.location.origin}/checkout/failed`,
        cssurl: data.multicaixa_cssurl || "https://pagamentonline.emis.co.ao/gpoconfig/qr_code_mobile_v2.css"
      };
    }

    return {
      frametoken: "a53787fd-b49e-4469-a6ab-fa6acf19db48",
      callback: `${window.location.origin}/api/payment-callback`,
      success: `${window.location.origin}/checkout/success`,
      error: `${window.location.origin}/checkout/failed`,
      cssurl: "https://pagamentonline.emis.co.ao/gpoconfig/qr_code_mobile_v2.css"
    };
  } catch (error) {
    console.error("Error in getMulticaixaExpressConfig:", error);
    return null;
  }
};

// Função para iniciar o pagamento Multicaixa Express
export const initiateMulticaixaExpressPayment = async (
  paymentDetails: PaymentDetails
): Promise<MulticaixaResponse> => {
  try {
    const config = await getMulticaixaExpressConfig();
    
    if (!config) {
      return {
        success: false,
        error: "Erro ao obter configurações do Multicaixa Express"
      };
    }

    if (!paymentDetails.orderId) {
      console.error("Missing orderId in payment details", paymentDetails);
      return {
        success: false,
        error: "ID do pedido é obrigatório"
      };
    }

    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      console.error("Invalid amount in payment details", paymentDetails);
      return {
        success: false,
        error: "Valor do pagamento deve ser maior que zero"
      };
    }
    
    // Gerar referência para Multicaixa
    const reference = generateReference(paymentDetails.orderId);
    
    // Construir os parâmetros para a API EMIS (integração direta)
    const requestBody = {
      reference: reference,
      amount: paymentDetails.amount,
      token: config.frametoken,
      mobile: "PAYMENT", 
      card: "DISABLED", // Desabilitar pagamento com cartão, apenas mobile
      qrCode: "PAYMENT",
      cssUrl: config.cssurl || "https://pagamentonline.emis.co.ao/gpoconfig/qr_code_mobile_v2.css",
      callbackUrl: config.callback
    };

    console.log("Enviando requisição para API EMIS:", requestBody);
    
    try {
      // Salvando a referência do pagamento no banco de dados antes de chamar a Edge Function
      const { data: paymentRef, error: paymentRefError } = await supabase
        .from("multicaixa_express_payments")
        .insert({
          order_id: paymentDetails.orderId,
          reference: reference,
          amount: paymentDetails.amount,
          status: "pending"
        })
        .select()
        .single();
      
      if (paymentRefError) {
        console.error("Error saving payment reference:", paymentRefError);
        // Continue mesmo com erro
      }
      
      // Fazer a chamada para a Edge Function que se conecta à API EMIS
      const { data, error } = await supabase.functions.invoke(
        'generate-emis-token',
        {
          body: {
            reference: reference,
            amount: paymentDetails.amount
          }
        }
      );
      
      if (error) {
        console.error('Erro na resposta da Edge Function:', error);
        throw new Error(error.message || "Erro na função de geração de token");
      }
      
      if (!data || !data.id) {
        console.error('Resposta inválida da Edge Function:', data);
        throw new Error("Resposta inválida da função de geração de token");
      }
      
      console.log("Resposta da Edge Function (EMIS token):", data);
      
      // Atualizar o registro do pagamento com o token EMIS
      const { error: updateError } = await supabase
        .from("multicaixa_express_payments")
        .update({
          token: data.id
        })
        .eq("reference", reference);
      
      if (updateError) {
        console.error("Error updating payment record with token:", updateError);
        // Continue mesmo com erro
      }
      
      return {
        success: true,
        id: data.id
      };
    } catch (emisError: any) {
      console.error("Error calling EMIS API via Edge Function:", emisError);
      return {
        success: false,
        error: emisError.message || "Erro ao comunicar com a API EMIS"
      };
    }
  } catch (error) {
    console.error("Error in initiateMulticaixaExpressPayment:", error);
    return {
      success: false,
      error: "Erro ao iniciar pagamento Multicaixa Express"
    };
  }
};

// Função para verificar o status do pagamento
export const checkMulticaixaPaymentStatus = async (orderId: string): Promise<boolean> => {
  try {
    if (!orderId) {
      console.error("No orderId provided to checkMulticaixaPaymentStatus");
      return false;
    }
    
    const { data, error } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.error("Error checking payment status:", error);
      return false;
    }

    return data?.payment_status === "paid";
  } catch (error) {
    console.error("Error in checkMulticaixaPaymentStatus:", error);
    return false;
  }
};
