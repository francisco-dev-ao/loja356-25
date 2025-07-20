// Teste Logo Multicaixa Express - Verificar se o logo appypay_gpo.png está sendo exibido
// Execute este script no console do navegador

console.log('🔧 Teste Logo Multicaixa Express - Verificar se o logo appypay_gpo.png está sendo exibido');

// Função para verificar se o logo está sendo carregado
function verificarLogoMulticaixa() {
  console.log('🧪 Verificando logo do Multicaixa Express...');
  
  // Buscar todas as imagens do logo
  const logos = document.querySelectorAll('img[src*="appypay_gpo.png"]');
  
  if (logos.length === 0) {
    console.log('❌ Nenhum logo do Multicaixa Express encontrado');
    return;
  }
  
  console.log(`📊 Encontrados ${logos.length} logos do Multicaixa Express`);
  
  logos.forEach((logo, index) => {
    console.log(`\n📋 Logo ${index + 1}:`);
    console.log(`   Src: ${logo.src}`);
    console.log(`   Alt: ${logo.alt}`);
    console.log(`   Classes: ${logo.className}`);
    console.log(`   Width: ${logo.width}px`);
    console.log(`   Height: ${logo.height}px`);
    
    // Verificar se a imagem carregou corretamente
    if (logo.complete && logo.naturalHeight !== 0) {
      console.log('   ✅ Logo carregado corretamente');
    } else {
      console.log('   ❌ Logo não carregou corretamente');
    }
  });
}

// Função para verificar onde o logo está sendo usado
function verificarUsoLogo() {
  console.log('🔍 Verificando onde o logo está sendo usado...');
  
  // Buscar cards de pagamento
  const paymentCards = document.querySelectorAll('[class*="cursor-pointer"]');
  
  paymentCards.forEach((card, index) => {
    const titulo = card.querySelector('h4');
    const logo = card.querySelector('img[src*="appypay_gpo.png"]');
    
    if (titulo && titulo.textContent.includes('Multicaixa Express')) {
      console.log(`\n📋 Card Multicaixa Express ${index + 1}:`);
      console.log(`   Título: ${titulo.textContent}`);
      
      if (logo) {
        console.log('   ✅ Logo encontrado no card');
        console.log(`   Logo src: ${logo.src}`);
      } else {
        console.log('   ❌ Logo não encontrado no card');
      }
    }
  });
  
  // Buscar títulos de componentes
  const titulos = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  titulos.forEach((titulo) => {
    if (titulo.textContent.includes('Multicaixa Express')) {
      const logo = titulo.parentElement?.querySelector('img[src*="appypay_gpo.png"]');
      
      console.log(`\n📋 Título com Multicaixa Express: ${titulo.textContent}`);
      
      if (logo) {
        console.log('   ✅ Logo encontrado no título');
        console.log(`   Logo src: ${logo.src}`);
      } else {
        console.log('   ❌ Logo não encontrado no título');
      }
    }
  });
}

// Função para testar carregamento da imagem
function testarCarregamentoImagem() {
  console.log('🧪 Testando carregamento da imagem...');
  
  const img = new Image();
  img.onload = function() {
    console.log('✅ Imagem appypay_gpo.png carregada com sucesso');
    console.log(`   Dimensões: ${this.width}x${this.height}px`);
  };
  
  img.onerror = function() {
    console.log('❌ Erro ao carregar imagem appypay_gpo.png');
  };
  
  img.src = '/images/appypay_gpo.png';
}

// Função para verificar se estamos na página correta
function verificarPagina() {
  console.log('🔍 Verificando página atual...');
  
  const isCheckoutPage = window.location.pathname.includes('checkout');
  const isProductsPage = window.location.pathname.includes('produtos');
  const isHomePage = window.location.pathname === '/';
  
  console.log(`📄 Página atual: ${window.location.pathname}`);
  
  if (isCheckoutPage) {
    console.log('✅ Estamos na página de checkout - logo deve estar visível');
  } else if (isProductsPage) {
    console.log('📋 Página de produtos - navegue para checkout para ver o logo');
  } else if (isHomePage) {
    console.log('🏠 Página inicial - navegue para checkout para ver o logo');
  } else {
    console.log('📄 Outra página - navegue para checkout para ver o logo');
  }
}

// Função para simular navegação para checkout
function navegarParaCheckout() {
  console.log('🧪 Navegando para checkout...');
  
  // Verificar se há link para checkout
  const checkoutLink = document.querySelector('a[href*="checkout"]');
  
  if (checkoutLink) {
    console.log('🔗 Link de checkout encontrado, clicando...');
    checkoutLink.click();
    
    // Aguardar carregamento e verificar logo
    setTimeout(() => {
      verificarLogoMulticaixa();
      verificarUsoLogo();
    }, 2000);
  } else {
    console.log('❌ Link de checkout não encontrado');
    console.log('💡 Navegue manualmente para /checkout e execute este teste novamente');
  }
}

// Executar testes
console.log('🚀 Executando testes do logo Multicaixa Express...');
console.log('1. Verificar página atual');
console.log('2. Testar carregamento da imagem');
console.log('3. Verificar uso do logo');
console.log('4. Navegar para checkout se necessário');

// Aguardar 2 segundos antes de executar
setTimeout(() => {
  verificarPagina();
  
  setTimeout(() => {
    testarCarregamentoImagem();
    
    setTimeout(() => {
      verificarLogoMulticaixa();
      verificarUsoLogo();
      
      // Se não estamos na página de checkout, tentar navegar
      if (!window.location.pathname.includes('checkout')) {
        setTimeout(() => {
          navegarParaCheckout();
        }, 1000);
      }
    }, 1000);
  }, 1000);
}, 2000);

console.log('📝 Testes iniciados. Verifique o console para resultados.'); 