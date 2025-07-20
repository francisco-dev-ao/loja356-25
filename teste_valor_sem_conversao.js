// Teste Valor Sem Conversão - Verificar se valor chega correto
// Execute este script no console do navegador

console.log('🔧 Teste Valor Sem Conversão - Verificar se valor chega correto');

// Valor do carrinho (912.000 kz como no exemplo)
const valorCarrinho = 912.000;

console.log('🛒 Valor do carrinho:', valorCarrinho, 'kz');

// Teste da API sem conversão
console.log('\n🧪 Teste da API sem conversão:');
const testData = {
  reference: 'VALOR-DIRETO-' + Date.now(),
  amount: valorCarrinho, // Valor direto, sem conversão
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados para API:', testData);
console.log('💰 Valor enviado:', testData.amount, 'kz');

fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  try {
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado com valor correto!');
      console.log('🔑 Token:', data.id || data.token);
      
      // Verificar se o valor está correto na resposta
      if (data.amount) {
        console.log('💰 Valor na resposta:', data.amount);
        console.log('🔄 Valor esperado no modal:', data.amount, 'kz');
      }
      
      // Testar modal com o token
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir modal em nova janela para verificar
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
    } else {
      console.log('❌ Erro na API:', result);
    }
  } catch (e) {
    console.log('❌ Erro ao processar resposta:', e);
  }
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
});

// Teste comparativo com conversão
console.log('\n🧮 Teste comparativo:');
console.log('Valor original:', valorCarrinho, 'kz');
console.log('Com conversão (×100):', valorCarrinho * 100, 'centavos');
console.log('Sem conversão:', valorCarrinho, 'kz');

console.log('📝 Teste concluído. Verifique se o modal mostra o valor correto.'); 