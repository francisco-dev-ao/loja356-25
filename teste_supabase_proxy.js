// Teste Supabase Proxy - Testar o novo endpoint
// Execute este script no console do navegador

console.log('🔧 Teste Supabase Proxy - Testando o novo endpoint');

// Dados de teste
const testData = {
  reference: 'SUPABASE-TEST-' + Date.now(),
  amount: 556000,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados de teste:', testData);

// Teste via Supabase Edge Function
console.log('\n🧪 Teste via Supabase Edge Function');
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
  console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(result => {
  console.log('📥 Resposta:', result);
  
  if (result.includes('"id"') || result.includes('"token"')) {
    console.log('✅ SUCESSO! Supabase proxy funcionando - Token gerado');
    
    try {
      const data = JSON.parse(result);
      const token = data.id || data.token;
      console.log('🔑 Token gerado:', token);
      
      // Abrir modal
      console.log('\n🚀 Abrindo modal EMIS...');
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir em nova janela
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
      console.log('🎉 PROBLEMA RESOLVIDO! Multicaixa Express funcionando via Supabase!');
      
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e);
    }
  } else if (result.includes('reference is required')) {
    console.log('❌ Ainda "reference is required" (problema de dados)');
  } else {
    console.log('❌ Outro erro:', result);
  }
})
.catch(error => {
  console.error('❌ Erro no Supabase proxy:', error);
  console.log('🔧 Verifique se o Edge Function está deployado');
});

console.log('📝 Teste Supabase proxy iniciado. Verifique os logs acima.'); 