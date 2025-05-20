
interface PaymentErrorProps {
  message: string;
}

export const PaymentError = ({ message }: PaymentErrorProps) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
      <div className="text-center p-6 max-w-md">
        <p className="mb-6 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
