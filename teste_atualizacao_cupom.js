// Teste Atualização Cupom - Verificar se token é atualizado automaticamente
// Execute este script no console do navegador

console.log('🔧 Teste Atualização Cupom - Verificar se token é atualizado automaticamente');

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

// Função para verificar valor atual do pagamento
function verificarValorPagamento() {
  console.log('🔍 Verificando valor atual do pagamento...');
  
  const elementos = document.querySelectorAll('*');
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('Valor a pagar:')) {
      const valorElement = elemento.querySelector('span:last-child');
      if (valorElement) {
        const valor = valorElement.textContent;
        console.log('💰 Valor atual:', valor);
        return valor;
      }
    }
  }
  
  return null;
}

// Função para verificar se há cupom aplicado
function verificarCupomAplicado() {
  console.log('🔍 Verificando se há cupom aplicado...');
  
  const elementos = document.querySelectorAll('*');
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('Cupom aplicado')) {
      console.log('✅ Cupom aplicado encontrado');
      return true;
    }
    
    if (elemento.textContent && elemento.textContent.includes('de desconto')) {
      console.log('✅ Desconto encontrado:', elemento.textContent);
      return true;
    }
  }
  
  return false;
}

// Função para aplicar cupom
function aplicarCupom(codigoCupom) {
  console.log(`🖱️ Aplicando cupom: ${codigoCupom}`);
  
  // Buscar campo de cupom
  const campoCupom = document.querySelector('input[placeholder*="código do cupom"], input[placeholder*="cupom"]');
  if (campoCupom) {
    console.log('✅ Campo de cupom encontrado');
    
    // Limpar e preencher campo
    campoCupom.value = codigoCupom;
    campoCupom.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Buscar botão de aplicar
    const botoes = document.querySelectorAll('button');
    for (const botao of botoes) {
      if (botao.textContent.includes('Aplicar') || botao.textContent.includes('Aplicar Cupom')) {
        console.log('✅ Botão de aplicar encontrado');
        botao.click();
        return true;
      }
    }
  }
  
  console.log('❌ Campo ou botão de cupom não encontrado');
  return false;
}

// Função para remover cupom
function removerCupom() {
  console.log('🖱️ Removendo cupom...');
  
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    if (botao.textContent.includes('Remover') || botao.textContent.includes('Remover Cupom')) {
      console.log('✅ Botão de remover encontrado');
      botao.click();
      return true;
    }
  }
  
  console.log('❌ Botão de remover cupom não encontrado');
  return false;
}

// Função para verificar se há indicador de atualização
function verificarAtualizacaoToken() {
  console.log('🔍 Verificando se há indicador de atualização...');
  
  const elementos = document.querySelectorAll('*');
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('Atualizando valor do pagamento')) {
      console.log('✅ Indicador de atualização encontrado');
      return true;
    }
    
    if (elemento.textContent && elemento.textContent.includes('Atualizando Pagamento')) {
      console.log('✅ Botão de atualização encontrado');
      return true;
    }
  }
  
  return false;
}

// Função para verificar se há notificação de atualização
function verificarNotificacaoAtualizacao() {
  console.log('🔍 Verificando notificações de atualização...');
  
  // Verificar toasts/notificações
  const toasts = document.querySelectorAll('[class*="toast"], [class*="notification"], [class*="alert"]');
  
  for (const toast of toasts) {
    if (toast.textContent && toast.textContent.includes('atualizado')) {
      console.log('✅ Notificação de atualização encontrada:', toast.textContent);
      return true;
    }
  }
  
  return false;
}

// Função para simular aplicação de cupom
function simularAplicacaoCupom() {
  console.log('🧪 Simulando aplicação de cupom...');
  
  // 1. Verificar valor inicial
  const valorInicial = verificarValorPagamento();
  console.log(`📋 Valor inicial: ${valorInicial}`);
  
  // 2. Aplicar cupom de teste
  const cupomTeste = 'DESCONTO10'; // Cupom de exemplo
  if (aplicarCupom(cupomTeste)) {
    // 3. Aguardar aplicação
    setTimeout(() => {
      console.log('📋 Cupom aplicado, aguardando processamento...');
      
      // 4. Verificar se cupom foi aplicado
      if (verificarCupomAplicado()) {
        console.log('✅ Cupom foi aplicado com sucesso');
        
        // 5. Verificar novo valor
        setTimeout(() => {
          const valorFinal = verificarValorPagamento();
          console.log(`📋 Valor final: ${valorFinal}`);
          
          if (valorInicial !== valorFinal) {
            console.log('✅ Valor foi alterado pelo cupom');
            
            // 6. Verificar se token foi atualizado
            setTimeout(() => {
              if (verificarAtualizacaoToken()) {
                console.log('✅ Token está sendo atualizado');
              } else {
                console.log('❌ Token não está sendo atualizado');
              }
              
              if (verificarNotificacaoAtualizacao()) {
                console.log('✅ Notificação de atualização foi exibida');
              } else {
                console.log('❌ Notificação de atualização não foi exibida');
              }
            }, 3000);
          } else {
            console.log('❌ Valor não foi alterado');
          }
        }, 2000);
      } else {
        console.log('❌ Cupom não foi aplicado');
      }
    }, 2000);
  }
}

// Função para testar fluxo completo
function testarFluxoCompleto() {
  console.log('🚀 Testando fluxo completo de atualização de cupom...');
  
  // 1. Verificar se estamos na página de checkout
  const isCheckoutPage = window.location.pathname.includes('checkout');
  
  if (!isCheckoutPage) {
    console.log('📋 Não estamos na página de checkout');
    console.log('💡 Navegue para /checkout para testar');
    return;
  }
  
  // 2. Selecionar Multicaixa Express
  console.log('📋 Passo 1: Selecionar Multicaixa Express...');
  const cards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  for (const card of cards) {
    const titulo = card.querySelector('h4');
    if (titulo && titulo.textContent.includes('Multicaixa Express')) {
      console.log('✅ Multicaixa Express encontrado');
      card.click();
      break;
    }
  }
  
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
            // 5. Aplicar cupom
            console.log('📋 Passo 4: Aplicar cupom...');
            simularAplicacaoCupom();
          }, 3000);
        } else {
          console.log('❌ Modal não abriu');
        }
      }, 3000);
    } else {
      console.log('❌ Botão de pagamento não encontrado');
    }
  }, 2000);
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
            
            // Detectar mudanças de valor
            if (element.textContent && element.textContent.includes('Valor a pagar:')) {
              console.log('🎯 Valor do pagamento detectado!');
            }
            
            // Detectar aplicação de cupom
            if (element.textContent && element.textContent.includes('Cupom aplicado')) {
              console.log('🎯 Cupom aplicado detectado!');
            }
            
            // Detectar atualização de token
            if (element.textContent && element.textContent.includes('Atualizando valor')) {
              console.log('🎯 Atualização de token detectada!');
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
  
  // Verificar se há variáveis globais no window
  if (window.globalLastAmount) {
    console.log('✅ globalLastAmount encontrado:', window.globalLastAmount);
  }
  
  if (window.globalPaymentData) {
    console.log('✅ globalPaymentData encontrado:', window.globalPaymentData);
  }
  
  // Verificar se há dados no localStorage
  const keys = Object.keys(localStorage);
  console.log('📋 localStorage keys:', keys);
}

// Executar testes
console.log('🚀 Executando testes de atualização de cupom...');
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