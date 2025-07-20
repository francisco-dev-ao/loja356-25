// Teste Simples Proxy - Verificar se funciona
// Execute este script no console do navegador

console.log('🔧 Teste Simples Proxy - Verificando se funciona');

// Dados de teste simples
const testData = {
  reference: 'TEST-' + Date.now(),
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste:', testData);

// Teste 1: Verificar se o endpoint responde
console.log('\n🧪 Teste 1: Verificar se o endpoint responde');
fetch('https://royvktipnkfnpdhytakw.supabase.co/functions/v1/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXZrdGlwbmtmbnBkaHl0YWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODcyMjcsImV4cCI6MjA2MzA2MzIyN30.HvkiehFF3jxCLlc5sJR3P3MCX5alavaIpUtnCdiRrv0'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  if (response.status === 404) {
    console.log('❌ Edge Function não encontrada - precisa fazer deploy');
    console.log('🔧 Execute: npx supabase functions deploy emis-proxy');
  } else if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Proxy funcionando');
  } else {
    console.log('❌ Outro erro:', result);
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
  console.log('🔧 Verifique se o Edge Function está deployado');
});

console.log('📝 Teste iniciado. Verifique os logs acima.'); 