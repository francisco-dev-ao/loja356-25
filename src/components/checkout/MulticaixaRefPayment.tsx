import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createMulticaixaReference, MulticaixaRefResponse } from '@/services/payment/multicaixa-ref';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MulticaixaRefPaymentProps {
  amount: number;
  description: string;
  orderId?: string;
  onSuccess?: (reference: MulticaixaRefResponse) => void;
  onError?: (error: string) => void;
}

const MulticaixaRefPayment = ({ 
  amount, 
  description, 
  orderId, 
  onSuccess, 
  onError 
}: MulticaixaRefPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [referenceData, setReferenceData] = useState<MulticaixaRefResponse | null>(null);

  const handleGenerateReference = async () => {
    setIsLoading(true);
    
    try {
      const response = await createMulticaixaReference({
        amount,
        description,
        orderId
      });

      setReferenceData(response);
      
      // Store reference data locally for PDF generation
      if (orderId) {
        localStorage.setItem(`payment_ref_${orderId}`, JSON.stringify(response));
      }
      
      toast.success('Referência gerada com sucesso!');
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error: any) {
      console.error('Erro ao gerar referência:', error);
      toast.error('Erro ao gerar referência de pagamento');
      
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  if (referenceData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={24} />
            Referência Gerada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Sua referência de pagamento foi gerada com sucesso. Use os dados abaixo para efetuar o pagamento.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Entidade</p>
                <p className="font-mono text-lg font-bold">{referenceData.entity}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referenceData.entity)}
              >
                <Copy size={16} />
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Referência</p>
                <p className="font-mono text-lg font-bold">{referenceData.reference}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referenceData.reference)}
              >
                <Copy size={16} />
              </Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-mono text-lg font-bold">KZ {referenceData.amount.toLocaleString('pt-AO')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referenceData.amount.toString())}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Como pagar:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Vá a um ATM ou Multicaixa Express</li>
              <li>Selecione "Pagamentos" → "Outros Serviços"</li>
              <li>Digite a Entidade: <span className="font-mono font-bold">{referenceData.entity}</span></li>
              <li>Digite a Referência: <span className="font-mono font-bold">{referenceData.reference}</span></li>
              <li>Confirme o valor: <span className="font-mono font-bold">KZ {referenceData.amount.toLocaleString('pt-AO')}</span></li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription>
              Esta referência é válida por 3 dias. O pagamento será processado automaticamente após a confirmação.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-medium">Pagamento por Referência Multicaixa</h3>
            <p className="text-muted-foreground">
              Valor: <span className="font-bold">KZ {amount.toLocaleString('pt-AO')}</span>
            </p>
          </div>

          <Button
            onClick={handleGenerateReference}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando referência...
              </>
            ) : (
              'Gerar Referência de Pagamento'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MulticaixaRefPayment;