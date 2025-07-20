// Debug Config EMIS - Verificar configuração
// Execute este script no console do navegador

console.log('🔧 Debug Config EMIS - Verificando configuração');

// Verificar se o serviço existe
if (typeof window.multicaixaExpressService !== 'undefined') {
  console.log('✅ Serviço Multicaixa Express encontrado');
  
  // Verificar configuração
  console.log('\n🔍 Verificando configuração...');
  window.multicaixaExpressService.loadConfig()
    .then(config => {
      console.log('📋 Configuração carregada:', config);
      
      if (config) {
        console.log('✅ Configuração encontrada');
        console.log('🔑 Frame Token:', config.frame_token);
        console.log('🔗 Callback URL:', config.callback_url);
        console.log('✅ Ativo:', config.is_active);
        
        // Teste com dados reais
        console.log('\n🧪 Teste com dados reais...');
        const testData = {
          reference: 'DEBUG-TEST-' + Date.now(),
          amount: 100, // 1 Kwanza em centavos
          token: config.frame_token,
          mobile: 'PAYMENT',
          card: 'DISABLED',
          qrCode: 'PAYMENT',
          callbackUrl: config.callback_url
        };
        
        console.log('📤 Dados de teste:', testData);
        
        // Teste direto na API
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
          
          if (result.includes('"id"') || result.includes('"token"')) {
            console.log('✅ SUCESSO! Token gerado');
          } else if (result.includes('indisponível') || result.includes('unavailable')) {
            console.log('❌ Serviço indisponível - Token pode estar inválido');
            console.log('🔧 Verifique se o token está correto na base de dados');
          } else {
            console.log('❌ Outro erro:', result);
          }
        })
        .catch(error => {
          console.error('❌ Erro no teste:', error);
        });
        
      } else {
        console.log('❌ Configuração não encontrada');
        console.log('🔧 Verifique se há dados na tabela multicaixa_express_config');
      }
    })
    .catch(error => {
      console.error('❌ Erro ao carregar configuração:', error);
    });
    
} else {
  console.log('❌ Serviço Multicaixa Express não encontrado');
}

console.log('📝 Debug concluído. Verifique os logs acima.'); 