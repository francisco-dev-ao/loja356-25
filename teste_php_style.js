// Teste PHP Style - Baseado no código PHP que funciona
// Execute este script no console do navegador

console.log('🔍 Teste PHP Style - Baseado no código PHP que funciona');

// Função para gerar referência no estilo PHP
function generateReferencePHP(orderId) {
  const cleanOrderId = (orderId || 'ORDER').replace(/[^a-zA-Z0-9]/g, '');
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const reference = `${cleanOrderId}-AH-${timestamp}${random}`;
  console.log('🔧 Referência PHP style:', reference);
  return reference;
}

// Dados exatamente como no PHP
const orderId = '12345'; // Simular checkout_id
const reference = generateReferencePHP(orderId);
const amount = 23250; // Valor total

const phpStyleData = {
  reference: reference,
  amount: amount,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  cssUrl: '', // Opcional
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados PHP style:', phpStyleData);

// Teste 1: Gerar token com dados PHP style
console.log('\n🧪 Teste 1: Gerar token com dados PHP style');
fetch('/emis-api/online-payment-gateway/portal/frameToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(phpStyleData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Token gerado com dados PHP style');
    
    try {
      const data = JSON.parse(result);
      const token = data.id || data.token;
      console.log('🔑 Token gerado:', token);
      
      // Teste 2: Abrir modal com token
      console.log('\n🧪 Teste 2: Abrir modal com token');
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir em nova janela
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      // Testar em iframe
      const testIframe = document.createElement('iframe');
      testIframe.src = modalUrl;
      testIframe.style.width = '500px';
      testIframe.style.height = '400px';
      testIframe.style.border = '3px solid #28a745';
      testIframe.style.position = 'fixed';
      testIframe.style.top = '20px';
      testIframe.style.left = '20px';
      testIframe.style.zIndex = '9999';
      testIframe.style.backgroundColor = '#fff';
      
      testIframe.onload = () => {
        console.log('✅ Modal PHP style carregou com sucesso');
        console.log('🎉 PROBLEMA RESOLVIDO!');
      };
      
      testIframe.onerror = () => {
        console.log('❌ Erro ao carregar modal PHP style');
      };
      
      document.body.appendChild(testIframe);
      
      // Remover após 15 segundos
      setTimeout(() => {
        if (document.body.contains(testIframe)) {
          document.body.removeChild(testIframe);
        }
      }, 15000);
      
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e);
    }
  } else {
    console.log('❌ ERRO na geração do token PHP style');
    console.log('📊 Resposta completa:', result);
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
});

console.log('📝 Teste PHP style iniciado. Verifique os logs acima.'); 