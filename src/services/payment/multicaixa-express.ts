// Nova integração Multicaixa Express - API de Produção Angohost

export interface MulticaixaExpressToken {
  id: string;
  timeToLive: number;
  url: string;
}

export interface MulticaixaExpressTokenResponse {
  success: boolean;
  message: string;
  token: MulticaixaExpressToken | null;
  error?: string;
}

export interface MulticaixaExpressStatus {
  status: 'ACCEPTED' | 'REJECTED';
  amount: number;
  reference: { id: string };
  transactionNumber: string;
  errorMessage?: string;
}

export class MulticaixaExpressService {
  // Gera token de pagamento usando a nova API
  async generateToken(amount: number): Promise<MulticaixaExpressTokenResponse> {
    try {
      const response = await fetch('https://gpo-express.angohost.ao/api/pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          return {
            success: true,
            message: data.message,
            token: data.token,
          };
        } else {
          return {
            success: false,
            message: data.message || 'Erro ao gerar token',
            token: null,
            error: data.message,
          };
        }
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: 'Erro HTTP ao gerar token',
          token: null,
          error: errorText,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao gerar token',
        token: null,
        error: error.message,
      };
    }
  }

  // Conecta ao WebSocket para monitorar pagamentos
  connectWebSocket(onPaymentProcessed: (status: MulticaixaExpressStatus) => void) {
    // @ts-ignore
    const socket = window.io ? window.io('https://gpo-express.angohost.ao') : null;
    if (!socket) {
      console.warn('Socket.io não está disponível no window. Importe socket.io-client no index.html.');
      return null;
    }
    socket.on('paymentProcessed', (data: MulticaixaExpressStatus) => {
      onPaymentProcessed(data);
    });
    return socket;
  }
}

export const multicaixaExpressService = new MulticaixaExpressService();

export async function gerarPagamento(amount: number) {
  return multicaixaExpressService.generateToken(amount);
}
