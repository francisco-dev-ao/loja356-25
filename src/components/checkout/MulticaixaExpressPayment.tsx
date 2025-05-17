
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MulticaixaExpressPaymentProps {
  amount: number;
  orderId: string;
}

const MulticaixaExpressPayment = ({ amount, orderId }: MulticaixaExpressPaymentProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Configure Multicaixa Express settings
  const multicaixaConfig = {
    frametoken: "a53787fd-b49e-4469-a6ab-fa6acf19db48",
    callback: `${window.location.origin}/api/multicaixa/callback`,
    success: `${window.location.origin}/checkout/success`,
    error: `${window.location.origin}/checkout/error`
  };

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length !== 9 || !phoneNumber.startsWith('9')) {
      toast.error("Por favor, insira um número de telefone válido (9 dígitos começando com 9)");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    try {
      // In a real implementation, you would make an API call to your payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success and redirect to success page
      toast.success("Pagamento processado com sucesso!");
      navigate(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("O pagamento falhou. Por favor, tente novamente.");
    } finally {
      setIsProcessing(false);
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

  return (
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
              src="/placeholder.svg" 
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
          disabled={isProcessing}
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
  );
};

export default MulticaixaExpressPayment;
