
export const QRCodeSection = () => {
  return (
    <div className="border rounded-lg p-6 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">QR Code</h3>
      <div className="bg-gray-200 w-48 h-48 flex items-center justify-center rounded-lg mb-4">
        <span className="text-sm text-muted-foreground">QR Code do Pagamento</span>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Abra o aplicativo Multicaixa Express e escaneie este QR Code para pagar.
      </p>
    </div>
  );
};
