// Teste Callback Automático - Verificar callback automático da EMIS
// Execute este script no console do navegador

console.log('🔧 Teste Callback Automático - Verificar callback automático da EMIS');

// Função para simular callback automático da EMIS
async function simularCallbackAutomatico(orderId, reference) {
  console.log('🧪 Simulando callback automático da EMIS...');
  
  // Simular que a EMIS atualizou o status automaticamente
  const callbackPayload = {
    transactionId: 'EMIS-AUTO-' + Date.now(),
    status: 'SUCCESS',
    reference: reference,
    order_id: orderId,
    amount: 912000,
    payment_method: 'multicaixa_express',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Payload do callback automático:', callbackPayload);

  try {
    // Simular atualização direta no banco (como a EMIS faria)
    const { data: paymentUpdate, error: updateError } = await supabase
      .from('multicaixa_express_payments')
      .update({ 
        status: 'completed',
        emis_response: callbackPayload,
        completed_at: new Date().toISOString()
      })
      .eq('reference', reference)
      .eq('status', 'pending')
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar pagamento:', updateError);
      return;
    }

    console.log('✅ Pagamento atualizado automaticamente:', paymentUpdate);

    // Atualizar status do pedido
    const { data: orderUpdate, error: orderError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        status: 'completed',
        payment_method: 'multicaixa_express',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('payment_status', 'pending_payment')
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erro ao atualizar pedido:', orderError);
    } else {
      console.log('✅ Pedido atualizado automaticamente:', orderUpdate);
    }

    // Salvar callback para auditoria
    const { data: callbackData, error: callbackError } = await supabase
      .from('multicaixa_express_callbacks')
      .insert({
        raw_data: JSON.stringify(callbackPayload),
        payment_reference: reference,
        amount: 912000,
        status: 'SUCCESS',
        ip_address: 'EMIS-AUTOMATIC',
        processed_successfully: true
      })
      .select()
      .single();

    if (callbackError) {
      console.error('❌ Erro ao salvar callback:', callbackError);
    } else {
      console.log('✅ Callback salvo para auditoria:', callbackData);
    }

  } catch (error) {
    console.error('❌ Erro ao simular callback automático:', error);
  }
}

// Função para verificar se o modal detecta o pagamento
async function verificarDetecaoModal(orderId) {
  console.log('🔍 Verificando se o modal detecta o pagamento...');
  
  try {
    const { data: payment, error } = await supabase
      .from('multicaixa_express_payments')
      .select('status, emis_response')
      .eq('order_id', orderId)
      .eq('status', 'completed')
      .single();

    if (error) {
      console.log('⏳ Pagamento ainda não foi detectado:', error.message);
      return false;
    }

    console.log('✅ Pagamento detectado pelo modal:', payment);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar detecção:', error);
    return false;
  }
}

// Função para testar fluxo completo com callback automático
async function testarFluxoCallbackAutomatico() {
  console.log('🚀 Testando fluxo completo com callback automático...');
  
  // Order ID de teste
  const orderId = 'ORDER-AUTO-' + Date.now();
  const reference = 'REF-AUTO-' + Date.now();
  
  console.log('📋 Order ID:', orderId);
  console.log('🔖 Reference:', reference);
  
  try {
    // 1. Criar pedido de teste
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: 'test-user',
        total: 912000,
        payment_status: 'pending_payment',
        status: 'pending',
        payment_method: 'multicaixa_express'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar pedido:', error);
      return;
    }

    console.log('✅ Pedido criado:', order);
    
    // 2. Criar pagamento de teste
    const { data: payment, error: paymentError } = await supabase
      .from('multicaixa_express_payments')
      .insert({
        order_id: orderId,
        reference: reference,
        amount: 912000,
        status: 'pending',
        payment_method: 'multicaixa_express'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Erro ao criar pagamento:', paymentError);
      return;
    }

    console.log('✅ Pagamento criado:', payment);
    
    // 3. Simular callback automático da EMIS
    setTimeout(async () => {
      await simularCallbackAutomatico(orderId, reference);
      
      // 4. Verificar se o modal detecta
      setTimeout(async () => {
        const detectado = await verificarDetecaoModal(orderId);
        
        if (detectado) {
          console.log('🎯 Modal deve detectar e redirecionar para sucesso!');
          console.log('🔗 URL esperada:', `/checkout/success?orderId=${orderId}`);
          
          // Simular redirecionamento
          window.open(`/checkout/success?orderId=${orderId}`, '_blank');
        }
      }, 2000);
      
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro no fluxo:', error);
  }
}

// Função para verificar configuração sem callback URL
async function verificarConfiguracao() {
  console.log('🔍 Verificando configuração sem callback URL...');
  
  try {
    const { data: config, error } = await supabase
      .from('multicaixa_express_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar configuração:', error);
      return;
    }

    console.log('📊 Configuração atual:', config);
    console.log('✅ Callback URL não é necessária - EMIS faz automaticamente');
    
  } catch (error) {
    console.error('❌ Erro ao verificar configuração:', error);
  }
}

// Função para testar geração de token sem callback URL
async function testarGeracaoToken() {
  console.log('🧪 Testando geração de token sem callback URL...');
  
  const testData = {
    reference: 'TOKEN-TEST-' + Date.now(),
    amount: 912000,
    token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
    mobile: 'PAYMENT',
    card: 'DISABLED',
    qrCode: 'PAYMENT'
    // Sem callbackUrl - EMIS faz automaticamente
  };

  console.log('📤 Dados para geração de token:', testData);

  try {
    const response = await fetch('/api/emis-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.text();
    console.log('📥 Resposta da API:', result);
    
    const data = JSON.parse(result);
    if (data.id || data.token) {
      console.log('✅ Token gerado sem callback URL:', data.id || data.token);
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir modal para teste
      window.open(modalUrl, '_blank', 'width=800,height=600');
      
    } else {
      console.log('❌ Erro na API:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
  }
}

// Executar testes
console.log('🚀 Executando testes de callback automático...');
console.log('1. Verificar configuração');
console.log('2. Testar geração de token sem callback URL');
console.log('3. Testar fluxo completo com callback automático');

// Aguardar 2 segundos antes de executar
setTimeout(async () => {
  await verificarConfiguracao();
  
  setTimeout(async () => {
    await testarGeracaoToken();
    
    setTimeout(async () => {
      await testarFluxoCallbackAutomatico();
    }, 3000);
  }, 2000);
}, 2000);

console.log('📝 Testes iniciados. Verifique o console para resultados.'); 