// Teste Token Diferente - Testar com token alternativo
// Execute este script no console do navegador

console.log('🔧 Teste Token Diferente - Testar com token alternativo');

// Lista de tokens para testar
const tokens = [
  'a53787fd-b49e-4469-a6ab-fa6acf19db48', // Token atual
  'test-token-12345', // Token de teste
  'demo-token-67890', // Token demo
  'production-token-abc123', // Token produção
];

// Dados base
const baseData = {
  reference: 'TOKEN-TEST-' + Date.now(),
  amount: 100,
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📋 Testando tokens:', tokens);

// Testar cada token
tokens.forEach((token, index) => {
  console.log(`\n🧪 Teste ${index + 1}: Token "${token}"`);
  
  const testData = {
    ...baseData,
    reference: baseData.reference + '-' + (index + 1),
    token: token
  };
  
  console.log('📤 Dados:', testData);
  
  fetch('/api/emis-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
  })
  .then(response => {
    console.log(`📡 Status ${index + 1}:`, response.status);
    return response.text();
  })
  .then(result => {
    console.log(`📥 Resposta ${index + 1}:`, result);
    
    if (result.includes('"id"') || result.includes('"token"')) {
      console.log(`✅ SUCESSO ${index + 1}: Token válido`);
      
      try {
        const data = JSON.parse(result);
        const generatedToken = data.id || data.token;
        console.log(`🔑 Token gerado ${index + 1}:`, generatedToken);
        
        // Testar URL do modal
        const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${generatedToken}`;
        console.log(`🔗 Modal URL ${index + 1}:`, modalUrl);
        
        // Abrir modal
        window.open(modalUrl, '_blank', 'width=800,height=600');
        
      } catch (e) {
        console.log(`❌ Erro parse ${index + 1}:`, e);
      }
    } else if (result.includes('indisponível') || result.includes('unavailable')) {
      console.log(`❌ INDISPONÍVEL ${index + 1}: Token inválido`);
    } else {
      console.log(`❌ OUTRO ERRO ${index + 1}:`, result);
    }
  })
  .catch(error => {
    console.error(`❌ ERRO ${index + 1}:`, error);
  });
});

console.log('📝 Teste de tokens concluído. Verifique os logs acima.'); 