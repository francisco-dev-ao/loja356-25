// Teste Atualização Carrinho - Verificar se token é atualizado automaticamente quando itens são adicionados/removidos
// Execute este script no console do navegador

console.log('🔧 Teste Atualização Carrinho - Verificar se token é atualizado automaticamente quando itens são adicionados/removidos');

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

// Função para verificar quantidade de itens no carrinho
function verificarQuantidadeItens() {
  console.log('🔍 Verificando quantidade de itens no carrinho...');
  
  // Buscar elementos que mostram quantidade
  const elementos = document.querySelectorAll('*');
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('item')) {
      console.log('📦 Item encontrado:', elemento.textContent);
    }
  }
  
  // Buscar botões de quantidade
  const botoesQuantidade = document.querySelectorAll('button[aria-label*="quantidade"], button[class*="quantity"]');
  console.log(`📊 Botões de quantidade encontrados: ${botoesQuantidade.length}`);
  
  return botoesQuantidade.length;
}

// Função para adicionar item ao carrinho
function adicionarItemCarrinho() {
  console.log('🖱️ Adicionando item ao carrinho...');
  
  // Buscar botões de "Adicionar ao Carrinho"
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    if (texto.includes('Adicionar ao Carrinho') || 
        texto.includes('Adicionar') ||
        texto.includes('Comprar')) {
      console.log('✅ Botão de adicionar encontrado:', texto);
      botao.click();
      return true;
    }
  }
  
  console.log('❌ Botão de adicionar não encontrado');
  return false;
}

// Função para aumentar quantidade de item
function aumentarQuantidade() {
  console.log('🖱️ Aumentando quantidade de item...');
  
  // Buscar botões de "+" ou "aumentar"
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    const ariaLabel = botao.getAttribute('aria-label');
    
    if (texto === '+' || 
        texto.includes('+') ||
        ariaLabel?.includes('aumentar') ||
        ariaLabel?.includes('mais')) {
      console.log('✅ Botão de aumentar encontrado:', texto || ariaLabel);
      botao.click();
      return true;
    }
  }
  
  console.log('❌ Botão de aumentar não encontrado');
  return false;
}

// Função para diminuir quantidade de item
function diminuirQuantidade() {
  console.log('🖱️ Diminuindo quantidade de item...');
  
  // Buscar botões de "-" ou "diminuir"
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    const ariaLabel = botao.getAttribute('aria-label');
    
    if (texto === '-' || 
        texto.includes('-') ||
        ariaLabel?.includes('diminuir') ||
        ariaLabel?.includes('menos')) {
      console.log('✅ Botão de diminuir encontrado:', texto || ariaLabel);
      botao.click();
      return true;
    }
  }
  
  console.log('❌ Botão de diminuir não encontrado');
  return false;
}

// Função para remover item do carrinho
function removerItemCarrinho() {
  console.log('🖱️ Removendo item do carrinho...');
  
  // Buscar botões de remover
  const botoes = document.querySelectorAll('button');
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    const ariaLabel = botao.getAttribute('aria-label');
    
    if (texto.includes('Remover') || 
        texto.includes('Excluir') ||
        texto.includes('Delete') ||
        ariaLabel?.includes('remover') ||
        ariaLabel?.includes('excluir')) {
      console.log('✅ Botão de remover encontrado:', texto || ariaLabel);
      botao.click();
      return true;
    }
  }
  
  console.log('❌ Botão de remover não encontrado');
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

// Função para simular mudanças no carrinho
function simularMudancasCarrinho() {
  console.log('🧪 Simulando mudanças no carrinho...');
  
  // 1. Verificar valor inicial
  const valorInicial = verificarValorPagamento();
  console.log(`📋 Valor inicial: ${valorInicial}`);
  
  // 2. Aumentar quantidade de item
  if (aumentarQuantidade()) {
    setTimeout(() => {
      console.log('📋 Quantidade aumentada, aguardando processamento...');
      
      // 3. Verificar novo valor
      setTimeout(() => {
        const valorAposAumentar = verificarValorPagamento();
        console.log(`📋 Valor após aumentar: ${valorAposAumentar}`);
        
        if (valorInicial !== valorAposAumentar) {
          console.log('✅ Valor foi alterado ao aumentar quantidade');
          
          // 4. Verificar se token foi atualizado
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
            
            // 5. Diminuir quantidade
            setTimeout(() => {
              console.log('📋 Diminuindo quantidade...');
              if (diminuirQuantidade()) {
                setTimeout(() => {
                  const valorAposDiminuir = verificarValorPagamento();
                  console.log(`📋 Valor após diminuir: ${valorAposDiminuir}`);
                  
                  if (valorAposDiminuir !== valorAposAumentar) {
                    console.log('✅ Valor foi alterado ao diminuir quantidade');
                    
                    setTimeout(() => {
                      if (verificarAtualizacaoToken()) {
                        console.log('✅ Token está sendo atualizado novamente');
                      } else {
                        console.log('❌ Token não está sendo atualizado');
                      }
                    }, 3000);
                  }
                }, 2000);
              }
            }, 2000);
          }, 3000);
        } else {
          console.log('❌ Valor não foi alterado');
        }
      }, 2000);
    }, 1000);
  }
}

// Função para testar fluxo completo
function testarFluxoCompleto() {
  console.log('🚀 Testando fluxo completo de atualização do carrinho...');
  
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
            // 5. Simular mudanças no carrinho
            console.log('📋 Passo 4: Simular mudanças no carrinho...');
            simularMudancasCarrinho();
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
            
            // Detectar mudanças de quantidade
            if (element.textContent && element.textContent.includes('quantidade')) {
              console.log('🎯 Mudança de quantidade detectada!');
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
  
  if (window.globalLastUpdateTime) {
    console.log('✅ globalLastUpdateTime encontrado:', window.globalLastUpdateTime);
  }
  
  if (window.globalPaymentData) {
    console.log('✅ globalPaymentData encontrado:', window.globalPaymentData);
  }
  
  // Verificar se há dados no localStorage
  const keys = Object.keys(localStorage);
  console.log('📋 localStorage keys:', keys);
}

// Executar testes
console.log('🚀 Executando testes de atualização do carrinho...');
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