/**
 * Multicaixa Reference Payment API integration
 */

interface MulticaixaRefPaymentRequest {
  amount: number;
  description: string;
}

interface MulticaixaRefPaymentResponse {
  success: boolean;
  reference?: string;
  amount?: number;
  description?: string;
  status?: string;
  error?: string;
}

/**
 * Create a Multicaixa reference payment
 */
export const createMulticaixaRefPayment = async ({
  amount,
  description
}: MulticaixaRefPaymentRequest): Promise<MulticaixaRefPaymentResponse> => {
  try {
    console.log("Iniciando pagamento por referência MCX:", { amount, description });
    
    const response = await fetch("https://api.angohost.ao/appypay/ref", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        description
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Resposta da API Multicaixa Ref:", data);

    return {
      success: true,
      reference: data.reference,
      amount: data.amount,
      description: data.description,
      status: data.status || 'pending'
    };
  } catch (error: any) {
    console.error("Erro ao criar pagamento por referência:", error);
    return {
      success: false,
      error: error.message || "Falha ao criar referência de pagamento"
    };
  }
};

/**
 * Format amount for display (convert from cents)
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(amount / 100);
};