
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface PaymentButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

const PaymentButton = ({ onClick, isProcessing }: PaymentButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 py-6"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <span className="flex items-center">
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          Iniciando pagamento...
        </span>
      ) : (
        <span className="flex items-center">
          Pagar com Multicaixa Express
          <Send size={16} className="ml-2" />
        </span>
      )}
    </Button>
  );
};

export default PaymentButton;
