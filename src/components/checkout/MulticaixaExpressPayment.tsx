
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [showEmisFrame, setShowEmisFrame] = useState(false);
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const emisIframeRef = useRef<HTMLIFrameElement>(null);

  // Production URLs for EMIS integration
  const EMIS_PAYMENT_URL = "https://services.multicaixa.co.ao/payment";

  useEffect(() => {
    // Listen for messages from the EMIS iframe
    const handleEmisMessage = (event: MessageEvent) => {
      // Verify message origin for security
      if (event.origin !== new URL(EMIS_PAYMENT_URL).origin) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.status === 'success') {
          handlePaymentSuccess();
        } else if (data.status === 'failed') {
          handlePaymentFailure(data.message || 'Pagamento falhou');
        } else if (data.status === 'canceled') {
          setShowEmisFrame(false);
          toast.info('Pagamento cancelado pelo utilizador');
        }
      } catch (error) {
        console.error('Error processing EMIS message:', error);
      }
    };

    window.addEventListener('message', handleEmisMessage);
    return () => window.removeEventListener('message', handleEmisMessage);
  }, [orderId]);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length !== 9 || !phoneNumber.startsWith('9')) {
      toast.error("Por favor, insira um número de telefone válido (9 dígitos começando com 9)");
      return;
    }
    
    if (!orderId) {
      toast.error("Erro no pedido. Por favor, tente novamente.");
      return;
    }

    setIsProcessing(true);

    try {
      // Open EMIS iframe for real Multicaixa Express integration
      setShowEmisFrame(true);
      
      // In production mode, we'll show a dialog with the EMIS iframe
      // instead of simulating the payment
      setTimeout(() => {
        setIsProcessing(false);
        setShowConfirmation(true);
      }, 1000);
    } catch (error) {
      console.error("Pagamento falhou:", error);
      setIsProcessing(false);
      toast.error("O pagamento falhou. Por favor, tente novamente.");
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update order status in database
      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            payment_status: 'paid',
            status: 'processing'  
          })
          .eq('id', orderId);
          
        if (error) throw error;
      }
      
      setPaymentStatus("success");
      toast.success("Pagamento realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status do pagamento:", error);
      setPaymentStatus("failed");
    }
  };
  
  const handlePaymentFailure = (message: string) => {
    setPaymentStatus("failed");
    setShowEmisFrame(false);
    toast.error(message || "O pagamento falhou. Por favor, tente novamente.");
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    setShowEmisFrame(false);
    if (paymentStatus === "success") {
      clearCart();
      navigate(`/checkout/success?orderId=${orderId}`);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      setPhoneNumber(value.slice(0, 9));
    } else {
      setPhoneNumber(value);
    }
  };

  // Generate payment data for EMIS
  const getEmisPaymentUrl = () => {
    const paymentData = {
      merchantId: "ANGOHOST_STORE",
      amount: amount,
      currency: "AOA", 
      orderId: orderId,
      phoneNumber: phoneNumber,
      returnUrl: window.location.origin + `/checkout/success?orderId=${orderId}`,
      cancelUrl: window.location.origin + `/checkout`,
      // Include production credentials here
    };

    // In real implementation, you would append these as query parameters
    // or pass them in the postMessage API depending on EMIS requirements
    const queryParams = new URLSearchParams(paymentData as any).toString();
    return `${EMIS_PAYMENT_URL}?${queryParams}`;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pagamento com Multicaixa Express</CardTitle>
          <CardDescription>
            Pague facilmente com o seu telefone usando o Multicaixa Express.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <img 
                src="https://www.bai.ao/wp-content/uploads/2021/12/MCX-LOGO-768x492.jpg" 
                alt="Multicaixa Express" 
                className="h-16 object-contain mx-auto" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor a Pagar</Label>
            <div className="bg-gray-50 p-3 rounded border text-center">
              <span className="text-xl font-bold text-microsoft-blue">
                {amount.toLocaleString('pt-AO')} kz
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de Telefone</Label>
            <Input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={handlePhoneInput}
              placeholder="9XXXXXXXX"
              pattern="9[0-9]{8}"
              maxLength={9}
              required
              className="text-center text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Insira o número de telefone associado à sua conta Multicaixa Express.
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
            <p className="font-medium text-yellow-700">Instruções:</p>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 mt-1">
              <li>Insira seu número de telefone Multicaixa Express</li>
              <li>Clique no botão "Pagar Agora"</li>
              <li>Complete o pagamento no portal EMIS que irá aparecer</li>
              <li>Aguarde pela confirmação automática do pagamento</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handlePayment}
            className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 py-6"
            disabled={isProcessing || !orderId}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processando pagamento...
              </span>
            ) : (
              "Pagar Agora"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento Multicaixa Express</DialogTitle>
            <DialogDescription>
              {!showEmisFrame ? "Verifique seu telefone para confirmar o pagamento." : "Complete o pagamento no portal EMIS abaixo."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4">
            {showEmisFrame ? (
              <div className="w-full h-[400px] border rounded">
                <iframe
                  ref={emisIframeRef}
                  src={getEmisPaymentUrl()}
                  title="EMIS Payment Portal"
                  className="w-full h-full"
                  style={{ border: "none" }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                  onError={() => handlePaymentFailure("Erro ao carregar o portal de pagamento")}
                />
              </div>
            ) : paymentStatus === "pending" ? (
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-microsoft-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg font-medium">Aguardando confirmação</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Verifique seu telefone e confirme a transação no aplicativo Multicaixa Express
                </p>
              </div>
            ) : (
              <div className="text-center">
                {paymentStatus === "success" ? (
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <p className="text-lg font-medium text-green-700">
                  {paymentStatus === "success" ? "Pagamento confirmado!" : "Pagamento falhou!"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {paymentStatus === "success" 
                    ? "Seu pagamento foi processado com sucesso" 
                    : "Ocorreu um erro ao processar o pagamento"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {(paymentStatus === "success" || paymentStatus === "failed") && (
              <Button 
                onClick={handleConfirm} 
                className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90"
              >
                {paymentStatus === "success" ? "Continuar" : "Tentar Novamente"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MulticaixaExpressPayment;
