// Script para ativar Multicaixa Express - Execute no console do navegador
// Copie e cole este código no console do navegador (F12)

console.log('🚀 Ativando Multicaixa Express...');

// Configuração do Supabase
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

// Função principal para ativar
async function ativarMulticaixa() {
  try {
    console.log('📋 Criando configuração...');
    
    // 1. Criar configuração do Multicaixa Express
    const configData = {
      frame_token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
      callback_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback',
      success_url: 'https://angohost.co.ao/pay/successful',
      error_url: 'https://angohost.co.ao/pay/unsuccessful',
      css_url: null,
      commission_rate: 0,
      is_active: true
    };

    const configResult = await supabaseRequest('multicaixa_express_config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });

    if (configResult.error) {
      console.error('❌ Erro ao criar configuração:', configResult.error);
      return false;
    }

    console.log('✅ Configuração criada:', configResult);

    // 2. Criar método de pagamento
    console.log('💳 Criando método de pagamento...');
    const paymentData = {
      name: 'Multicaixa Express',
      description: 'Pagamento via Multicaixa Express Online',
      is_active: true
    };

    const paymentResult = await supabaseRequest('payment_methods', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });

    if (paymentResult.error) {
      console.log('⚠️ Método de pagamento já existe ou erro:', paymentResult.error);
    } else {
      console.log('✅ Método de pagamento criado:', paymentResult);
    }

    // 3. Verificar status final
    console.log('🔍 Verificando status final...');
    const statusCheck = await supabaseRequest('multicaixa_express_config?is_active=eq.true');

    if (statusCheck && statusCheck.length > 0) {
      console.log('🎉 Multicaixa Express ATIVADO com sucesso!');
      console.log('📊 Configuração final:', statusCheck[0]);
      return true;
    } else {
      console.log('❌ Falha na ativação');
      return false;
    }

  } catch (error) {
    console.error('❌ Erro durante ativação:', error);
    return false;
  }
}

// Função para verificar status
async function verificarStatus() {
  try {
    console.log('🔍 Verificando status...');
    const result = await supabaseRequest('multicaixa_express_config?is_active=eq.true');
    
    if (result && result.length > 0) {
      console.log('✅ Multicaixa Express está ATIVO');
      console.log('📊 Configuração:', result[0]);
      return true;
    } else {
      console.log('❌ Multicaixa Express está INATIVO');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao verificar status:', error);
    return false;
  }
}

// Função para testar conexão
async function testarConexao() {
  try {
    console.log('🧪 Testando conexão com EMIS...');
    
    const testData = {
      reference: 'TEST-' + Date.now(),
      amount: 100,
      token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
      mobile: 'PAYMENT',
      card: 'DISABLED',
      qrCode: 'PAYMENT',
      callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    };

    const response = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Conexão com EMIS bem-sucedida!');
      console.log('📊 Resposta:', data);
      return true;
    } else {
      console.log('❌ Erro na conexão com EMIS:', response.status);
      console.log('📊 Erro:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
}

// Executar ativação automaticamente
console.log('='.repeat(50));
console.log('🚀 INICIANDO ATIVAÇÃO DO MULTICAIXA EXPRESS');
console.log('='.repeat(50));

// Verificar status atual primeiro
verificarStatus().then(isActive => {
  if (!isActive) {
    // Ativar se não estiver ativo
    ativarMulticaixa().then(success => {
      if (success) {
        console.log('='.repeat(50));
        console.log('🎉 ATIVAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(50));
        
        // Testar conexão após ativação
        setTimeout(() => {
          testarConexao();
        }, 1000);
      }
    });
  } else {
    console.log('✅ Multicaixa Express já está ativo!');
    testarConexao();
  }
});

// Exportar funções para uso manual
window.ativarMulticaixa = ativarMulticaixa;
window.verificarStatus = verificarStatus;
window.testarConexao = testarConexao;

console.log('📝 Funções disponíveis:');
console.log('- ativarMulticaixa()');
console.log('- verificarStatus()');
console.log('- testarConexao()'); 