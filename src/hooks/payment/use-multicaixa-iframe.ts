
import { useState } from 'react';
import { toast } from 'sonner';
import { constructIframeUrl } from './utils/emis-token';

export const useMulticaixaIframe = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  
  /**
   * Show the payment iframe with the given token
   */
  const showPaymentIframe = (emisTokenId: string) => {
    try {
      const iframeUrl = constructIframeUrl(emisTokenId);
      console.log('Generated payment URL:', iframeUrl);
      
      // Show the iframe and set its source
      setPaymentUrl(iframeUrl);
      setShowIframe(true);
    } catch (error: any) {
      console.error('Error showing payment iframe:', error);
      toast.error('Erro ao mostrar página de pagamento');
    }
  };

  return {
    iframeLoaded,
    showIframe,
    paymentUrl,
    setIframeLoaded,
    setShowIframe,
    showPaymentIframe
  };
};
