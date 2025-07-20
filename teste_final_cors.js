// Teste Final CORS - Verificar se o problema foi resolvido
// Execute este script no console do navegador

console.log('🔧 Teste Final CORS - Verificando se o problema foi resolvido');

// Dados de teste
const testData = {
  reference: 'FINAL-TEST-' + Date.now(),
  amount: 556000,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste:', testData);

// Teste via proxy do Vite (deve funcionar agora)
console.log('\n🧪 Teste via proxy do Vite (/emis-api/...)');
fetch('/emis-api/online-payment-gateway/portal/frameToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
    console.log('✅ SUCESSO! CORS resolvido - Token gerado');
    
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
      
      console.log('🎉 PROBLEMA RESOLVIDO! Multicaixa Express funcionando!');
      
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
  console.error('❌ Erro CORS ainda presente:', error);
  console.log('🔧 O proxy do Vite pode não estar funcionando');
});

console.log('📝 Teste final iniciado. Verifique os logs acima.'); 