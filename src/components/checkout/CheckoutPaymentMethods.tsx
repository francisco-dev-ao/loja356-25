import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Send } from 'lucide-react';

interface CheckoutPaymentMethodsProps {
  paymentMethod: string;
  handleSelectPaymentMethod: (method: string) => void;
}

const CheckoutPaymentMethods = ({ paymentMethod, handleSelectPaymentMethod }: CheckoutPaymentMethodsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card 
        className={`border cursor-pointer transition-all duration-200 ease-in-out
          ${
            paymentMethod === 'multicaixa' 
              ? 'border-microsoft-blue bg-microsoft-light/20 shadow-md' 
              : 'hover:border-microsoft-blue/50 hover:bg-microsoft-light/10 hover:shadow-md'
          }`}
        onClick={() => handleSelectPaymentMethod('multicaixa')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-microsoft-light rounded-full flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
                <CreditCard size={20} className="text-microsoft-blue" />
              </div>
              <div>
                <h4 className="font-medium">Multicaixa Express</h4>
                <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`border cursor-pointer transition-all duration-200 ease-in-out
          ${
            paymentMethod === 'multicaixa_ref' 
              ? 'border-microsoft-blue bg-microsoft-light/20 shadow-md' 
              : 'hover:border-microsoft-blue/50 hover:bg-microsoft-light/10 hover:shadow-md'
          }`}
        onClick={() => handleSelectPaymentMethod('multicaixa_ref')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-microsoft-light rounded-full flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
                <CreditCard size={20} className="text-microsoft-blue" />
              </div>
              <div>
                <h4 className="font-medium">Multicaixa Referência</h4>
                <p className="text-sm text-muted-foreground">Pagamento por referência</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`border cursor-pointer transition-all duration-200 ease-in-out
          ${
            paymentMethod === 'bank_transfer' 
              ? 'border-microsoft-blue bg-microsoft-light/20 shadow-md' 
              : 'hover:border-microsoft-blue/50 hover:bg-microsoft-light/10 hover:shadow-md'
          }`}
        onClick={() => handleSelectPaymentMethod('bank_transfer')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-microsoft-light rounded-full flex items-center justify-center mr-3 transition-transform group-hover:scale-105">
                <Send size={20} className="text-microsoft-blue" />
              </div>
              <div>
                <h4 className="font-medium">Transferência Bancária</h4>
                <p className="text-sm text-muted-foreground">Processamento em até 24h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPaymentMethods;
