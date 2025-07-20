// Teste Atualização Quantidade - Verificar se token é atualizado automaticamente com alterações de quantidade
// Execute este script no console do navegador

console.log('🔧 Teste Atualização Quantidade - Verificar se token é atualizado automaticamente com alterações de quantidade');

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
  let quantidadeTotal = 0;
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('quantidade')) {
      console.log('📦 Item encontrado:', elemento.textContent);
    }
    
    // Buscar inputs de quantidade
    if (elemento.tagName === 'INPUT' && elemento.type === 'number') {
      const valor = parseInt(elemento.value);
      if (!isNaN(valor)) {
        quantidadeTotal += valor;
        console.log(`📊 Input de quantidade: ${valor}`);
      }
    }
  }
  
  console.log(`📊 Quantidade total de itens: ${quantidadeTotal}`);
  return quantidadeTotal;
}

// Função para encontrar botões de quantidade
function encontrarBotoesQuantidade() {
  console.log('🔍 Procurando botões de quantidade...');
  
  const botoes = document.querySelectorAll('button');
  const botoesQuantidade = [];
  
  for (const botao of botoes) {
    const texto = botao.textContent;
    const ariaLabel = botao.getAttribute('aria-label');
    const className = botao.className;
    
    // Verificar diferentes padrões de botões de quantidade
    if (texto === '+' || texto === '-' ||
        texto.includes('+') || texto.includes('-') ||
        ariaLabel?.includes('aumentar') || ariaLabel?.includes('diminuir') ||
        ariaLabel?.includes('mais') || ariaLabel?.includes('menos') ||
        className.includes('quantity') || className.includes('qty')) {
      
      botoesQuantidade.push({
        elemento: botao,
        texto: texto,
        ariaLabel: ariaLabel,
        tipo: texto === '+' || texto.includes('+') || ariaLabel?.includes('aumentar') ? 'aumentar' : 'diminuir'
      });
      
      console.log(`✅ Botão de quantidade encontrado: ${texto || ariaLabel} (${botoesQuantidade[botoesQuantidade.length - 1].tipo})`);
    }
  }
  
  return botoesQuantidade;
}

// Função para aumentar quantidade de item
function aumentarQuantidade() {
  console.log('🖱️ Aumentando quantidade de item...');
  
  const botoesQuantidade = encontrarBotoesQuantidade();
  const botoesAumentar = botoesQuantidade.filter(b => b.tipo === 'aumentar');
  
  if (botoesAumentar.length > 0) {
    const botao = botoesAumentar[0].elemento;
    console.log('✅ Clicando no botão de aumentar:', botoesAumentar[0].texto || botoesAumentar[0].ariaLabel);
    botao.click();
    return true;
  }
  
  console.log('❌ Botão de aumentar não encontrado');
  return false;
}

// Função para diminuir quantidade de item
function diminuirQuantidade() {
  console.log('🖱️ Diminuindo quantidade de item...');
  
  const botoesQuantidade = encontrarBotoesQuantidade();
  const botoesDiminuir = botoesQuantidade.filter(b => b.tipo === 'diminuir');
  
  if (botoesDiminuir.length > 0) {
    const botao = botoesDiminuir[0].elemento;
    console.log('✅ Clicando no botão de diminuir:', botoesDiminuir[0].texto || botoesDiminuir[0].ariaLabel);
    botao.click();
    return true;
  }
  
  console.log('❌ Botão de diminuir não encontrado');
  return false;
}

