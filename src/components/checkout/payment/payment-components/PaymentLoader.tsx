
import { Loader2 } from "lucide-react";

export const PaymentLoader = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium">Carregando pagamento...</p>
      <p className="text-sm text-muted-foreground">
        Por favor, aguarde enquanto conectamos ao sistema de pagamento.
      </p>
    </div>
  );
};
