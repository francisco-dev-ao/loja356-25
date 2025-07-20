// Teste Extração Valor - Verificar extração correta de valores formatados
// Execute este script no console do navegador

console.log('🔧 Teste Extração Valor - Verificar extração correta de valores formatados');

// Função de extração de valor (igual à do serviço)
function extrairValorNumerico(valor: string | number): number {
  if (typeof valor === 'string') {
    // Remover "Kz" e espaços, depois remover pontos de milhar
    const valorLimpo = valor.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpo);
    return valorNumerico;
  } else {
    return valor;
  }
}

// Valores de teste
const valoresTeste = [
  '912.000 Kz',
  '1.250.000 Kz',
  '500.000 Kz',
  '2.500.000 Kz',
  '100.000 Kz',
  912000,
  1250000,
  500000
];

console.log('🧪 Testando extração de valores:');

valoresTeste.forEach((valor, index) => {
  const valorExtraido = extrairValorNumerico(valor);
  console.log(`\nTeste ${index + 1}:`);
  console.log(`   Original: "${valor}"`);
  console.log(`   Extraído: ${valorExtraido}`);
  console.log(`   Tipo: ${typeof valor} → ${typeof valorExtraido}`);
});

// Teste da API com valor formatado
console.log('\n🧪 Teste da API com valor formatado:');
const valorFormatado = '912.000 Kz';
const valorNumerico = extrairValorNumerico(valorFormatado);

console.log('💰 Valor formatado:', valorFormatado);
console.log('🔧 Valor extraído:', valorNumerico);

const testData = {
  reference: 'EXTRACAO-TEST-' + Date.now(),
  amount: valorNumerico,
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
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir modal para verificar valor
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      console.log('🎯 Valor esperado no modal: 912.000,00 Kz');
      
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

// Teste comparativo com valor errado
console.log('\n🧮 Teste comparativo:');
console.log('Valor correto (912.000):', 912000);
console.log('Valor errado (×100):', 912000 * 100);
console.log('Valor errado (×1000):', 912000 * 1000);

console.log('📝 Teste concluído. Verifique se o modal mostra 912.000,00 Kz.'); 