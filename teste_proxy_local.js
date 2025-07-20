// Teste Proxy Local - Testar o proxy do Vite
// Execute este script no console do navegador (apenas em desenvolvimento)

console.log('🔧 Teste Proxy Local - Testando o proxy do Vite');

// Dados de teste
const testData = {
  reference: 'LOCAL-TEST-' + Date.now(),
  amount: 556000,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste:', testData);

// Teste via proxy local do Vite
console.log('\n🧪 Teste via proxy local do Vite');
fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Proxy local funcionando - Token gerado');
    
    try {
      const data = JSON.parse(result);
      const token = data.id || data.token;
      console.log('🔑 Token gerado:', token);
      
      // Abrir modal
      console.log('\n🚀 Abrindo modal EMIS...');
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir em nova janela
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      console.log('🎉 PROBLEMA RESOLVIDO! Multicaixa Express funcionando via proxy local!');
      
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e);
    }
  } else if (result.includes('reference is required')) {
    console.log('❌ Ainda "reference is required" (problema de dados)');
  } else {
    console.log('❌ Outro erro:', result);
  }
})
.catch(error => {
  console.error('❌ Erro no proxy local:', error);
  console.log('🔧 Verifique se o servidor Vite está rodando em http://localhost:8080');
});

console.log('📝 Teste proxy local iniciado. Verifique os logs acima.'); 