// Função para alterar quantidade via input
function alterarQuantidadeViaInput(novaQuantidade) {
  console.log(`🖱️ Alterando quantidade via input para: ${novaQuantidade}`);
  
  const inputs = document.querySelectorAll('input[type="number"]');
  
  for (const input of inputs) {
    if (input.value && parseInt(input.value) > 0) {
      console.log(`✅ Input de quantidade encontrado: ${input.value}`);
      
      // Alterar valor
      input.value = novaQuantidade;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log(`✅ Quantidade alterada para: ${novaQuantidade}`);
      return true;
    }
  }
  
  console.log('❌ Input de quantidade não encontrado');
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

// Função para verificar contador de atualizações
function verificarContadorAtualizacoes() {
  console.log('🔍 Verificando contador de atualizações...');
  
  const elementos = document.querySelectorAll('*');
  
  for (const elemento of elementos) {
    if (elemento.textContent && elemento.textContent.includes('Atualizações automáticas:')) {
      const match = elemento.textContent.match(/Atualizações automáticas: (\d+)/);
      if (match) {
        const contador = parseInt(match[1]);
        console.log(`✅ Contador de atualizações: ${contador}`);
        return contador;
      }
    }
  }
  
  return 0;
}

// Função para simular alterações de quantidade
function simularAlteracoesQuantidade() {
  console.log('🧪 Simulando alterações de quantidade...');
  
  // 1. Verificar valor inicial
  const valorInicial = verificarValorPagamento();
  const quantidadeInicial = verificarQuantidadeItens();
  console.log(`📋 Valor inicial: ${valorInicial}`);
  console.log(`📋 Quantidade inicial: ${quantidadeInicial}`);
  
  // 2. Aumentar quantidade
  if (aumentarQuantidade()) {
    setTimeout(() => {
      console.log('📋 Quantidade aumentada, aguardando processamento...');
      
      // 3. Verificar novo valor
      setTimeout(() => {
        const valorAposAumentar = verificarValorPagamento();
        const quantidadeAposAumentar = verificarQuantidadeItens();
        console.log(`📋 Valor após aumentar: ${valorAposAumentar}`);
        console.log(`📋 Quantidade após aumentar: ${quantidadeAposAumentar}`);
        
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
            
            const contador1 = verificarContadorAtualizacoes();
            
            // 5. Diminuir quantidade
            setTimeout(() => {
              console.log('📋 Diminuindo quantidade...');
              if (diminuirQuantidade()) {
                setTimeout(() => {
                  const valorAposDiminuir = verificarValorPagamento();
                  const quantidadeAposDiminuir = verificarQuantidadeItens();
                  console.log(`📋 Valor após diminuir: ${valorAposDiminuir}`);
                  console.log(`📋 Quantidade após diminuir: ${quantidadeAposDiminuir}`);
                  
                  if (valorAposDiminuir !== valorAposAumentar) {
                    console.log('✅ Valor foi alterado ao diminuir quantidade');
                    
                    setTimeout(() => {
                      if (verificarAtualizacaoToken()) {
                        console.log('✅ Token está sendo atualizado novamente');
                      } else {
                        console.log('❌ Token não está sendo atualizado');
                      }
                      
                      const contador2 = verificarContadorAtualizacoes();
                      console.log(`📊 Total de atualizações: ${contador2}`);
                      
                      // 6. Testar alteração via input
                      setTimeout(() => {
                        console.log('📋 Testando alteração via input...');
                        if (alterarQuantidadeViaInput(5)) {
                          setTimeout(() => {
                            const valorAposInput = verificarValorPagamento();
                            console.log(`📋 Valor após input: ${valorAposInput}`);
                            
                            setTimeout(() => {
                              if (verificarAtualizacaoToken()) {
                                console.log('✅ Token atualizado após alteração via input');
                              } else {
                                console.log('❌ Token não atualizado após alteração via input');
                              }
                              
                              const contador3 = verificarContadorAtualizacoes();
                              console.log(`📊 Total final de atualizações: ${contador3}`);
                            }, 3000);
                          }, 2000);
                        }
                      }, 2000);
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
  console.log('🚀 Testando fluxo completo de atualização de quantidade...');
  
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
            // 5. Simular alterações de quantidade
            console.log('📋 Passo 4: Simular alterações de quantidade...');
            simularAlteracoesQuantidade();
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
            
            // Detectar contador de atualizações
            if (element.textContent && element.textContent.includes('Atualizações automáticas:')) {
              console.log('🎯 Contador de atualizações detectado!');
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
  
  if (window.globalUpdateCount) {
    console.log('✅ globalUpdateCount encontrado:', window.globalUpdateCount);
  }
  
  if (window.globalPaymentData) {
    console.log('✅ globalPaymentData encontrado:', window.globalPaymentData);
  }
  
  // Verificar se há dados no localStorage
  const keys = Object.keys(localStorage);
  console.log('📋 localStorage keys:', keys);
}

// Executar testes
console.log('🚀 Executando testes de atualização de quantidade...');
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