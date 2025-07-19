export interface MulticaixaExpressRequest {
  total: number;
  user_data: {
    name: string;
    surname: string;
    email: string;
    gsm?: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface MulticaixaExpressCheckout {
  id: string;
  data: {
    total: number;
    user_data: {
      name: string;
      surname: string;
      email: string;
      gsm?: string;
    };
  };
  status: string;
  created_at: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface MulticaixaExpressResponse {
  success: boolean;
  checkout?: MulticaixaExpressCheckout;
  data?: {
    payment_url: string;
    transaction_id: string;
  };
  reference?: string;
  error?: string;
  message?: string;
}

export interface MulticaixaExpressVerifyResponse {
  confirmed: boolean;
  checkout: {
    id: string;
    status: string;
  };
}

const MULTICAIXA_EXPRESS_API = 'https://gpo-express.angohost.ao';

/**
 * Create Multicaixa Express Checkout
 */
export const createMulticaixaExpressCheckout = async (
  request: MulticaixaExpressRequest
): Promise<MulticaixaExpressResponse> => {
  try {
    console.log('🔄 Criando checkout Multicaixa Express:', request);

    const response = await fetch(`${MULTICAIXA_EXPRESS_API}/api/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Checkout criado com sucesso:', data);
      return data;
    } else {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar checkout',
      message: 'Erro na comunicação com o serviço Multicaixa Express'
    };
  }
};

/**
 * Process Multicaixa Express Payment
 */
export const processMulticaixaExpressPayment = async (
  checkout: MulticaixaExpressCheckout,
  orderReference: string
): Promise<MulticaixaExpressResponse> => {
  try {
    console.log('🔄 Processando pagamento Multicaixa Express:', checkout.id);

    const response = await fetch(`${MULTICAIXA_EXPRESS_API}/api/payment/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_data: checkout,
        order_reference: orderReference,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pagamento processado com sucesso:', data);
      return data;
    } else {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar pagamento',
      message: 'Erro na comunicação com o serviço Multicaixa Express'
    };
  }
};

/**
 * Verify Multicaixa Express Payment Status
 */
export const verifyMulticaixaExpressPayment = async (
  checkoutId: string
): Promise<MulticaixaExpressVerifyResponse> => {
  try {
    console.log('🔄 Verificando status do pagamento:', checkoutId);

    const response = await fetch(`${MULTICAIXA_EXPRESS_API}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificando: true,
        id: checkoutId,
      }),
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
      confirmed: false,
      checkout: {
        id: checkoutId,
        status: 'error'
      }
    };
  }
};

/**
 * Get Payment Form URL
 */
export const getMulticaixaExpressPaymentUrl = (checkoutId: string): string => {
  return `${MULTICAIXA_EXPRESS_API}/payform/${checkoutId}`;
};