// Teste Modal Carregamento - Verificar se o modal carrega sem ficar preso
// Execute este script no console do navegador

console.log('🔧 Teste Modal Carregamento - Verificar se o modal carrega sem ficar preso');

// Função para testar o modal
async function testarModal() {
  console.log('🧪 Iniciando teste do modal...');
  
  // Gerar token primeiro
  const testData = {
    reference: 'MODAL-TEST-' + Date.now(),
    amount: 912000,
    token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
    mobile: 'PAYMENT',
    card: 'DISABLED',
    qrCode: 'PAYMENT',
    callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
  };

  console.log('📤 Gerando token...');
  
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
      console.log('✅ Token gerado:', data.id || data.token);
      
      // Testar modal
      const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${data.id || data.token}`;
      console.log('🔗 URL do modal:', modalUrl);
      
      // Abrir modal em nova janela
      const modalWindow = window.open(modalUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (modalWindow) {
        console.log('✅ Modal aberto em nova janela');
        
        // Monitorar se a janela foi fechada
        const checkClosed = setInterval(() => {
          if (modalWindow.closed) {
            console.log('✅ Modal foi fechado pelo usuário');
            clearInterval(checkClosed);
          }
        }, 1000);
        
        // Auto-fechar após 2 minutos se não foi fechado
        setTimeout(() => {
          if (!modalWindow.closed) {
            console.log('⏰ Auto-fechando modal após 2 minutos');
            modalWindow.close();
            clearInterval(checkClosed);
          }
        }, 120000);
        
      } else {
        console.log('❌ Não foi possível abrir o modal (popup bloqueado)');
        console.log('💡 Dica: Permita popups para este site');
      }
      
    } else {
      console.log('❌ Erro na API:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Função para testar iframe diretamente
function testarIframe() {
  console.log('🧪 Testando iframe diretamente...');
  
  // Criar iframe de teste
  const iframe = document.createElement('iframe');
  iframe.style.width = '800px';
  iframe.style.height = '600px';
  iframe.style.border = '2px solid #ccc';
  iframe.style.position = 'fixed';
  iframe.style.top = '50px';
  iframe.style.left = '50px';
  iframe.style.zIndex = '9999';
  
  // URL de teste
  iframe.src = 'https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=test';
  
  // Adicionar ao DOM
  document.body.appendChild(iframe);
  
  // Monitorar carregamento
  iframe.onload = () => {
    console.log('✅ Iframe carregado');
    
    // Remover após 10 segundos
    setTimeout(() => {
      document.body.removeChild(iframe);
      console.log('🗑️ Iframe removido');
    }, 10000);
  };
  
  iframe.onerror = () => {
    console.log('❌ Erro ao carregar iframe');
    document.body.removeChild(iframe);
  };
  
  // Botão para remover
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Fechar Teste';
  removeBtn.style.position = 'fixed';
  removeBtn.style.top = '10px';
  removeBtn.style.left = '10px';
  removeBtn.style.zIndex = '10000';
  removeBtn.onclick = () => {
    document.body.removeChild(iframe);
    document.body.removeChild(removeBtn);
  };
  document.body.appendChild(removeBtn);
}

// Executar testes
console.log('🚀 Executando testes...');
console.log('1. Teste do modal em nova janela');
console.log('2. Teste do iframe direto');

// Aguardar 2 segundos antes de executar
setTimeout(() => {
  testarModal();
  
  setTimeout(() => {
    testarIframe();
  }, 3000);
}, 2000);

console.log('📝 Testes iniciados. Verifique as janelas que abrirem.'); 