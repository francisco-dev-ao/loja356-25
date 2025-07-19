export interface MulticaixaExpressRequest {
  valor: number;
  tipo: string;
  descricao: string;
  cliente: {
    nome: string;
    email: string;
  };
}

export interface MulticaixaExpressResponse {
  success: boolean;
  token?: string;
  servicoId?: string;
  paymentUrl?: string;
  iframeUrl?: string;
  integration?: {
    iframe: string;
    redirect: string;
    newWindow: string;
  };
  error?: string;
  message?: string;
}

export interface MulticaixaExpressStatusResponse {
  id: string;
  status: string;
  valor: number;
  tipo: string;
  dataAprovacao?: string;
  cliente?: {
    nome: string;
    email: string;
  };
}

import { supabase } from '@/integrations/supabase/client';

const MULTICAIXA_EXPRESS_API = 'https://gpo-express.angohost.ao';

/**
 * Create Multicaixa Express Payment Token
 */
export const createMulticaixaExpressPayment = async (
  request: MulticaixaExpressRequest
): Promise<MulticaixaExpressResponse> => {
  try {
    console.log('🔄 Criando token de pagamento Multicaixa Express:', request);
    console.log('🔄 Valor enviado para API:', request.valor);

    const { data, error } = await supabase.functions.invoke('multicaixa-express-proxy', {
      body: {
        action: 'create-payment',
        valor: request.valor,
        tipo: request.tipo,
        descricao: request.descricao,
        cliente: {
          nome: request.cliente.nome,
          email: request.cliente.email
        }
      }
    });

    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw new Error(error.message || 'Erro na comunicação com o proxy');
    }

    console.log('✅ Resposta da Edge Function:', data);
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Erro ao criar pagamento');
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar token:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar token',
      message: 'Erro na comunicação com o serviço Multicaixa Express'
    };
  }
};

/**
 * Verify Multicaixa Express Payment Status
 */
export const verifyMulticaixaExpressPayment = async (
  servicoId: string
): Promise<MulticaixaExpressStatusResponse> => {
  try {
    console.log('🔄 Verificando status do pagamento:', servicoId);

    const { data, error } = await supabase.functions.invoke('multicaixa-express-proxy', {
      body: {
        action: 'verify-payment',
        servicoId: servicoId
      }
    });

    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw new Error(error.message || 'Erro na comunicação com o proxy');
    }

    console.log('✅ Status verificado via proxy:', data);
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Erro ao verificar pagamento');
    }
  } catch (error: any) {
    console.error('❌ Erro ao verificar pagamento:', error);
    return {
      id: servicoId,
      status: 'erro',
      valor: 0,
      tipo: 'fatura'
    };
  }
};

/**
 * Get Payment URL
 */
export const getMulticaixaExpressPaymentUrl = (token: string): string => {
  return `${MULTICAIXA_EXPRESS_API}/pagar?token=${token}`;
};