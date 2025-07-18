import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createMulticaixaReference, MulticaixaRefResponse } from '@/services/payment/multicaixa-ref';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/formatters';
import { InvoicePDFGenerator } from '@/lib/invoice-pdf-generator';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const companyInfo = {
  name: "Office365, Lda",
  address: "Rua Comandante Gika, n.º 100, Luanda, Angola",
  nif: "5417124080",
  phone: "+244 923 456 789",
  email: "financeiro@office365.ao",
  website: "www.office365.ao"
};

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
  const { profile } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    const handleGenerateInvoice = async () => {
      if (!orderId || !profile) {
        toast.error('Dados insuficientes para gerar a fatura');
        return;
      }
      setIsGeneratingPdf(true);
      try {
        // Buscar detalhes do pedido
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (orderError) throw orderError;
        // Buscar itens do pedido
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        if (itemsError) throw itemsError;
        // Buscar nomes dos produtos
        const productIds = orderItems.map(item => item.product_id);
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
        if (productsError) throw productsError;
        // Associar nomes aos itens
        const itemsWithProductNames = orderItems.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            productName: product?.name || 'Produto não encontrado'
          };
        });
        const orderWithItems = {
          ...orderData,
          items: itemsWithProductNames
        };
        // Gerar PDF
        const pdfGenerator = new InvoicePDFGenerator();
        pdfGenerator.generateProfessionalInvoice({
          order: orderWithItems,
          profile,
          companyInfo,
          paymentReference: referenceData
        });
        pdfGenerator.save(`FATURA-${orderId.substring(0, 8)}.pdf`);
        toast.success('Fatura gerada com sucesso!');
      } catch (error) {
        toast.error('Erro ao gerar a fatura PDF');
      } finally {
        setIsGeneratingPdf(false);
      }
    };
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
                <p className="font-mono text-lg font-bold">{formatPrice(referenceData.amount)}</p>
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
              <li>Confirme o valor: <span className="font-mono font-bold">{formatPrice(referenceData.amount)}</span></li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription>
              Esta referência é válida por 3 dias. O pagamento será processado automaticamente após a confirmação.
            </AlertDescription>
          </Alert>

          {orderId && (
            <Button onClick={handleGenerateInvoice} className="w-full" disabled={isGeneratingPdf}>
              {isGeneratingPdf ? 'Gerando Fatura...' : 'Gerar Fatura PDF'}
            </Button>
          )}
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
              Valor: <span className="font-bold">{formatPrice(amount)}</span>
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