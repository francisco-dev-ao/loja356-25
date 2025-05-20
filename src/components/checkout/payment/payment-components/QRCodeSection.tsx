
import { useState, useEffect } from 'react';

interface QRCodeSectionProps {
  token?: string;
}

export const QRCodeSection = ({ token }: QRCodeSectionProps) => {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      // Em produção, você geraria o QR code usando uma API ou biblioteca
      // Aqui estamos usando um serviço gratuito para gerar um QR code para demonstração
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(token)}&size=200x200`;
      setQrImageUrl(qrCodeUrl);
    }
  }, [token]);

  return (
    <div className="border rounded-lg p-6 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">QR Code</h3>
      
      {qrImageUrl ? (
        <div className="bg-white w-48 h-48 flex items-center justify-center rounded-lg mb-4">
          <img src={qrImageUrl} alt="QR Code de Pagamento" className="w-40 h-40" />
        </div>
      ) : (
        <div className="bg-gray-200 w-48 h-48 flex items-center justify-center rounded-lg mb-4">
          <span className="text-sm text-muted-foreground">QR Code do Pagamento</span>
        </div>
      )}
      
      <p className="text-sm text-center text-muted-foreground">
        Abra o aplicativo Multicaixa Express e escaneie este QR Code para pagar.
      </p>
    </div>
  );
};
