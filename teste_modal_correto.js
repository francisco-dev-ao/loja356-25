// Teste Modal Correto - Verificar se o modal funciona com URL correta
// Execute este script no console do navegador

console.log('🔧 Teste Modal Correto - Verificar se o modal funciona com URL correta');

// Token de teste (use um token válido gerado pela API)
const testToken = '7fb94631-7bb4-4f99-a2e5-f2453477832a'; // Token do exemplo

console.log('🔑 Token de teste:', testToken);

// URLs para testar
const urls = [
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${testToken}`,
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${testToken}`,
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/payment?token=${testToken}`,
  `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/modal?token=${testToken}`
];

console.log('🔗 URLs para testar:', urls);

// Testar cada URL
urls.forEach((url, index) => {
  console.log(`\n🧪 Teste ${index + 1}: ${url}`);
  
  // Criar iframe temporário para testar
  const testIframe = document.createElement('iframe');
  testIframe.style.width = '300px';
  testIframe.style.height = '200px';
  testIframe.style.border = '1px solid #ccc';
  testIframe.style.position = 'fixed';
  testIframe.style.top = '10px';
  testIframe.style.left = `${10 + index * 320}px`;
  testIframe.style.zIndex = '9999';
  
  testIframe.onload = () => {
    console.log(`✅ URL ${index + 1} carregou com sucesso`);
    testIframe.style.border = '2px solid green';
  };
  
  testIframe.onerror = () => {
    console.log(`❌ URL ${index + 1} falhou ao carregar`);
    testIframe.style.border = '2px solid red';
  };
  
  testIframe.src = url;
  document.body.appendChild(testIframe);
  
  // Remover iframe após 10 segundos
  setTimeout(() => {
    if (testIframe.parentNode) {
      testIframe.parentNode.removeChild(testIframe);
    }
  }, 10000);
});

// Teste direto na API para gerar novo token
console.log('\n🧪 Gerando novo token via API...');
const testData = {
  reference: 'MODAL-TEST-' + Date.now(),
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

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
      const newToken = data.id || data.token;
      console.log('🔑 Novo token gerado:', newToken);
      
      // Testar modal com novo token
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${newToken}`;
      console.log('🔗 Modal URL com novo token:', modalUrl);
      
      // Abrir modal em nova janela
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      console.log('🎉 Modal aberto com novo token!');
    }
  } catch (e) {
    console.log('❌ Erro ao processar resposta:', e);
  }
})
.catch(error => {
  console.error('❌ Erro na API:', error);
});

console.log('📝 Teste modal concluído. Verifique os iframes temporários acima.'); 