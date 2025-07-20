// Teste Modal Reabertura - Verificar se o modal reabre com o mesmo token
// Execute este script no console do navegador

console.log('🔧 Teste Modal Reabertura - Verificar se o modal reabre com o mesmo token');

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

// Função para verificar se há token salvo
function verificarTokenSalvo() {
  console.log('🔍 Verificando se há token salvo...');
  
  // Buscar elementos que podem conter informações do token
  const elementos = document.querySelectorAll('*');
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('token')) {
      console.log('📋 Elemento com token encontrado:', elemento.textContent);
    }
  }
  
  // Verificar se há botão "Continuar Pagamento"
  const botaoContinuar = document.querySelector('button:contains("Continuar Pagamento")');
  if (botaoContinuar) {
    console.log('✅ Botão "Continuar Pagamento" encontrado');
    return true;
  }
  
  return false;
}

// Função para simular fechamento do modal
function simularFechamentoModal() {
  console.log('🧪 Simulando fechamento do modal...');
  
  // Buscar botão de fechar ou ESC
  const botaoFechar = document.querySelector('[aria-label="Close"], button[data-dismiss="modal"]');
  
  if (botaoFechar) {
    console.log('🖱️ Clicando no botão de fechar...');
    botaoFechar.click();
  } else {
    console.log('⌨️ Pressionando ESC para fechar...');
    // Simular tecla ESC
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true
    });
    document.dispatchEvent(event);
  }
  
  // Aguardar fechamento
  setTimeout(() => {
    if (!verificarModalAberto()) {
      console.log('✅ Modal foi fechado com sucesso');
    } else {
      console.log('❌ Modal não foi fechado');
    }
  }, 1000);
}

// Função para simular reabertura do modal
function simularReaberturaModal() {
  console.log('🧪 Simulando reabertura do modal...');
  
  // Buscar botão "Continuar Pagamento" ou "Pagar com Multicaixa Express"
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    if (texto.includes('Continuar Pagamento') || 
        texto.includes('Pagar com Multicaixa Express') ||
        texto.includes('Abrir Modal de Pagamento')) {
      console.log('🖱️ Clicando no botão:', texto);
      botao.click();
      
      // Aguardar abertura
      setTimeout(() => {
        if (verificarModalAberto()) {
          console.log('✅ Modal foi reaberto com sucesso');
        } else {
          console.log('❌ Modal não foi reaberto');
        }
      }, 2000);
      
      return;
    }
  }
  
  console.log('❌ Nenhum botão de pagamento encontrado');
}

// Função para verificar estado do componente
function verificarEstadoComponente() {
  console.log('🔍 Verificando estado do componente...');
  
  // Verificar se estamos na página de checkout
  const isCheckoutPage = window.location.pathname.includes('checkout');
  
  if (!isCheckoutPage) {
    console.log('📋 Não estamos na página de checkout');
    console.log('💡 Navegue para /checkout para testar');
    return;
  }
  
  // Verificar se Multicaixa Express está selecionado
  const multicaixaCard = document.querySelector('[class*="cursor-pointer"]');
  if (multicaixaCard) {
    const titulo = multicaixaCard.querySelector('h4');
    if (titulo && titulo.textContent.includes('Multicaixa Express')) {
      console.log('✅ Multicaixa Express está disponível');
      
      // Verificar se está selecionado
      const isSelected = multicaixaCard.classList.contains('border-primary');
      console.log(`   Selecionado: ${isSelected ? 'Sim' : 'Não'}`);
      
      if (!isSelected) {
        console.log('🖱️ Selecionando Multicaixa Express...');
        multicaixaCard.click();
      }
    }
  }
  
  // Verificar se há componente de pagamento
  const componentePagamento = document.querySelector('[class*="MulticaixaExpressPayment"]');
  if (componentePagamento) {
    console.log('✅ Componente de pagamento encontrado');
  } else {
    console.log('❌ Componente de pagamento não encontrado');
  }
}

// Função para testar fluxo completo
function testarFluxoCompleto() {
  console.log('🚀 Testando fluxo completo de reabertura...');
  
  // 1. Verificar estado inicial
  verificarEstadoComponente();
  
  setTimeout(() => {
    // 2. Iniciar pagamento
    console.log('📋 Passo 1: Iniciar pagamento...');
    const botaoPagar = document.querySelector('button:contains("Pagar com Multicaixa Express")');
    if (botaoPagar) {
      botaoPagar.click();
      
      setTimeout(() => {
        // 3. Verificar se modal abriu
        console.log('📋 Passo 2: Verificar modal aberto...');
        if (verificarModalAberto()) {
          console.log('✅ Modal aberto com sucesso');
          
          setTimeout(() => {
            // 4. Fechar modal
            console.log('📋 Passo 3: Fechar modal...');
            simularFechamentoModal();
            
            setTimeout(() => {
              // 5. Verificar se token foi mantido
              console.log('📋 Passo 4: Verificar token mantido...');
              if (verificarTokenSalvo()) {
                console.log('✅ Token foi mantido');
                
                setTimeout(() => {
                  // 6. Reabrir modal
                  console.log('📋 Passo 5: Reabrir modal...');
                  simularReaberturaModal();
                }, 1000);
              } else {
                console.log('❌ Token não foi mantido');
              }
            }, 1000);
          }, 2000);
        } else {
          console.log('❌ Modal não abriu');
        }
      }, 3000);
    } else {
      console.log('❌ Botão de pagamento não encontrado');
    }
  }, 1000);
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
            if (element.querySelector && element.querySelector('iframe[src*="pagamentonline.emis.co.ao"]')) {
              console.log('🎯 Modal da EMIS detectado!');
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

// Executar testes
console.log('🚀 Executando testes de reabertura do modal...');
console.log('1. Verificar estado do componente');
console.log('2. Testar fluxo completo');
console.log('3. Monitorar mudanças no DOM');

// Aguardar 2 segundos antes de executar
setTimeout(() => {
  verificarEstadoComponente();
  
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