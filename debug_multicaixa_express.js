// Script completo para debug e ativação do Multicaixa Express
// Execute este script no console do navegador

const SUPABASE_URL = "https://royvktipnkfnpdhytakw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXZrdGlwbmtmbnBkaHl0YWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODcyMjcsImV4cCI6MjA2MzA2MzIyN30.HvkiehFF3jxCLlc5sJR3P3MCX5alavaIpUtnCdiRrv0";

// Função para fazer requisições ao Supabase
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  return response.json();
}

// Função para testar Edge Function
async function testEdgeFunction() {
  console.log('🧪 Testando Edge Function...');
  
  const testData = {
    reference: 'DEBUG-' + Date.now(),
    amount: 100,
    token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
    mobile: 'PAYMENT',
    card: 'DISABLED',
    qrCode: 'PAYMENT',
    callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-emis-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Status:', response.status);
    const result = await response.text();
    console.log('📥 Resposta:', result);

    if (response.ok) {
      const parsed = JSON.parse(result);
      if (parsed.success) {
        console.log('✅ Edge Function funcionando!');
        return parsed.data;
      } else {
        console.log('❌ Edge Function erro:', parsed.error);
        return null;
      }
    } else {
      console.log('❌ HTTP Error:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return null;
  }
}

// Função para verificar configuração
async function checkConfig() {
  console.log('🔍 Verificando configuração...');
  
  try {
    const result = await supabaseRequest('multicaixa_express_config?is_active=eq.true');
    
    if (result && result.length > 0) {
      console.log('✅ Configuração encontrada:', result[0]);
      return result[0];
    } else {
      console.log('❌ Configuração não encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar configuração:', error);
    return null;
  }
}

// Função para criar configuração
async function createConfig() {
  console.log('📋 Criando configuração...');
  
  const configData = {
    frame_token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
    callback_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback',
    success_url: 'https://angohost.co.ao/pay/successful',
    error_url: 'https://angohost.co.ao/pay/unsuccessful',
    css_url: null,
    commission_rate: 0,
    is_active: true
  };

  try {
    const result = await supabaseRequest('multicaixa_express_config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });

    if (result.error) {
      console.log('❌ Erro ao criar configuração:', result.error);
      return null;
    } else {
      console.log('✅ Configuração criada:', result);
      return result;
    }
  } catch (error) {
    console.error('❌ Erro ao criar configuração:', error);
    return null;
  }
}

// Função para testar pagamento completo
async function testCompletePayment() {
  console.log('🎯 Testando pagamento completo...');
  
  // 1. Verificar configuração
  let config = await checkConfig();
  if (!config) {
    console.log('📋 Criando configuração...');
    config = await createConfig();
    if (!config) {
      console.log('❌ Falha ao criar configuração');
      return;
    }
  }

  // 2. Testar Edge Function
  const tokenData = await testEdgeFunction();
  if (!tokenData) {
    console.log('❌ Falha na Edge Function');
    return;
  }

  // 3. Simular abertura do modal
  console.log('🚀 Simulando abertura do modal...');
  const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame/${tokenData.id || tokenData.token}`;
  console.log('🔗 URL do modal:', modalUrl);
  
  // 4. Abrir modal em nova janela (opcional)
  // window.open(modalUrl, '_blank');
  
  console.log('✅ Teste completo concluído!');
  return { config, tokenData, modalUrl };
}

// Função para verificar tabelas
async function checkTables() {
  console.log('🗄️ Verificando tabelas...');
  
  const tables = [
    'multicaixa_express_config',
    'multicaixa_express_payments', 
    'multicaixa_express_callbacks'
  ];

  for (const table of tables) {
    try {
      const result = await supabaseRequest(`${table}?limit=1`);
      console.log(`✅ Tabela ${table}: OK`);
    } catch (error) {
      console.log(`❌ Tabela ${table}: Erro -`, error.message);
    }
  }
}

// Função principal
async function debugMulticaixaExpress() {
  console.log('🚀 Iniciando debug completo do Multicaixa Express...');
  console.log('='.repeat(60));

  // 1. Verificar tabelas
  await checkTables();
  console.log('='.repeat(60));

  // 2. Verificar configuração
  await checkConfig();
  console.log('='.repeat(60));

  // 3. Testar Edge Function
  await testEdgeFunction();
  console.log('='.repeat(60));

  // 4. Teste completo
  await testCompletePayment();
  console.log('='.repeat(60));

  console.log('🎉 Debug completo concluído!');
}

// Executar debug
debugMulticaixaExpress();

// Exportar funções para uso manual
window.debugMulticaixaExpress = debugMulticaixaExpress;
window.testEdgeFunction = testEdgeFunction;
window.checkConfig = checkConfig;
window.createConfig = createConfig;
window.testCompletePayment = testCompletePayment;
window.checkTables = checkTables;

console.log('📝 Funções disponíveis:');
console.log('- debugMulticaixaExpress()');
console.log('- testEdgeFunction()');
console.log('- checkConfig()');
console.log('- createConfig()');
console.log('- testCompletePayment()');
console.log('- checkTables()'); 