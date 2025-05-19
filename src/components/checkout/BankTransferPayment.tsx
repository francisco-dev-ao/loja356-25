import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatters';

interface BankSettings {
  bank_name: string;
  bank_account_holder: string;
  bank_account_number: string;
  bank_iban: string;
  bank_logo_url: string | null;
}

interface BankTransferPaymentProps {
  total: number;
  orderId: string | null;
}

const BankTransferPayment = ({ total, orderId }: BankTransferPaymentProps) => {
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBankSettings = async () => {
      try {
        const { data: settings, error } = await supabase
          .from('settings')
          .select('bank_name, bank_account_holder, bank_account_number, bank_iban, bank_logo_url')
          .single();

        if (error) throw error;
        setBankSettings(settings);
      } catch (error) {
        console.error('Erro ao carregar configurações bancárias:', error);
        toast.error('Não foi possível carregar as informações bancárias');
      } finally {
        setLoading(false);
      }
    };

    fetchBankSettings();
  }, []);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copiado para a área de transferência!'))
      .catch(() => toast.error('Erro ao copiar. Por favor, tente manualmente.'));
  };
    if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bankSettings) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            As informações bancárias não estão configuradas.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center">
            {bankSettings.bank_logo_url ? (              <div className="w-8 h-8 rounded overflow-hidden mr-2">
                <img
                  src={bankSettings.bank_logo_url}
                  alt={`Logo do ${bankSettings.bank_name}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
            <span>Transferência Bancária</span>
          </div>
        </CardTitle>
        <CardDescription>
          Transfira o valor total para nossa conta bancária
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <strong>Importante:</strong> Após efetuar a transferência, envie o comprovativo 
              para o nosso WhatsApp <strong>+244 923 456 789</strong> mencionando o número do seu pedido.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-800">Valor a Transferir:</span>
                <span className="font-bold text-green-800">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-800">Nº do Pedido:</span>
                <span className="font-medium text-green-800">{orderId}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">{bankSettings.bank_name}</h3>
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Recomendado
              </div>
            </div>
              
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Titular da Conta:</span>
                <span className="font-medium">{bankSettings.bank_account_holder}</span>
              </div>
                
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Número da Conta:</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{bankSettings.bank_account_number}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopyToClipboard(bankSettings.bank_account_number)}
                  >
                    <CopyIcon size={14} />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IBAN:</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{bankSettings.bank_iban}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopyToClipboard(bankSettings.bank_iban)}
                  >
                    <CopyIcon size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium mb-2">Instruções</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Efetue a transferência do valor total para a conta acima</li>
            <li>Envie o comprovativo por WhatsApp</li>
            <li>Inclua o número do seu pedido na descrição da transferência</li>
            <li>Aguarde a confirmação do pagamento (normalmente em até 24h úteis)</li>
            <li>Após confirmação, suas licenças serão enviadas para seu email</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankTransferPayment;
