// Teste Final Valor Correto - Verificar se o valor está correto
// Execute este script no console do navegador

console.log('🔧 Teste Final Valor Correto - Verificar se o valor está correto');

// Simular o valor do carrinho (912.000 kz)
const valorCarrinho = 912000; // Valor numérico do carrinho

console.log('🛒 Valor do carrinho (numérico):', valorCarrinho);

// Teste 1: Valor direto (sem conversão)
console.log('\n🧪 Teste 1: Valor direto (sem conversão)');
const testData1 = {
  reference: 'FINAL-DIRETO-' + Date.now(),
  amount: valorCarrinho, // Valor direto
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados (direto):', testData1);

fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData1)
})
.then(response => {
  console.log('📡 Status (direto):', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta (direto):', result);
  
  try {
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado (direto):', data.id || data.token);
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 Modal URL (direto):', modalUrl);
      
      // Abrir modal
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      console.log('🎯 Valor esperado no modal: 912.000,00 Kz');
      
    } else {
      console.log('❌ Erro na API (direto):', result);
    }
  } catch (e) {
    console.log('❌ Erro parse (direto):', e);
  }
})
.catch(error => {
  console.error('❌ Erro (direto):', error);
});

// Teste 2: Valor formatado como string
console.log('\n🧪 Teste 2: Valor formatado como string');
const valorFormatado = '912.000 Kz';
const testData2 = {
  reference: 'FINAL-FORMATADO-' + Date.now(),
  amount: valorFormatado, // Valor formatado
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados (formatado):', testData2);

fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData2)
})
.then(response => {
  console.log('📡 Status (formatado):', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta (formatado):', result);
  
  try {
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado (formatado):', data.id || data.token);
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 Modal URL (formatado):', modalUrl);
      
      // Abrir modal
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      console.log('🎯 Valor esperado no modal: 912.000,00 Kz');
      
    } else {
      console.log('❌ Erro na API (formatado):', result);
    }
  } catch (e) {
    console.log('❌ Erro parse (formatado):', e);
  }
})
.catch(error => {
  console.error('❌ Erro (formatado):', error);
});

// Resumo dos testes
console.log('\n📊 Resumo dos testes:');
console.log('Valor do carrinho:', valorCarrinho, 'kz');
console.log('Valor formatado:', valorFormatado);
console.log('Valor esperado no modal: 912.000,00 Kz');
console.log('Valor errado (×100): 91.200.000,00 Kz');

console.log('📝 Teste final concluído. Compare os modais para ver qual mostra o valor correto.'); 