// Teste PHP Exact - Dados exatamente como o PHP original
// Execute este script no console do navegador

console.log('🔧 Teste PHP Exact - Dados exatamente como o PHP original');

// Dados exatamente como o PHP original
const testData = {
  reference: 'ORDER123456789',
  amount: 556000, // 5560 Kwanza em centavos
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste (PHP style):', testData);

// Teste 1: Direto na API da EMIS (sem proxy)
console.log('\n🧪 Teste 1: Direto na API da EMIS');
fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta direta:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! API direta funcionando');
  } else if (result.includes('indisponível') || result.includes('unavailable')) {
    console.log('❌ Serviço indisponível - Token inválido ou expirado');
  } else {
    console.log('❌ Outro erro:', result);
  }
})
.catch(error => {
  console.error('❌ Erro na API direta:', error);
});

// Teste 2: Via proxy do Vite
console.log('\n🧪 Teste 2: Via proxy do Vite');
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
  console.log('📥 Resposta proxy:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Proxy funcionando');
  } else if (result.includes('indisponível') || result.includes('unavailable')) {
    console.log('❌ Serviço indisponível - Token inválido ou expirado');
  } else {
    console.log('❌ Outro erro:', result);
  }
})
.catch(error => {
  console.error('❌ Erro no proxy:', error);
});

// Teste 3: Com referência diferente
console.log('\n🧪 Teste 3: Com referência diferente');
const testData2 = {
  ...testData,
  reference: 'TEST-' + Date.now()
};

fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData2)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta com nova referência:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Nova referência funcionando');
  } else {
    console.log('❌ Erro com nova referência:', result);
  }
})
.catch(error => {
  console.error('❌ Erro com nova referência:', error);
});

console.log('📝 Testes PHP exact concluídos. Verifique os logs acima.'); 