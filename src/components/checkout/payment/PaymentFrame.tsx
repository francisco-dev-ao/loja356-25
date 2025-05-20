
import React, { useEffect } from 'react';

interface PaymentFrameProps {
  src: string;
  onLoad: () => void;
}

const PaymentFrame = ({ src, onLoad }: PaymentFrameProps) => {
  console.log("Renderizando PaymentFrame com URL:", src);
  
  useEffect(() => {
    // Add extra logging to debug iframe loading
    console.log("PaymentFrame mounted with source:", src);
    
    return () => {
      console.log("PaymentFrame unmounted");
    };
  }, [src]);
  
  return (
    <div className="w-full h-full">
      <iframe
        src={src}
        onLoad={() => {
          console.log("Iframe loaded successfully");
          onLoad();
        }}
        className="w-full h-full border-0"
        title="Pagamento Multicaixa Express"
        allow="payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default PaymentFrame;
