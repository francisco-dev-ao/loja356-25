
import React, { useState } from "react";
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
  const navigate = useNavigate();
  const { clearCart } = useCart();

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
      // Simulação de pagamento com Multicaixa Express
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mostrar diálogo de confirmação
      setIsProcessing(false);
      setShowConfirmation(true);
      
      // Simular processamento de pagamento em background
      setTimeout(async () => {
        try {
          // Atualizar status do pedido para "paid"
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
        } catch (error) {
          console.error("Erro ao atualizar status do pagamento:", error);
          setPaymentStatus("failed");
        }
      }, 3000);
      
    } catch (error) {
      console.error("Pagamento falhou:", error);
      setIsProcessing(false);
      toast.error("O pagamento falhou. Por favor, tente novamente.");
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    clearCart();
    navigate(`/checkout/success?orderId=${orderId}`);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      setPhoneNumber(value.slice(0, 9));
    } else {
      setPhoneNumber(value);
    }
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
              <li>Você receberá uma notificação no seu telefone</li>
              <li>Confirme o pagamento no aplicativo Multicaixa Express</li>
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
              Verifique seu telefone para confirmar o pagamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4">
            {paymentStatus === "pending" ? (
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-microsoft-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg font-medium">Aguardando confirmação</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Verifique seu telefone e confirme a transação no aplicativo Multicaixa Express
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-green-700">Pagamento confirmado!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Seu pagamento foi processado com sucesso
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {paymentStatus === "success" && (
              <Button onClick={handleConfirm} className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90">
                Continuar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MulticaixaExpressPayment;
