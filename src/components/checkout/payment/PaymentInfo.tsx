
import React from 'react';
import { formatPrice } from '@/lib/formatters';

interface PaymentInfoProps {
  amount: number;
}

const PaymentInfo = ({ amount }: PaymentInfoProps) => {
  return (
    <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
      <h3 className="text-sm font-medium text-blue-800">Informação de Pagamento</h3>
      <p className="text-sm text-blue-600 mt-1">
        Total a pagar: <strong>{formatPrice(amount)}</strong>
      </p>
    </div>
  );
};

export default PaymentInfo;
