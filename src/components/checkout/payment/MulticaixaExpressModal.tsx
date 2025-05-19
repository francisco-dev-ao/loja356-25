
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MulticaixaExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

const MulticaixaExpressModal = ({ isOpen, onClose, token }: MulticaixaExpressModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameUrl = token ? 
    `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${token}` : 
    '';
  
  // Timer for auto-close if no interaction
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Handle frame loading
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      
      // Set up auto-close timer after 2 minutes of inactivity
      autoCloseTimerRef.current = setTimeout(() => {
        console.log("Auto-closing Multicaixa Express modal due to inactivity");
        onClose();
      }, 120000); // 2 minutes
    }
    
    return () => {
      // Clear timer on cleanup
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [isOpen, onClose]);

  // Handle frame load success
  const handleFrameLoad = () => {
    setLoading(false);
    console.log("Multicaixa Express iframe loaded successfully");
    
    // Reset retry count on successful load
    setRetryCount(0);
    
    // Clear any existing timer and start a new one
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    
    // Auto-close after 5 minutes if payment not completed
    autoCloseTimerRef.current = setTimeout(() => {
      console.log("Auto-closing Multicaixa Express modal after timeout");
      onClose();
    }, 300000); // 5 minutes
  };

  // Handle frame load error
  const handleFrameError = () => {
    console.error("Error loading Multicaixa Express iframe");
    
    // If we've tried less than 3 times, retry loading the iframe
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setLoading(true);
      
      // Wait 2 seconds before retry
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = frameUrl;
        }
      }, 2000);
    } else {
      // After 3 retries, show error message
      setLoading(false);
      setError("Não foi possível carregar o sistema de pagamento. Por favor, tente novamente mais tarde.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] p-0">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Carregando pagamento...</p>
            <p className="text-sm text-muted-foreground">
              Por favor, aguarde enquanto conectamos ao sistema de pagamento.
            </p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
            <div className="text-center p-6 max-w-md">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Erro de Conexão</h3>
              <p className="mb-6 text-muted-foreground">{error}</p>
              <Button onClick={onClose} className="mx-auto">Voltar</Button>
            </div>
          </div>
        )}
        
        {token && !error && (
          <iframe 
            ref={iframeRef}
            src={frameUrl}
            className="w-full h-full border-none"
            onLoad={handleFrameLoad}
            onError={handleFrameError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MulticaixaExpressModal;
