// Teste Ordem Pagamento - Verificar se "Pagamentos por Referência" aparece primeiro
// Execute este script no console do navegador

console.log('🔧 Teste Ordem Pagamento - Verificar se "Pagamentos por Referência" aparece primeiro');

// Função para verificar a ordem dos métodos de pagamento
function verificarOrdemPagamento() {
  console.log('🧪 Verificando ordem dos métodos de pagamento...');
  
  // Buscar todos os cards de métodos de pagamento
  const paymentCards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  if (paymentCards.length === 0) {
    console.log('❌ Nenhum card de pagamento encontrado');
    return;
  }
  
  console.log(`📊 Encontrados ${paymentCards.length} cards de pagamento`);
  
  // Verificar o primeiro card (deve ser "Pagamentos por Referência")
  const primeiroCard = paymentCards[0];
  const primeiroTitulo = primeiroCard.querySelector('h4');
  
  if (primeiroTitulo) {
    const titulo = primeiroTitulo.textContent;
    console.log('📋 Primeiro método:', titulo);
    
    if (titulo.includes('Referência') || titulo.includes('Pagamentos por Referência')) {
      console.log('✅ CORRETO: "Pagamentos por Referência" aparece primeiro!');
    } else {
      console.log('❌ INCORRETO: "Pagamentos por Referência" não é o primeiro');
    }
  }
  
  // Verificar o segundo card (deve ser "Multicaixa Express")
  if (paymentCards.length > 1) {
    const segundoCard = paymentCards[1];
    const segundoTitulo = segundoCard.querySelector('h4');
    
    if (segundoTitulo) {
      const titulo = segundoTitulo.textContent;
      console.log('📋 Segundo método:', titulo);
      
      if (titulo.includes('Multicaixa Express')) {
        console.log('✅ CORRETO: "Multicaixa Express" aparece em segundo!');
      } else {
        console.log('❌ INCORRETO: "Multicaixa Express" não é o segundo');
      }
    }
  }
  
  // Verificar se "Pagamentos por Referência" está selecionado por padrão
  const cardSelecionado = document.querySelector('[class*="border-primary bg-primary"]');
  if (cardSelecionado) {
    const tituloSelecionado = cardSelecionado.querySelector('h4');
    if (tituloSelecionado) {
      const titulo = tituloSelecionado.textContent;
      console.log('🎯 Método selecionado por padrão:', titulo);
      
      if (titulo.includes('Referência') || titulo.includes('Pagamentos por Referência')) {
        console.log('✅ CORRETO: "Pagamentos por Referência" está selecionado por padrão!');
      } else {
        console.log('❌ INCORRETO: "Pagamentos por Referência" não está selecionado por padrão');
      }
    }
  } else {
    console.log('⚠️ Nenhum método está selecionado por padrão');
  }
}

// Função para testar navegação para checkout
function testarNavegacaoCheckout() {
  console.log('🧪 Testando navegação para checkout...');
  
  // Verificar se estamos na página de checkout
  const isCheckoutPage = window.location.pathname.includes('checkout');
  
  if (isCheckoutPage) {
    console.log('✅ Estamos na página de checkout');
    verificarOrdemPagamento();
  } else {
    console.log('📋 Navegando para checkout...');
    
    // Tentar navegar para checkout
    const checkoutLink = document.querySelector('a[href*="checkout"]');
    if (checkoutLink) {
      console.log('🔗 Link de checkout encontrado, clicando...');
      checkoutLink.click();
      
      // Aguardar carregamento e verificar
      setTimeout(() => {
        verificarOrdemPagamento();
      }, 2000);
    } else {
      console.log('❌ Link de checkout não encontrado');
      console.log('💡 Navegue manualmente para /checkout e execute este teste novamente');
    }
  }
}

// Função para verificar estrutura dos cards
function verificarEstruturaCards() {
  console.log('🔍 Verificando estrutura dos cards de pagamento...');
  
  const cards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  cards.forEach((card, index) => {
    const titulo = card.querySelector('h4');
    const descricao = card.querySelector('p');
    const icone = card.querySelector('img, svg');
    
    console.log(`\n📋 Card ${index + 1}:`);
    console.log(`   Título: ${titulo?.textContent || 'N/A'}`);
    console.log(`   Descrição: ${descricao?.textContent || 'N/A'}`);
    console.log(`   Ícone: ${icone ? 'Presente' : 'Ausente'}`);
    console.log(`   Classes: ${card.className}`);
  });
}

// Função para simular seleção de métodos
function simularSelecao() {
  console.log('🧪 Simulando seleção de métodos de pagamento...');
  
  const cards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  cards.forEach((card, index) => {
    setTimeout(() => {
      console.log(`🖱️ Clicando no card ${index + 1}...`);
      card.click();
      
      // Verificar se foi selecionado
      setTimeout(() => {
        const selecionado = card.classList.contains('border-primary');
        const titulo = card.querySelector('h4')?.textContent;
        console.log(`   ${selecionado ? '✅' : '❌'} ${titulo} ${selecionado ? 'selecionado' : 'não selecionado'}`);
      }, 100);
    }, index * 1000);
  });
}

// Executar testes
console.log('🚀 Executando testes de ordem de pagamento...');
console.log('1. Verificar navegação para checkout');
console.log('2. Verificar ordem dos métodos');
console.log('3. Verificar método padrão selecionado');
console.log('4. Verificar estrutura dos cards');

// Aguardar 2 segundos antes de executar
setTimeout(() => {
  testarNavegacaoCheckout();
  
  setTimeout(() => {
    verificarEstruturaCards();
    
    setTimeout(() => {
      simularSelecao();
    }, 2000);
  }, 2000);
}, 2000);

console.log('📝 Testes iniciados. Verifique o console para resultados.'); 