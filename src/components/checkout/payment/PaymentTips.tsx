
import React from 'react';

const PaymentTips = () => {
  return (
    <div className="bg-white p-6 rounded-lg text-center text-gray-700 border">
      <h3 className="font-bold text-lg mb-4">Dicas para ter um pagamento de sucesso!</h3>
      <ol className="text-left space-y-2">
        <li>1. Após clicar em pagar escolha a opção Multicaixa Express e clique em confirmar.</li>
        <li>2. Certifique-se que tenha o aplicativo Multicaixa Express instalado.</li>
        <li>3. Insira o seu contacto associado ao Multicaixa Express.</li>
        <li>4. Verifique o valor a ser cobrado no Multicaixa Express e confirme a compra.</li>
      </ol>
    </div>
  );
};

export default PaymentTips;
