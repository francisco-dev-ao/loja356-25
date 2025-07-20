// Teste de Produção - Multicaixa Express
// Execute este script no console do navegador

console.log('🚀 Teste de Produção - Multicaixa Express');

// Dados de produção
const PRODUCTION_DATA = {
  reference: 'PROD-TEST-' + Date.now(),
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste:', PRODUCTION_DATA);

// Teste da API
fetch('/emis-api/online-payment-gateway/portal/frameToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(PRODUCTION_DATA)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Token gerado com sucesso');
    
    // Tentar abrir modal
    try {
      const data = JSON.parse(result);
      const token = data.id || data.token;
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
      
      console.log('🔗 URL do modal:', modalUrl);
      console.log('🚀 Abrindo modal...');
      
      // Abrir em nova janela
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
    } catch (e) {
      console.log('⚠️ Não foi possível abrir modal automaticamente');
    }
  } else {
    console.log('❌ ERRO na geração do token');
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
});

console.log('📝 Teste iniciado. Verifique os logs acima.'); 