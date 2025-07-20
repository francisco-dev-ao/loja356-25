import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, X } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

const API_URL = 'https://gpo-express.angohost.ao';

interface MulticaixaExpressPaymentProps {
  amount: number;
  description: string;
}

interface TokenResponse {
  success: boolean;
  message: string;
  token?: {
    id: string;
    timeToLive: number;
    url: string;
  };
  error?: string;
}

export default function MulticaixaExpressPayment({ amount, description }: MulticaixaExpressPaymentProps) {
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState<'aguardando' | 'aprovado' | 'rejeitado'>('aguardando');
  const socketRef = useRef<any>(null);

  // Função para adicionar log
  const addLog = (msg: string) => setLogs(logs => [...logs, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // WebSocket para monitorar pagamentos
  useEffect(() => {
    // @ts-ignore
    if (window.io) {
      socketRef.current = window.io(API_URL);
      socketRef.current.on('connect', () => addLog('Conectado ao WebSocket'));
      socketRef.current.on('disconnect', () => addLog('Desconectado do WebSocket'));
      socketRef.current.on('paymentProcessed', (data: any) => {
        if (data.status === 'ACCEPTED') {
          addLog(`✅ Pagamento aprovado! Valor: ${data.amount} ${data.currency} | Ref: ${data.reference?.id}`);
          setStatus('aprovado');
          setTimeout(() => {
            setModalUrl(null);
            window.location.href = '/checkout/success';
          }, 2000);
        } else {
          addLog(`❌ Pagamento rejeitado: ${data.errorMessage || 'Motivo desconhecido'}`);
          setStatus('rejeitado');
        }
      });
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handlePagar = async () => {
    setLoading(true);
    setError(null);
    setStatus('aguardando');
    addLog(`Iniciando pagamento de ${amount} AOA...`);
    try {
      const response = await fetch(`${API_URL}/api/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data: TokenResponse = await response.json();
      if (data.success && data.token?.url) {
        addLog('Token gerado com sucesso! URL: ' + data.token.url);
        setModalUrl(data.token.url);
      } else {
        setError(data.message || 'Erro ao gerar pagamento');
        addLog('Erro: ' + (data.message || 'Erro ao gerar pagamento'));
      }
    } catch (e: any) {
      setError(e.message || 'Erro inesperado');
      addLog('Erro: ' + (e.message || 'Erro inesperado'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/images/appypay_gpo.png" alt="Multicaixa Express" className="w-6 h-6 object-contain" />
          Multicaixa Express
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Pague de forma segura usando o Multicaixa Express. Aceitamos cartões, pagamentos móveis e QR Code.
          </AlertDescription>
        </Alert>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Valor a pagar:</span>
            <span className="font-bold text-lg">{formatPrice(amount)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Descrição:</span>
            <span className="font-medium">{description}</span>
          </div>
        </div>
        {error && (
          <div className="text-red-600 text-sm font-medium">{error}</div>
        )}
        <Button 
          onClick={handlePagar} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Pagamento...
            </>
          ) : (
            <>
              <CreditCard className="mr-2" size={16} />
              Pagar com Multicaixa Express
            </>
          )}
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          <p>• Pagamento seguro e criptografado</p>
          <p>• Suporte a todos os bancos angolanos</p>
          <p>• Confirmação instantânea</p>
        </div>
        {/* Modal customizado */}
        {modalUrl && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full relative p-0">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setModalUrl(null)}
                title="Fechar"
              >
                <X size={24} />
              </button>
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-lg">Pagamento Multicaixa Express</span>
                {status === 'aprovado' && <span className="text-green-600 font-bold">Aprovado!</span>}
                {status === 'rejeitado' && <span className="text-red-600 font-bold">Rejeitado</span>}
              </div>
              <iframe
                src={modalUrl}
                className="w-full h-[400px] border-none"
                title="Pagamento Multicaixa Express"
              />
              <div className="p-4 flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  Após o pagamento, aguarde a confirmação automática.<br />
                  O status será atualizado em tempo real.
                </span>
                <Button variant="outline" onClick={() => setModalUrl(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 bg-gray-100 rounded p-2 text-xs max-h-40 overflow-y-auto">
          <b>Log:</b>
          <ul>
            {logs.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 