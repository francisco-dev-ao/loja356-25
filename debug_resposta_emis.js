// Debug Resposta EMIS - Verificar resposta completa da API
// Execute este script no console do navegador

console.log('🔧 Debug Resposta EMIS - Verificar resposta completa da API');

// Dados de teste
const testData = {
  reference: 'DEBUG-RESP-' + Date.now(),
  amount: 100,
  token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  mobile: 'PAYMENT',
  card: 'DISABLED',
  qrCode: 'PAYMENT',
  callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
};

console.log('📤 Dados enviados:', testData);

// Teste via proxy
fetch('/api/emis-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(result => {
  console.log('📥 Resposta completa:', result);
  
  try {
    const data = JSON.parse(result);
    console.log('📋 Resposta parseada:', data);
    
    // Verificar campos específicos
    console.log('\n🔍 Análise da resposta:');
    console.log('ID:', data.id);
    console.log('Token:', data.token);
    console.log('URL:', data.url);
    console.log('Frame URL:', data.frameUrl);
    console.log('Payment URL:', data.paymentUrl);
    console.log('Modal URL:', data.modalUrl);
    console.log('Success:', data.success);
    console.log('Error:', data.error);
    
    // Verificar todas as chaves
    console.log('\n🔑 Todas as chaves da resposta:');
    Object.keys(data).forEach(key => {
      console.log(`${key}:`, data[key]);
    });
    
    // Testar URLs possíveis
    if (data.id || data.token) {
      console.log('\n🧪 Testando URLs possíveis:');
      
      const urls = [
        `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${data.id || data.token}`,
        `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/payment/${data.id || data.token}`,
        `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/modal/${data.id || data.token}`,
        data.url,
        data.frameUrl,
        data.paymentUrl,
        data.modalUrl
      ].filter(Boolean);
      
      urls.forEach((url, index) => {
        console.log(`URL ${index + 1}:`, url);
        
        // Testar se a URL responde
        fetch(url, { method: 'HEAD' })
          .then(res => {
            console.log(`✅ URL ${index + 1} responde:`, res.status);
          })
          .catch(err => {
            console.log(`❌ URL ${index + 1} erro:`, err.message);
          });
      });
    }
    
  } catch (e) {
    console.log('❌ Erro ao parsear JSON:', e);
    console.log('📄 Resposta como texto:', result);
  }
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
});

console.log('📝 Debug resposta concluído. Verifique os logs acima.'); 