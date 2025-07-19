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

const MULTICAIXA_EXPRESS_API = 'https://gpo-express.angohost.ao';

/**
 * Create Multicaixa Express Payment Token
 */
export const createMulticaixaExpressPayment = async (
  request: MulticaixaExpressRequest
): Promise<MulticaixaExpressResponse> => {
  try {
    console.log('🔄 Criando token de pagamento Multicaixa Express:', request);

    const response = await fetch(`${MULTICAIXA_EXPRESS_API}/api/gerar-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token criado com sucesso:', data);
      return data;
    } else {
      throw new Error(`Erro HTTP: ${response.status}`);
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

    const response = await fetch(`${MULTICAIXA_EXPRESS_API}/api/servicos/${servicoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status verificado:', data);
      return data;
    } else {
      throw new Error(`Erro HTTP: ${response.status}`);
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