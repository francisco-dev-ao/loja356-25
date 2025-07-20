// Teste Callback Sucesso - Verificar redirecionamento para página de sucesso
// Execute este script no console do navegador

console.log('🔧 Teste Callback Sucesso - Verificar redirecionamento para página de sucesso');

// Função para simular callback de sucesso
async function simularCallbackSucesso(orderId, reference) {
  console.log('🧪 Simulando callback de sucesso...');
  
  const callbackPayload = {
    transactionId: 'EMIS-' + Date.now(),
    status: 'SUCCESS',
    reference: reference,
    order_id: orderId,
    amount: 912000,
    payment_method: 'multicaixa_express',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Payload do callback:', callbackPayload);

  try {
    // Chamar a função de callback do Supabase
    const response = await fetch('/api/payment-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callbackPayload)
    });

    const result = await response.text();
    console.log('📥 Resposta do callback:', result);
    
    const data = JSON.parse(result);
    if (data.received) {
      console.log('✅ Callback processado com sucesso!');
      
      // Verificar se o pedido foi atualizado
      setTimeout(async () => {
        await verificarStatusPedido(orderId);
      }, 2000);
      
    } else {
      console.log('❌ Erro no callback:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro ao simular callback:', error);
  }
}

// Função para verificar status do pedido
async function verificarStatusPedido(orderId) {
  console.log('🔍 Verificando status do pedido...');
  
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar pedido:', error);
      return;
    }

    console.log('📊 Status do pedido:', order);
    
    if (order.payment_status === 'paid') {
      console.log('✅ Pedido pago! Redirecionando para página de sucesso...');
      
      // Simular redirecionamento
      const successUrl = `/checkout/success?orderId=${orderId}`;
      console.log('🔗 URL de sucesso:', successUrl);
      
      // Abrir em nova aba para teste
      window.open(successUrl, '_blank');
      
    } else {
      console.log('⏳ Pedido ainda não foi pago. Status:', order.payment_status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar pedido:', error);
  }
}

// Função para verificar pagamentos Multicaixa Express
async function verificarPagamentosMulticaixa(orderId) {
  console.log('🔍 Verificando pagamentos Multicaixa Express...');
  
  try {
    const { data: payments, error } = await supabase
      .from('multicaixa_express_payments')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('❌ Erro ao buscar pagamentos:', error);
      return;
    }

    console.log('📊 Pagamentos encontrados:', payments);
    
    if (payments.length > 0) {
      const payment = payments[0];
      console.log('💰 Último pagamento:', payment);
      
      if (payment.status === 'completed') {
        console.log('✅ Pagamento concluído!');
      } else if (payment.status === 'pending') {
        console.log('⏳ Pagamento pendente. Simulando callback...');
        
        // Simular callback de sucesso
        await simularCallbackSucesso(orderId, payment.reference);
      } else {
        console.log('❌ Pagamento falhou. Status:', payment.status);
      }
    } else {
      console.log('📭 Nenhum pagamento encontrado para este pedido.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar pagamentos:', error);
  }
}

// Função para testar fluxo completo
async function testarFluxoCompleto() {
  console.log('🚀 Testando fluxo completo de pagamento...');
  
  // Order ID de teste (substitua por um ID real)
  const orderId = 'ORDER-' + Date.now();
  const reference = 'REF-' + Date.now();
  
  console.log('📋 Order ID:', orderId);
  console.log('🔖 Reference:', reference);
  
  // 1. Criar pedido de teste
  try {
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
    
    // 3. Simular callback de sucesso
    setTimeout(async () => {
      await simularCallbackSucesso(orderId, reference);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro no fluxo:', error);
  }
}

// Função para verificar callbacks salvos
async function verificarCallbacks() {
  console.log('🔍 Verificando callbacks salvos...');
  
  try {
    const { data: callbacks, error } = await supabase
      .from('multicaixa_express_callbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar callbacks:', error);
      return;
    }

    console.log('📊 Últimos callbacks:', callbacks);
    
  } catch (error) {
    console.error('❌ Erro ao verificar callbacks:', error);
  }
}

// Executar testes
console.log('🚀 Executando testes de callback...');
console.log('1. Verificar callbacks existentes');
console.log('2. Testar fluxo completo');
console.log('3. Verificar status de pedidos');

// Aguardar 2 segundos antes de executar
setTimeout(async () => {
  await verificarCallbacks();
  
  setTimeout(async () => {
    await testarFluxoCompleto();
  }, 2000);
}, 2000);

console.log('📝 Testes iniciados. Verifique o console para resultados.'); 