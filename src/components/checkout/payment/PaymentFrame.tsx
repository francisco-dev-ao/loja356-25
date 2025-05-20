
import React from 'react';

interface PaymentFrameProps {
  src: string;
  onLoad: () => void;
}

const PaymentFrame = ({ src, onLoad }: PaymentFrameProps) => {
  console.log("Renderizando PaymentFrame com URL:", src);
  
  return (
    <div className="w-full h-full">
      <iframe
        src={src}
        onLoad={onLoad}
        className="w-full h-full border-0"
        title="Pagamento Multicaixa Express"
        allow="payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default PaymentFrame;
