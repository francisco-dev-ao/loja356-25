import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Multicaixa Reference Payment API integration
 */

export interface MulticaixaRefPaymentRequest {
  orderId: string;
  amount: number;
  description?: string;
  validityDays?: number;
}

export interface MulticaixaRefPaymentResponse {
  success: boolean;
  entity: string;
  reference: string;
  amount: number;
  description: string;
  validity_date: string;
  validity_days: number;
  order_id: string;
  instructions: {
    pt: {
      title: string;
      steps: string[];
      note: string;
    };
  };
  payment_channels: string[];
  error?: string;
}

/**
 * Create a Multicaixa reference payment
 */
export const createMulticaixaRefPayment = async ({
  orderId,
  amount,
  description,
  validityDays = 2
}: MulticaixaRefPaymentRequest): Promise<MulticaixaRefPaymentResponse> => {
  try {
    console.log("Iniciando pagamento por referência MCX:", { orderId, amount, description });
    
    const response = await fetch("https://api.angohost.ao/appypay/ref", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        description: description || `Pedido #${orderId}`
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Resposta da API Multicaixa Ref:", data);

    // Calculate validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + validityDays);

    // Store payment reference in database (commented out until table is created)
    /*
    const { error: insertError } = await supabase
      .from("payment_references")
      .insert({
        order_id: orderId,
        reference: data.reference || data.merchantTransactionId,
        amount: amount,
        status: "pending",
        payment_method: "multicaixa_reference",
        entity: "11333",
        description: description || `Pedido #${orderId}`,
        validity_date: validityDate.toISOString()
      });

    if (insertError) {
      console.error('Error storing payment reference:', insertError);
      toast.error('Erro ao registrar referência de pagamento');
    }
    */

    return {
      success: true,
      entity: "11333",
      reference: data.reference || data.merchantTransactionId,
      amount: amount,
      description: description || `Pedido #${orderId}`,
      validity_date: validityDate.toISOString(),
      validity_days: validityDays,
      order_id: orderId,
      instructions: {
        pt: {
          title: "Como pagar por referência",
          steps: [
            "Vá a um ATM ou Multicaixa Express",
            "Selecione 'Pagamentos' → 'Outros Serviços'",
            "Digite a Entidade: 11333",
            `Digite a Referência: ${data.reference || data.merchantTransactionId}`,
            `Confirme o valor: KZ ${amount.toLocaleString('pt-AO')}`,
            "Confirme o pagamento"
          ],
          note: `Esta referência é válida até ${validityDate.toLocaleDateString('pt-AO')}`
        }
      },
      payment_channels: [
        "ATM",
        "Internet Banking", 
        "Multicaixa Express",
        "Balcão Bancário"
      ]
    };
  } catch (error: any) {
    console.error("Erro ao criar pagamento por referência:", error);
    return generateLocalReference({ orderId, amount, description, validityDays });
  }
};

/**
 * Generate local reference when API is unavailable
 */
const generateLocalReference = async ({
  orderId,
  amount,
  description,
  validityDays = 2
}: MulticaixaRefPaymentRequest): Promise<MulticaixaRefPaymentResponse> => {
  console.log('Generating fallback local reference:', { orderId, amount, description });
  
  // Generate 9-digit reference locally
  const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
  
  // Calculate validity date
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + validityDays);
  
  toast.error('API temporariamente indisponível. Referência gerada localmente.');
  
  return {
    success: true,
    entity: "11333",
    reference: reference,
    amount: amount,
    description: description || `Pedido #${orderId}`,
    validity_date: validityDate.toISOString(),
    validity_days: validityDays,
    order_id: orderId,
    instructions: {
      pt: {
        title: "Como pagar por referência",
        steps: [
          "Vá a um ATM ou Multicaixa Express",
          "Selecione 'Pagamentos' → 'Outros Serviços'",
          "Digite a Entidade: 11333",
          `Digite a Referência: ${reference}`,
          `Confirme o valor: KZ ${amount.toLocaleString('pt-AO')}`,
          "Confirme o pagamento"
        ],
        note: `Esta referência é válida até ${validityDate.toLocaleDateString('pt-AO')} - ⚠️ Modo de fallback`
      }
    },
    payment_channels: [
      "ATM",
      "Internet Banking", 
      "Multicaixa Express",
      "Balcão Bancário"
    ]
  };
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

/**
 * Validate payment reference format
 */
export const validateReferenceFormat = (reference: string): boolean => {
  // Multicaixa reference format: 9 digits
  const referenceRegex = /^\d{9}$/;
  return referenceRegex.test(reference);
};

/**
 * Check if a payment reference is still valid
 */
export const isReferenceValid = (validityDate: string): boolean => {
  const now = new Date();
  const validity = new Date(validityDate);
  return validity > now;
};

/**
 * Calculate time remaining for a payment reference
 */
export const getTimeRemaining = (validityDate: string): string => {
  const now = new Date().getTime();
  const validityTime = new Date(validityDate).getTime();
  const difference = validityTime - now;

  if (difference <= 0) {
    return 'Expirado';
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} dias, ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Multicaixa Reference Service class
 */
export class MulticaixaReferenceService {
  async generateReference(request: MulticaixaRefPaymentRequest): Promise<MulticaixaRefPaymentResponse> {
    return createMulticaixaRefPayment(request);
  }

  validateReference(reference: string): boolean {
    return validateReferenceFormat(reference);
  }

  isValid(validityDate: string): boolean {
    return isReferenceValid(validityDate);
  }

  getTimeRemaining(validityDate: string): string {
    return getTimeRemaining(validityDate);
  }

  formatAmount(amount: number): string {
    return formatAmount(amount);
  }
}

// Default service instance
export const multicaixaReferenceService = new MulticaixaReferenceService();