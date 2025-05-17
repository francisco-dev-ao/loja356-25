
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BankTransferPayment = () => {
  const bankAccounts = [
    { 
      bank: "BAI", 
      accountName: "LicençasPRO, Lda", 
      accountNumber: "AO06.0040.0000.5738.3059.1016.9", 
      swift: "BAIPAOLU"
    },
    { 
      bank: "BIC", 
      accountName: "LicençasPRO, Lda", 
      accountNumber: "AO06.0051.0000.7628.4271.1012.3", 
      swift: "BICKLUAU"
    }
  ];

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copiado para a área de transferência!'))
      .catch(() => toast.error('Erro ao copiar. Por favor, tente manualmente.'));
  };
  
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Transferência Bancária</CardTitle>
        <CardDescription>
          Transfira o valor total para uma das nossas contas bancárias
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <strong>Importante:</strong> Após efetuar a transferência, envie o comprovativo 
            para o email <strong>financeiro@licencaspro.ao</strong> ou para o WhatsApp 
            <strong> +244 923 456 789</strong> mencionando o número do seu pedido.
          </p>
        </div>
        
        <div className="space-y-4">
          {bankAccounts.map((account, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{account.bank}</h3>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Recomendado
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nome da Conta:</span>
                  <span className="font-medium">{account.accountName}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IBAN:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{account.accountNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyToClipboard(account.accountNumber)}
                    >
                      <CopyIcon size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SWIFT/BIC:</span>
                  <span className="font-medium">{account.swift}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium mb-2">Instruções</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Efetue a transferência do valor total para uma das contas acima</li>
            <li>Envie o comprovativo por email ou WhatsApp</li>
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
