
interface PaymentErrorProps {
  message: string;
}

export const PaymentError = ({ message }: PaymentErrorProps) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
      <div className="text-center p-6 max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Erro no Pagamento</h3>
        <p className="mb-6 text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          Por favor, tente novamente ou escolha outro método de pagamento.
        </p>
      </div>
    </div>
  );
};
