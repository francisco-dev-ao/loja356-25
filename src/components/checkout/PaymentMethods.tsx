import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodsProps {
  paymentMethod: string;
  onSelectPaymentMethod: (method: string) => void;
}

const PaymentMethods = ({ paymentMethod, onSelectPaymentMethod }: PaymentMethodsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {/* Multicaixa Referência */}
      <Card 
        className={`border cursor-pointer transition-all duration-200 ease-in-out
          ${
            paymentMethod === 'multicaixa_ref' 
              ? 'border-primary bg-primary/10 shadow-md' 
              : 'hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
          }`}
        onClick={() => onSelectPaymentMethod('multicaixa_ref')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <img src="/images/REFNew.png" alt="Multicaixa" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h4 className="font-medium text-lg">Pagamentos por Referência</h4>
              <p className="text-sm text-muted-foreground">Pague em um ATM ou Multicaixa Express ou qualquer internet banking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multicaixa Express */}
      <Card 
        className={`border cursor-pointer transition-all duration-200 ease-in-out
          ${
            paymentMethod === 'multicaixa_express' 
              ? 'border-primary bg-primary/10 shadow-md' 
              : 'hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
          }`}
        onClick={() => onSelectPaymentMethod('multicaixa_express')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <img src="/images/appypay_gpo.png" alt="Multicaixa Express" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h4 className="font-medium text-lg">Multicaixa Express</h4>
              <p className="text-sm text-muted-foreground">Pague com cartão, mobile ou QR Code de forma segura</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default PaymentMethods;