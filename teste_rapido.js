// Teste Rápido - Identificar problema específico
// Execute este script no console do navegador

console.log('🚀 Teste Rápido - Identificando problema');

// Teste com dados exatamente como a documentação da EMIS
const testData = {
  reference: 'TEST001',
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados:', testData);

// Teste 1: Via proxy do Vite
console.log('\n🧪 Teste 1: Via proxy do Vite');
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
    console.log('✅ SUCESSO! Token gerado');
    
    // Tentar abrir modal
    try {
      const data = JSON.parse(result);
      const token = data.id || data.token;
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
      
      console.log('🔗 URL do modal:', modalUrl);
      console.log('🚀 Abrindo modal...');
      
      window.open(modalUrl, '_blank', 'width=800,height=600');
    } catch (e) {
      console.log('⚠️ Não foi possível abrir modal');
    }
  } else {
    console.log('❌ ERRO na geração do token');
    
    // Se ainda for "reference is required", testar sem proxy
    if (result.includes('reference is required')) {
      console.log('\n🧪 Teste 2: Direto na API (pode falhar por CORS)');
      
      fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })
      .then(response => {
        console.log('📡 Status direto:', response.status);
        return response.text();
      })
      .then(result2 => {
        console.log('📥 Resposta direta:', result2);
        
        if (result2.includes('"id"') || result2.includes('"token"')) {
          console.log('✅ SUCESSO! API direta funcionando (problema é proxy)');
        } else {
          console.log('❌ API direta também com problema');
        }
      })
      .catch(error => {
        console.log('❌ Erro direto (esperado por CORS):', error);
      });
    }
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
});

console.log('📝 Teste iniciado. Verifique os logs acima.'); 