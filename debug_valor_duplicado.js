// Debug Valor Duplicado - Identificar onde está a duplicação
// Execute este script no console do navegador

console.log('🔧 Debug Valor Duplicado - Identificar onde está a duplicação');

// Valor do carrinho (912.000 kz como no exemplo)
const valorCarrinho = 912.000;

console.log('🛒 Valor original do carrinho:', valorCarrinho, 'kz');

// Teste 1: Direto na API da EMIS
console.log('\n🧪 Teste 1: Direto na API da EMIS');
const testData1 = {
  reference: 'DEBUG-DIRETO-' + Date.now(),
  amount: valorCarrinho,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados (direto):', testData1);

fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
    }
  } catch (e) {
    console.log('❌ Erro parse (direto):', e);
  }
})
.catch(error => {
  console.error('❌ Erro (direto):', error);
});

// Teste 2: Via proxy do Vite
console.log('\n🧪 Teste 2: Via proxy do Vite');
const testData2 = {
  reference: 'DEBUG-PROXY-' + Date.now(),
  amount: valorCarrinho,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados (proxy):', testData2);

fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData2)
})
.then(response => {
  console.log('📡 Status (proxy):', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta (proxy):', result);
  
  try {
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado (proxy):', data.id || data.token);
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 Modal URL (proxy):', modalUrl);
      
      // Abrir modal
      window.open(modalUrl, '_blank', 'width=800,height=600');
    }
  } catch (e) {
    console.log('❌ Erro parse (proxy):', e);
  }
})
.catch(error => {
  console.error('❌ Erro (proxy):', error);
});

// Teste 3: Com valor em centavos
console.log('\n🧪 Teste 3: Com valor em centavos');
const testData3 = {
  reference: 'DEBUG-CENTAVOS-' + Date.now(),
  amount: Math.round(valorCarrinho * 100), // Converter para centavos
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados (centavos):', testData3);

fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData3)
})
.then(response => {
  console.log('📡 Status (centavos):', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta (centavos):', result);
  
  try {
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado (centavos):', data.id || data.token);
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 Modal URL (centavos):', modalUrl);
      
      // Abrir modal
      window.open(modalUrl, '_blank', 'width=800,height=600');
    }
  } catch (e) {
    console.log('❌ Erro parse (centavos):', e);
  }
})
.catch(error => {
  console.error('❌ Erro (centavos):', error);
});

console.log('📝 Debug concluído. Compare os 3 modais para ver qual valor está correto.'); 