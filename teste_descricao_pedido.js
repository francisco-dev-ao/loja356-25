// Teste Descrição Pedido - Verificar se a descrição está formatada corretamente
// Execute este script no console do navegador

console.log('🔧 Teste Descrição Pedido - Verificar se a descrição está formatada corretamente');

// Função para simular a geração de descrição do pedido
function generateOrderDescription(orderId) {
  if (!orderId) {
    return 'Compra Online';
  }
  
  // Pegar apenas os primeiros 8 caracteres do ID e formatar
  const shortId = orderId.substring(0, 8).toUpperCase();
  const timestamp = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return `Compra #${shortId} - ${timestamp}`;
}

// Função para testar diferentes IDs de pedido
function testarDescricoes() {
  console.log('🧪 Testando diferentes descrições de pedido...');
  
  const testCases = [
    null,
    '0d732633-83f7-41d3-9678-e803aa9625ba',
    'abc123def456',
    'ORDER-12345',
    'pedido-2025-001',
    '1234567890abcdef'
  ];
  
  testCases.forEach((orderId, index) => {
    const descricao = generateOrderDescription(orderId);
    console.log(`\n📋 Teste ${index + 1}:`);
    console.log(`   Order ID: ${orderId || 'null'}`);
    console.log(`   Descrição: ${descricao}`);
    console.log(`   Comprimento: ${descricao.length} caracteres`);
    
    // Verificar se a descrição é amigável
    if (descricao.length > 50) {
      console.log('   ⚠️ Descrição muito longa');
    } else if (descricao.includes('0d732633-83f7-41d3-9678-e803aa9625ba')) {
      console.log('   ❌ Descrição contém ID completo (erro)');
    } else {
      console.log('   ✅ Descrição formatada corretamente');
    }
  });
}

// Função para verificar descrições na página atual
function verificarDescricoesPagina() {
  console.log('🔍 Verificando descrições na página atual...');
  
  // Buscar elementos que podem conter descrições de pedido
  const elementos = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
  
  elementos.forEach((elemento) => {
    const texto = elemento.textContent;
    
    // Verificar se contém IDs longos de pedido
    if (texto.includes('0d732633-83f7-41d3-9678-e803aa9625ba') || 
        texto.includes('Pedido 0d732633')) {
      console.log('❌ Encontrado ID longo de pedido:', texto);
    }
    
    // Verificar se contém descrições formatadas
    if (texto.includes('Compra #') && texto.includes('-')) {
      console.log('✅ Encontrada descrição formatada:', texto);
    }
  });
}

// Função para verificar componentes de pagamento
function verificarComponentesPagamento() {
  console.log('🔍 Verificando componentes de pagamento...');
  
  // Buscar componentes de pagamento
  const multicaixaRef = document.querySelector('[class*="MulticaixaRefPayment"]');
  const multicaixaExpress = document.querySelector('[class*="MulticaixaExpressPayment"]');
  
  if (multicaixaRef) {
    console.log('📋 Componente MulticaixaRefPayment encontrado');
    
    // Buscar descrição no componente
    const descricao = multicaixaRef.querySelector('[class*="description"]');
    if (descricao) {
      console.log('   Descrição:', descricao.textContent);
    }
  }
  
  if (multicaixaExpress) {
    console.log('📋 Componente MulticaixaExpressPayment encontrado');
    
    // Buscar descrição no componente
    const descricao = multicaixaExpress.querySelector('[class*="description"]');
    if (descricao) {
      console.log('   Descrição:', descricao.textContent);
    }
  }
}

// Função para simular criação de pedido
function simularCriacaoPedido() {
  console.log('🧪 Simulando criação de pedido...');
  
  // Simular ID de pedido
  const orderId = '0d732633-83f7-41d3-9678-e803aa9625ba';
  const descricaoAntiga = `Pedido ${orderId}`;
  const descricaoNova = generateOrderDescription(orderId);
  
  console.log('📋 Comparação de descrições:');
  console.log(`   Antiga: "${descricaoAntiga}"`);
  console.log(`   Nova: "${descricaoNova}"`);
  console.log(`   Melhoria: ${descricaoAntiga.length - descricaoNova.length} caracteres a menos`);
  
  // Verificar se a nova descrição é melhor
  if (descricaoNova.length < descricaoAntiga.length) {
    console.log('✅ Nova descrição é mais concisa');
  } else {
    console.log('❌ Nova descrição não é mais concisa');
  }
  
  // Verificar se contém informações úteis
  if (descricaoNova.includes('Compra #') && descricaoNova.includes('-')) {
    console.log('✅ Nova descrição contém informações úteis');
  } else {
    console.log('❌ Nova descrição não contém informações úteis');
  }
}

// Função para verificar se estamos na página de checkout
function verificarPaginaCheckout() {
  console.log('🔍 Verificando se estamos na página de checkout...');
  
  const isCheckoutPage = window.location.pathname.includes('checkout');
  
  if (isCheckoutPage) {
    console.log('✅ Estamos na página de checkout');
    verificarDescricoesPagina();
    verificarComponentesPagamento();
  } else {
    console.log('📋 Não estamos na página de checkout');
    console.log('💡 Navegue para /checkout para ver as descrições em ação');
  }
}

// Executar testes
console.log('🚀 Executando testes de descrição de pedido...');
console.log('1. Testar geração de descrições');
console.log('2. Simular criação de pedido');
console.log('3. Verificar página de checkout');
console.log('4. Verificar componentes de pagamento');

// Aguardar 2 segundos antes de executar
setTimeout(() => {
  testarDescricoes();
  
  setTimeout(() => {
    simularCriacaoPedido();
    
    setTimeout(() => {
      verificarPaginaCheckout();
    }, 1000);
  }, 1000);
}, 2000);

console.log('📝 Testes iniciados. Verifique o console para resultados.'); 