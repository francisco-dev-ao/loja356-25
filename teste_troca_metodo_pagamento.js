// Teste Troca Método Pagamento - Verificar se modal continua aberto ao trocar método
// Execute este script no console do navegador

console.log('🔧 Teste Troca Método Pagamento - Verificar se modal continua aberto ao trocar método');

// Função para verificar se o modal está aberto
function verificarModalAberto() {
  console.log('🔍 Verificando se o modal está aberto...');
  
  const modal = document.querySelector('[role="dialog"]');
  const iframe = document.querySelector('iframe[src*="pagamentonline.emis.co.ao"]');
  
  if (modal && iframe) {
    console.log('✅ Modal está aberto');
    console.log('🔗 URL do iframe:', iframe.src);
    return true;
  } else {
    console.log('❌ Modal não está aberto');
    return false;
  }
}

// Função para verificar método de pagamento selecionado
function verificarMetodoSelecionado() {
  console.log('🔍 Verificando método de pagamento selecionado...');
  
  const cards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  for (const card of cards) {
    const titulo = card.querySelector('h4');
    if (titulo) {
      const isSelected = card.classList.contains('border-primary');
      console.log(`📋 ${titulo.textContent}: ${isSelected ? 'Selecionado' : 'Não selecionado'}`);
      
      if (isSelected) {
        return titulo.textContent;
      }
    }
  }
  
  return null;
}

// Função para selecionar método de pagamento
function selecionarMetodoPagamento(nomeMetodo) {
  console.log(`🖱️ Selecionando método: ${nomeMetodo}`);
  
  const cards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  for (const card of cards) {
    const titulo = card.querySelector('h4');
    if (titulo && titulo.textContent.includes(nomeMetodo)) {
      console.log(`✅ Clicando em: ${titulo.textContent}`);
      card.click();
      return true;
    }
  }
  
  console.log(`❌ Método "${nomeMetodo}" não encontrado`);
  return false;
}

// Função para verificar se há token salvo
function verificarTokenSalvo() {
  console.log('🔍 Verificando se há token salvo...');
  
  // Verificar se há botão "Continuar Pagamento"
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    if (texto.includes('Continuar Pagamento') || 
        texto.includes('Pagar com Multicaixa Express')) {
      console.log('✅ Botão de pagamento encontrado:', texto);
      return true;
    }
  }
  
  return false;
}

// Função para simular troca de método de pagamento
function simularTrocaMetodo() {
  console.log('🧪 Simulando troca de método de pagamento...');
  
  // 1. Verificar método atual
  const metodoAtual = verificarMetodoSelecionado();
  console.log(`📋 Método atual: ${metodoAtual}`);
  
  // 2. Selecionar outro método
  const novoMetodo = metodoAtual?.includes('Multicaixa Express') ? 'Pagamentos por Referência' : 'Multicaixa Express';
  console.log(`🔄 Trocando para: ${novoMetodo}`);
  
  if (selecionarMetodoPagamento(novoMetodo)) {
    // 3. Aguardar carregamento
    setTimeout(() => {
      console.log('📋 Método trocado, aguardando carregamento...');
      
      // 4. Verificar se modal ainda está aberto (se era Multicaixa Express)
      if (metodoAtual?.includes('Multicaixa Express')) {
        if (verificarModalAberto()) {
          console.log('✅ Modal continua aberto após troca de método');
        } else {
          console.log('❌ Modal foi fechado após troca de método');
        }
      }
      
      // 5. Voltar para Multicaixa Express
      setTimeout(() => {
        console.log('🔄 Voltando para Multicaixa Express...');
        if (selecionarMetodoPagamento('Multicaixa Express')) {
          setTimeout(() => {
            // 6. Verificar se modal reabriu
            if (verificarModalAberto()) {
              console.log('✅ Modal reabriu automaticamente');
            } else if (verificarTokenSalvo()) {
              console.log('✅ Token foi mantido, modal pode ser reaberto');
            } else {
              console.log('❌ Token não foi mantido');
            }
          }, 2000);
        }
      }, 2000);
    }, 2000);
  }
}

