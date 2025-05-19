
import React from 'react';

interface PaymentFrameProps {
  src: string;
  onLoad: () => void;
}

const PaymentFrame = ({ src, onLoad }: PaymentFrameProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <iframe
        src={src}
        onLoad={onLoad}
        className="w-full h-[500px] border-0"
        title="Pagamento Multicaixa Express"
      />
    </div>
  );
};

export default PaymentFrame;
