
interface PhoneSectionProps {
  token: string;
  countdown: number;
}

export const PhoneSection = ({ token, countdown }: PhoneSectionProps) => {
  return (
    <div className="border rounded-lg p-6 flex flex-col">
      <h3 className="text-lg font-medium mb-4">Pagamento por Telefone</h3>
      <div className="space-y-4 flex-1">
        <CountdownItem label="Referência" value={token.substring(0, 9)} />
        <CountdownItem label="Valor" value="AOA 105.000,00" />
        <CountdownItem 
          label="Tempo restante" 
          value={`${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`} 
        />
        <div className="mt-auto">
          <p className="text-sm text-muted-foreground">
            Insira o código de referência no aplicativo Multicaixa Express para completar o pagamento.
          </p>
        </div>
      </div>
    </div>
  );
};

interface CountdownItemProps {
  label: string;
  value: string;
}

const CountdownItem = ({ label, value }: CountdownItemProps) => (
  <div>
    <p className="text-sm font-medium">{label}</p>
    <p className="font-mono text-lg">{value}</p>
  </div>
);