// Função para testar fluxo completo
function testarFluxoCompleto() {
  console.log('🚀 Testando fluxo completo de troca de método...');
  
  // 1. Verificar se estamos na página de checkout
  const isCheckoutPage = window.location.pathname.includes('checkout');
  
  if (!isCheckoutPage) {
    console.log('📋 Não estamos na página de checkout');
    console.log('💡 Navegue para /checkout para testar');
    return;
  }
  
  // 2. Selecionar Multicaixa Express
  console.log('📋 Passo 1: Selecionar Multicaixa Express...');
  if (selecionarMetodoPagamento('Multicaixa Express')) {
    setTimeout(() => {
      // 3. Iniciar pagamento
      console.log('📋 Passo 2: Iniciar pagamento...');
      const botaoPagar = document.querySelector('button:contains("Pagar com Multicaixa Express")');
      if (botaoPagar) {
        botaoPagar.click();
        
        setTimeout(() => {
          // 4. Verificar se modal abriu
          console.log('📋 Passo 3: Verificar modal aberto...');
          if (verificarModalAberto()) {
            console.log('✅ Modal aberto com sucesso');
            
            setTimeout(() => {
              // 5. Trocar para outro método
              console.log('📋 Passo 4: Trocar para outro método...');
              simularTrocaMetodo();
            }, 3000);
          } else {
            console.log('❌ Modal não abriu');
          }
        }, 3000);
      } else {
        console.log('❌ Botão de pagamento não encontrado');
      }
    }, 2000);
  } else {
    console.log('❌ Multicaixa Express não encontrado');
  }
}

// Função para monitorar mudanças no DOM
function monitorarMudancas() {
  console.log('👀 Monitorando mudanças no DOM...');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            
            // Detectar modal da EMIS
            if (element.querySelector && element.querySelector('iframe[src*="pagamentonline.emis.co.ao"]')) {
              console.log('🎯 Modal da EMIS detectado!');
            }
            
            // Detectar troca de método de pagamento
            if (element.querySelector && element.querySelector('[class*="MulticaixaExpressPayment"]')) {
              console.log('🎯 Componente Multicaixa Express detectado!');
            }
            
            if (element.querySelector && element.querySelector('[class*="MulticaixaRefPayment"]')) {
              console.log('🎯 Componente Multicaixa Ref detectado!');
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Função para verificar estado global
function verificarEstadoGlobal() {
  console.log('🔍 Verificando estado global...');
  
  // Verificar se há dados salvos no localStorage ou sessionStorage
  const keys = Object.keys(localStorage);
  const sessionKeys = Object.keys(sessionStorage);
  
  console.log('📋 localStorage keys:', keys);
  console.log('📋 sessionStorage keys:', sessionKeys);
  
  // Verificar se há variáveis globais no window
  if (window.globalPaymentData) {
    console.log('✅ globalPaymentData encontrado:', window.globalPaymentData);
  }
  
  if (window.globalPaymentInitiated) {
    console.log('✅ globalPaymentInitiated encontrado:', window.globalPaymentInitiated);
  }
  
  if (window.globalModalOpen) {
    console.log('✅ globalModalOpen encontrado:', window.globalModalOpen);
  }
}

// Executar testes
console.log('🚀 Executando testes de troca de método de pagamento...');
console.log('1. Verificar estado global');
console.log('2. Testar fluxo completo');
console.log('3. Monitorar mudanças no DOM');

// Aguardar 2 segundos antes de executar
setTimeout(() => {
  verificarEstadoGlobal();
  
  setTimeout(() => {
    const observer = monitorarMudancas();
    
    setTimeout(() => {
      testarFluxoCompleto();
      
      // Parar monitoramento após 30 segundos
      setTimeout(() => {
        observer.disconnect();
        console.log('📝 Monitoramento finalizado');
      }, 30000);
    }, 2000);
  }, 2000);
}, 2000);

console.log('📝 Testes iniciados. Verifique o console para resultados.'); 