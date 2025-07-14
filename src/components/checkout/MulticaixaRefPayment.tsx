import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { createMulticaixaRefPayment, formatAmount } from '@/hooks/payment/utils/multicaixa-ref-api';

interface MulticaixaRefPaymentProps {
  amount: number;
  description: string;
  orderId?: string;
  onPaymentSuccess: (reference: string) => void;
  onPaymentError: (error: string) => void;
}

const MulticaixaRefPayment: React.FC<MulticaixaRefPaymentProps> = ({ 
  amount, 
  description,
  orderId = 'temp-' + Date.now(), // Generate temporary orderId if not provided
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleGenerateReference = async () => {
    setIsLoading(true);
    
    try {
      const result = await createMulticaixaRefPayment({
        orderId,
        amount,
        description
      });
      
      if (!result.success || !result.reference) {
        throw new Error(result.error || "Falha ao gerar referência");
      }
      
      setPaymentReference(result.reference);
      toast.success("Referência gerada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao gerar referência:", err);
      toast.error("Erro ao gerar referência: " + (err.message || "Falha na comunicação"));
      onPaymentError(err.message || "Falha ao gerar referência de pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReference = async () => {
    if (!paymentReference) return;
    
    try {
      await navigator.clipboard.writeText(paymentReference);
      setCopied(true);
      toast.success("Referência copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar referência");
    }
  };

  const handleConfirmPayment = () => {
    if (paymentReference) {
      onPaymentSuccess(paymentReference);
    }
  };

  return (
    <div className="space-y-4">
      {!paymentReference ? (
        <Button 
          onClick={handleGenerateReference} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <img 
              src="/src/assets/multicaixa-ref-icon.png" 
              alt="Multicaixa" 
              className="mr-2 h-4 w-4" 
              onError={(e) => {
                // Fallback icon if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          Gerar Referência Multicaixa
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              <CheckCircle className="mx-auto mb-2 h-8 w-8" />
              Referência Gerada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Valor: <strong>{formatAmount(amount)}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {description}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed">
                <p className="text-xs text-muted-foreground mb-1">Referência de Pagamento:</p>
                <p className="text-2xl font-mono font-bold text-center">
                  {paymentReference}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReference}
                  className="mt-2 w-full"
                >
                  {copied ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "Copiado!" : "Copiar Referência"}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Como pagar:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Acesse o seu aplicativo Multicaixa</li>
                <li>Selecione "Pagamentos por Referência"</li>
                <li>Digite a referência acima</li>
                <li>Confirme o pagamento</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleConfirmPayment}
              className="w-full"
            >
              Confirmei o Pagamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MulticaixaRefPayment;