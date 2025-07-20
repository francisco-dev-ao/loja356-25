// Teste CORS Fix - Verificar se o problema foi resolvido
// Execute este script no console do navegador

console.log('🔧 Teste CORS Fix - Verificando se o problema foi resolvido');

// Dados de teste
const testData = {
  reference: 'CORS-TEST-' + Date.now(),
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste:', testData);

// Teste via proxy do Vite (deve funcionar)
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
    
    // Tentar abrir modal
    try {
      const data = JSON.parse(result);
      const token = data.id || data.token;
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
      
      console.log('🔗 URL do modal:', modalUrl);
      console.log('🚀 Abrindo modal...');
      
      window.open(modalUrl, '_blank', 'width=800,height=600');
    } catch (e) {
      console.log('⚠️ Não foi possível abrir modal automaticamente');
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

console.log('📝 Teste iniciado. Verifique os logs acima.'); 