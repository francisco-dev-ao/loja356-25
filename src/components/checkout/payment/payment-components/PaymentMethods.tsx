
import { useState } from 'react';
import { QRCodeSection } from './QRCodeSection';
import { PhoneSection } from './PhoneSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface PaymentMethodsProps {
  token: string;
  countdown: number;
}

export const PaymentMethods = ({ token, countdown }: PaymentMethodsProps) => {
  const [method, setMethod] = useState<string>('mobile');
  
  // Constrói o URL para o iframe (versão simulada)
  const emisIframeUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/payment.do?id=${token}`;
  
  const handleMethodChange = (value: string) => {
    setMethod(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Pagamento Multicaixa Express</h2>
        <div className="text-sm font-medium text-destructive">
          Tempo restante: {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}
        </div>
      </div>

      <Tabs defaultValue="mobile" value={method} onValueChange={handleMethodChange}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="mobile">App Multicaixa</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mobile" className="pt-4">
          <PhoneSection token={token} />
        </TabsContent>
        
        <TabsContent value="qrcode" className="pt-4">
          <QRCodeSection />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 pt-6 border-t flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground text-center mb-2">
          Ao prosseguir, você concorda com os termos e condições do Multicaixa Express.
        </p>
        
        <Button 
          onClick={() => window.open("https://multicaixa.ao/terms", "_blank")}
          variant="outline" 
          className="w-full"
        >
          Ver termos e condições
        </Button>
      </div>
    </div>
  );
};
