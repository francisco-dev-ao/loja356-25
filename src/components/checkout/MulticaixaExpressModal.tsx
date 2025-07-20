import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MulticaixaExpressModalProps {
  url: string;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

const MulticaixaExpressModal = ({ url, onClose, onPaymentSuccess }: MulticaixaExpressModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    autoCloseTimerRef.current = setTimeout(() => {
      onClose();
    }, 120000);
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [onClose]);

  const handleFrameLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    setRetryCount(0);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      onClose();
    }, 300000);
  };

  useEffect(() => {
    if (loading) {
      const fallbackTimer = setTimeout(() => {
        setLoading(false);
      }, 5000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [loading]);

  const handleFrameError = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setLoading(true);
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      }, 2000);
    } else {
      setLoading(false);
      setError("Não foi possível carregar o sistema de pagamento. Por favor, tente novamente mais tarde.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] p-0">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Carregando pagamento...</p>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, aguarde enquanto conectamos ao sistema de pagamento.
            </p>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="mt-2"
            >
              Cancelar
            </Button>
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
        {url && !error && (
          <iframe 
            ref={iframeRef}
            src={url}
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