// Teste Valores Corretos - Verificar conversão de valores
// Execute este script no console do navegador

console.log('🔧 Teste Valores Corretos - Verificar conversão de valores');

// Valores de teste (em kwanzas)
const valoresTeste = [
  149.90,  // Microsoft 365 Básico
  249.90,  // Microsoft 365 Business
  399.90,  // Microsoft 365 Enterprise
  1299.90, // Exchange Standard
  4999.90, // Exchange Enterprise
  899.90,  // Windows 10 Pro
  1099.90, // Windows 11 Pro
  1499.90  // Windows 2025
];

console.log('💰 Valores em Kwanzas:', valoresTeste);

// Converter para centavos
const valoresCentavos = valoresTeste.map(valor => Math.round(valor * 100));

console.log('🪙 Valores em Centavos:', valoresCentavos);

// Verificar se a conversão está correta
valoresTeste.forEach((kwanzas, index) => {
  const centavos = valoresCentavos[index];
  const conversaoInversa = centavos / 100;
  
  console.log(`\n🧮 Teste ${index + 1}:`);
  console.log(`   Kwanzas: ${kwanzas.toFixed(2)} kz`);
  console.log(`   Centavos: ${centavos} centavos`);
  console.log(`   Conversão inversa: ${conversaoInversa.toFixed(2)} kz`);
  console.log(`   ✅ Correto: ${Math.abs(kwanzas - conversaoInversa) < 0.01 ? 'SIM' : 'NÃO'}`);
});

// Teste com valor do carrinho
console.log('\n🛒 Teste com valor do carrinho:');

// Simular valor do carrinho
const valorCarrinho = 149.90 + 249.90; // 2 produtos
console.log(`Valor do carrinho: ${valorCarrinho.toFixed(2)} kz`);

const valorCentavos = Math.round(valorCarrinho * 100);
console.log(`Valor em centavos: ${valorCentavos} centavos`);

// Teste da API
console.log('\n🧪 Teste da API:');
const testData = {
  reference: 'VALOR-TEST-' + Date.now(),
  amount: valorCentavos,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados para API:', testData);

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
  console.log('📥 Resposta:', result);
  
  try {
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado com valor correto!');
      console.log('🔑 Token:', data.id || data.token);
      
      // Verificar se o valor está correto na resposta
      if (data.amount) {
        console.log('💰 Valor na resposta:', data.amount, 'centavos');
        console.log('🔄 Valor em kwanzas:', (data.amount / 100).toFixed(2), 'kz');
      }
    } else {
      console.log('❌ Erro na API:', result);
    }
  } catch (e) {
    console.log('❌ Erro ao processar resposta:', e);
  }
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
});

console.log('📝 Teste de valores concluído. Verifique os logs acima.'); 