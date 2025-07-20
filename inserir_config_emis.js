// Inserir Config EMIS - Inserir configuração de teste
// Execute este script no console do navegador

console.log('🔧 Inserir Config EMIS - Inserindo configuração de teste');

// Dados de configuração de teste
const configData = {
  frame_token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  callback_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback',
  success_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/success',
  error_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/error',
  css_url: 'https://angohost.co.ao/css/multicaixa-express.css',
  commission_rate: 2.5,
  is_active: true
};

console.log('📋 Dados de configuração:', configData);

// Inserir na base de dados via Supabase
const { createClient } = window.supabase;

if (createClient) {
  console.log('✅ Supabase client encontrado');
  
  const supabase = createClient(
    'https://royvktipnkfnpdhytakw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXZrdGlwbmtmbnBkaHl0YWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODcyMjcsImV4cCI6MjA2MzA2MzIyN30.HvkiehFF3jxCLlc5sJR3P3MCX5alavaIpUtnCdiRrv0'
  );

  // Primeiro, deletar configurações existentes
  console.log('\n🗑️ Deletando configurações existentes...');
  supabase
    .from('multicaixa_express_config')
    .delete()
    .neq('id', 0)
    .then(({ error }) => {
      if (error) {
        console.error('❌ Erro ao deletar:', error);
      } else {
        console.log('✅ Configurações antigas deletadas');
        
        // Inserir nova configuração
        console.log('\n➕ Inserindo nova configuração...');
        supabase
          .from('multicaixa_express_config')
          .insert(configData)
          .select()
          .then(({ data, error }) => {
            if (error) {
              console.error('❌ Erro ao inserir:', error);
            } else {
              console.log('✅ Configuração inserida:', data);
              console.log('🎉 Configuração pronta para uso!');
              
              // Testar imediatamente
              console.log('\n🧪 Testando configuração...');
              if (window.multicaixaExpressService) {
                window.multicaixaExpressService.loadConfig()
                  .then(config => {
                    console.log('✅ Configuração carregada:', config);
                  })
                  .catch(err => {
                    console.error('❌ Erro ao carregar:', err);
                  });
              }
            }
          });
      }
    });
    
} else {
  console.log('❌ Supabase client não encontrado');
  console.log('🔧 Execute este script na página da aplicação');
}

console.log('📝 Script concluído. Verifique os logs acima.'); 