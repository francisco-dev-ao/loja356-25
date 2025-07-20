// Debug Iframe Loading - Verificar se o iframe carrega corretamente
// Execute este script no console do navegador

console.log('🔧 Debug Iframe Loading - Verificar se o iframe carrega corretamente');

// Token de teste
const testToken = '7fb94631-7bb4-4f99-a2e5-f2453477832a';

// URL do modal
const modalUrl = `https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame?token=${testToken}`;

console.log('🔗 URL do modal:', modalUrl);

// Criar iframe de teste
const testIframe = document.createElement('iframe');
testIframe.style.width = '600px';
testIframe.style.height = '400px';
testIframe.style.border = '2px solid blue';
testIframe.style.position = 'fixed';
testIframe.style.top = '50px';
testIframe.style.left = '50px';
testIframe.style.zIndex = '9999';
testIframe.style.backgroundColor = 'white';

// Adicionar eventos de debug
testIframe.onload = () => {
  console.log('✅ Iframe carregou com sucesso');
  testIframe.style.border = '2px solid green';
  
  // Verificar se o conteúdo carregou
  try {
    const iframeDoc = testIframe.contentDocument || testIframe.contentWindow.document;
    console.log('📄 Documento do iframe:', iframeDoc.title);
    console.log('🔗 URL atual do iframe:', iframeDoc.URL);
  } catch (e) {
    console.log('🔒 Iframe com CORS - não é possível acessar conteúdo');
  }
};

testIframe.onerror = () => {
  console.log('❌ Erro ao carregar iframe');
  testIframe.style.border = '2px solid red';
};

// Adicionar listener para mudanças de src
let loadStartTime = Date.now();
testIframe.addEventListener('loadstart', () => {
  console.log('🚀 Iniciando carregamento do iframe');
  loadStartTime = Date.now();
});

testIframe.addEventListener('load', () => {
  const loadTime = Date.now() - loadStartTime;
  console.log(`⏱️ Iframe carregado em ${loadTime}ms`);
});

// Adicionar ao DOM
document.body.appendChild(testIframe);

// Definir src após adicionar ao DOM
testIframe.src = modalUrl;

// Timer para verificar se carregou
setTimeout(() => {
  console.log('⏰ Verificação após 5 segundos:');
  console.log('📊 Iframe readyState:', testIframe.contentWindow?.document?.readyState);
  console.log('🔗 Iframe src atual:', testIframe.src);
  
  if (testIframe.style.border.includes('green')) {
    console.log('✅ Iframe carregou corretamente');
  } else if (testIframe.style.border.includes('red')) {
    console.log('❌ Iframe falhou ao carregar');
  } else {
    console.log('⏳ Iframe ainda carregando...');
  }
}, 5000);

// Remover iframe após 30 segundos
setTimeout(() => {
  if (testIframe.parentNode) {
    testIframe.parentNode.removeChild(testIframe);
    console.log('🗑️ Iframe de teste removido');
  }
}, 30000);

console.log('📝 Debug iframe iniciado. Verifique o iframe azul na tela.'); 