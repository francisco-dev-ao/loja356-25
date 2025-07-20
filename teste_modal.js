// Teste Modal EMIS - Verificar se o modal está funcionando
// Execute este script no console do navegador

console.log('🔍 Teste Modal EMIS - Verificando se o modal está funcionando');

// Token gerado anteriormente
const token = '93c33de2-e7f9-4a14-a689-a94f55337867';

// URLs possíveis para o modal
const modalUrls = [
  // URL atual
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`,
  
  // URLs alternativas
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken/${token}`,
  `https://pagamentonline.emis.co.ao/online-payment-gateway/frame/${token}`,
  `https://pagamentonline.emis.co.ao/portal/frame/${token}`,
  `https://pagamentonline.emis.co.ao/frame/${token}`,
  
  // URLs com parâmetros
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${token}`,
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}?mobile=PAYMENT&card=DISABLED&qrCode=PAYMENT`
];

console.log('🔑 Token:', token);
console.log('📋 URLs para testar:', modalUrls.length);

// Testar cada URL
modalUrls.forEach((url, index) => {
  console.log(`\n🧪 Teste ${index + 1}: ${url}`);
  
  // Criar iframe temporário para testar
  const testIframe = document.createElement('iframe');
  testIframe.src = url;
  testIframe.style.width = '300px';
  testIframe.style.height = '200px';
  testIframe.style.border = '1px solid #ccc';
  testIframe.style.position = 'fixed';
  testIframe.style.top = '10px';
  testIframe.style.left = '10px';
  testIframe.style.zIndex = '9999';
  
  // Adicionar ao DOM
  document.body.appendChild(testIframe);
  
  // Verificar se carrega
  testIframe.onload = () => {
    console.log(`✅ URL ${index + 1} carregou com sucesso`);
    console.log('🔗 URL funcionando:', url);
    
    // Remover iframe de teste
    setTimeout(() => {
      document.body.removeChild(testIframe);
    }, 3000);
  };
  
  testIframe.onerror = () => {
    console.log(`❌ URL ${index + 1} falhou`);
    document.body.removeChild(testIframe);
  };
  
  // Timeout para remover se não carregar
  setTimeout(() => {
    if (document.body.contains(testIframe)) {
      console.log(`⏰ URL ${index + 1} timeout`);
      document.body.removeChild(testIframe);
    }
  }, 5000);
});

// Teste direto - abrir em nova janela
console.log('\n🚀 Teste direto - Abrindo modal em nova janela...');
const directUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
window.open(directUrl, '_blank', 'width=800,height=600');

console.log('📝 Testes iniciados. Verifique as janelas e logs acima.');
console.log('💡 Se alguma URL funcionar, use ela no código.'); 