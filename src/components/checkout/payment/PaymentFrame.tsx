
import React, { useEffect, useRef } from 'react';

interface PaymentFrameProps {
  src: string;
  onLoad: () => void;
}

const PaymentFrame = ({ src, onLoad }: PaymentFrameProps) => {
  console.log("Renderizando PaymentFrame com URL:", src);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Add extra logging to debug iframe loading
    console.log("PaymentFrame mounted with source:", src);
    
    // Check if iframe is already loaded (some browsers might load it very quickly)
    if (iframeRef.current?.complete) {
      console.log("Iframe was already loaded when component mounted");
      onLoad();
    }
    
    return () => {
      console.log("PaymentFrame unmounted");
    };
  }, [src, onLoad]);
  
  const handleLoad = () => {
    console.log("Iframe loaded successfully");
    onLoad();
  };
  
  const handleError = () => {
    console.error("Error loading iframe from source:", src);
    // We still call onLoad so the parent component can handle the UI appropriately
    onLoad();
  };
  
  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={src}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full border-0"
        title="Pagamento Multicaixa Express"
        allow="payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default PaymentFrame;
