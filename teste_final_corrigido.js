// Teste Final Corrigido - Verificar se o erro foi resolvido
// Execute este script no console do navegador

console.log('🔧 Teste Final - Verificando se o erro foi corrigido');

// Verificar se o serviço existe
if (typeof window.multicaixaExpressService !== 'undefined') {
  console.log('✅ Serviço Multicaixa Express encontrado');
  
  // Verificar se o método correto existe
  if (typeof window.multicaixaExpressService.generateToken === 'function') {
    console.log('✅ Método generateToken encontrado');
    
    // Teste simples
    console.log('\n🧪 Testando geração de token...');
    window.multicaixaExpressService.generateToken('TEST-ORDER', 100)
      .then(response => {
        console.log('📥 Resposta:', response);
        if (response.success) {
          console.log('🎉 SUCESSO! Método funcionando corretamente');
        } else {
          console.log('❌ Erro na resposta:', response.error);
        }
      })
      .catch(error => {
        console.error('❌ Erro no teste:', error);
      });
      
  } else {
    console.log('❌ Método generateToken não encontrado');
    console.log('🔍 Métodos disponíveis:', Object.getOwnPropertyNames(window.multicaixaExpressService));
  }
} else {
  console.log('❌ Serviço Multicaixa Express não encontrado');
  console.log('🔧 Verifique se o componente está carregado');
}

console.log('📝 Teste final concluído. Verifique os logs acima.'); 