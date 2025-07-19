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
    console.log('🔄 Valor enviado para API:', request.valor);

    const requestBody = {
      valor: request.valor,  // Valor exato como será processado
      tipo: request.tipo,
      descricao: request.descricao,
      cliente: {
        nome: request.cliente.nome,
        email: request.cliente.email
      }
    };

    console.log('🔄 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${MULTICAIXA_EXPRESS_API}/api/gerar-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔄 Response status:', response.status);
    console.log('🔄 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token criado com sucesso:', data);
      return data;
    } else {
      // Tentar ler a resposta de erro
      let errorData;
      try {
        errorData = await response.json();
        console.log('❌ Resposta de erro completa:', errorData);
      } catch {
        console.log('❌ Não foi possível ler a resposta de erro como JSON');
      }
      
      const errorMessage = errorData?.error || errorData?.message || `Erro HTTP: ${response.status}`;
      throw new Error(errorMessage);
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