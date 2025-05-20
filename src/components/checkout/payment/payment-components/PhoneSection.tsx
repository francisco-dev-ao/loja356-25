
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';

interface PhoneSectionProps {
  token: string;
}

export const PhoneSection = ({ token }: PhoneSectionProps) => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) return;
    
    setIsSubmitting(true);
    
    // Simulação do envio - em produção, isto chamaria uma API
    setTimeout(() => {
      console.log(`Enviando token ${token} para o número ${phone}`);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset após 5 segundos
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 2000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center mb-4">
        <CreditCard className="h-16 w-16 text-primary mb-2" />
        <h3 className="text-lg font-medium">Pagamento pelo App Multicaixa Express</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
          Insira seu número de telemóvel para receber a notificação de pagamento no app Multicaixa Express.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de Telemóvel</Label>
          <div className="flex space-x-2">
            <div className="flex-none w-16">
              <Input value="+244" disabled className="bg-muted" />
            </div>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Número de telemóvel"
              className="flex-grow"
              maxLength={9}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Exemplo: 923456789
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || submitSuccess || phone.length < 9}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : submitSuccess ? (
            "Notificação enviada!"
          ) : (
            "Enviar notificação"
          )}
        </Button>
      </form>
      
      {submitSuccess && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-sm">
          Uma notificação foi enviada para seu telemóvel. Abra o app Multicaixa Express para concluir o pagamento.
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          Não está recebendo a notificação? Verifique se o app Multicaixa Express está instalado e se o número está correto.
        </p>
      </div>
    </div>
  );
};
