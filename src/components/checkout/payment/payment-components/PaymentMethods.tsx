
import { QRCodeSection } from './QRCodeSection';
import { PhoneSection } from './PhoneSection';

interface PaymentMethodsProps {
  token: string;
  countdown: number;
}

export const PaymentMethods = ({ token, countdown }: PaymentMethodsProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Multicaixa Express</h2>
        <p className="text-muted-foreground">Complete o pagamento usando um dos métodos abaixo.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <QRCodeSection />
        <PhoneSection token={token} countdown={countdown} />
      </div>
    </div>
  );
};
