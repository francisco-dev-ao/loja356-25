// Verificar Token EMIS - Testar se o token ainda é válido
// Execute este script no console do navegador

console.log('🔍 Verificar Token EMIS - Testando se o token ainda é válido');

// Token gerado anteriormente
const token = '93c33de2-e7f9-4a14-a689-a94f55337867';

// Teste 1: Verificar se o token ainda é válido
console.log('🧪 Teste 1: Verificar validade do token');
const testData = {
  reference: 'VERIFY-' + Date.now(),
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

fetch('/emis-api/online-payment-gateway/portal/frameToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ Token ainda válido - gerando novo token');
    
    try {
      const data = JSON.parse(result);
      const newToken = data.id || data.token;
      console.log('🔑 Novo token:', newToken);
      
      // Teste 2: Abrir modal com novo token
      console.log('\n🧪 Teste 2: Abrir modal com novo token');
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${newToken}`;
      console.log('🔗 Nova URL do modal:', modalUrl);
      
      // Abrir em nova janela
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      // Testar em iframe
      const testIframe = document.createElement('iframe');
      testIframe.src = modalUrl;
      testIframe.style.width = '400px';
      testIframe.style.height = '300px';
      testIframe.style.border = '2px solid #007bff';
      testIframe.style.position = 'fixed';
      testIframe.style.top = '50px';
      testIframe.style.right = '50px';
      testIframe.style.zIndex = '9999';
      
      testIframe.onload = () => {
        console.log('✅ Modal carregou com novo token');
      };
      
      testIframe.onerror = () => {
        console.log('❌ Erro ao carregar modal com novo token');
      };
      
      document.body.appendChild(testIframe);
      
      // Remover após 10 segundos
      setTimeout(() => {
        if (document.body.contains(testIframe)) {
          document.body.removeChild(testIframe);
        }
      }, 10000);
      
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e);
    }
  } else {
    console.log('❌ Token inválido ou erro na API');
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
});

console.log('📝 Teste iniciado. Verifique os logs acima.'); 