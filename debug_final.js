// Debug Final - Identificar problema específico
// Execute este script no console do navegador

console.log('🔍 Debug Final - Identificando problema específico');

// Teste 1: Verificar se o problema é com o formato da referência
async function testReferenceFormat() {
  console.log('🧪 Teste 1: Formatos de referência');
  console.log('='.repeat(50));

  const formats = [
    'TEST001',
    'TEST-001',
    'TEST_001',
    'TEST001234567890',
    'ORDER-001',
    'PAYMENT-001',
    'MCX-001',
    'REF-001'
  ];

  for (let i = 0; i < formats.length; i++) {
    const reference = formats[i];
    console.log(`\n📤 Teste ${i + 1}: "${reference}"`);

    const testData = {
      reference,
      amount: 100,
      token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
      mobile: 'PAYMENT',
      card: 'DISABLED',
      qrCode: 'PAYMENT',
      callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    };

    try {
      const response = await fetch('/emis-api/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log(`📡 Status: ${response.status}`);
      const result = await response.text();
      console.log(`📥 Resposta: ${result}`);

      if (response.ok) {
        console.log('✅ SUCESSO! Formato válido encontrado');
        return { success: true, reference, response: result };
      } else if (result.includes('reference is required')) {
        console.log('❌ Ainda "reference is required"');
      } else {
        console.log('❌ Outro erro');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }

  return { success: false };
}

// Teste 2: Verificar se o problema é com a estrutura dos dados
async function testDataStructure() {
  console.log('🧪 Teste 2: Estrutura dos dados');
  console.log('='.repeat(50));

  const structures = [
    // Estrutura mínima
    {
      reference: 'TEST001',
      amount: 100,
      token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
      mobile: 'PAYMENT',
      card: 'DISABLED',
      qrCode: 'PAYMENT',
      callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    },
    
    // Sem cssUrl
    {
      reference: 'TEST002',
      amount: 100,
      token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
      mobile: 'PAYMENT',
      card: 'DISABLED',
      qrCode: 'PAYMENT',
      callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    },
    
    // Valores diferentes
    {
      reference: 'TEST003',
      amount: 100,
      token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
      mobile: 'ENABLED',
      card: 'ENABLED',
      qrCode: 'ENABLED',
      callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    }
  ];

  for (let i = 0; i < structures.length; i++) {
    const structure = structures[i];
    console.log(`\n📤 Teste ${i + 1}: Estrutura ${i + 1}`);
    console.log('Dados:', structure);

    try {
      const response = await fetch('/emis-api/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(structure)
      });

      console.log(`📡 Status: ${response.status}`);
      const result = await response.text();
      console.log(`📥 Resposta: ${result}`);

      if (response.ok) {
        console.log('✅ SUCESSO! Estrutura válida encontrada');
        return { success: true, structure, response: result };
      } else if (result.includes('reference is required')) {
        console.log('❌ Ainda "reference is required"');
      } else {
        console.log('❌ Outro erro');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }

  return { success: false };
}

// Teste 3: Verificar se o problema é com o proxy
async function testProxy() {
  console.log('🧪 Teste 3: Proxy do Vite');
  console.log('='.repeat(50));

  const testData = {
    reference: 'PROXY-TEST',
    amount: 100,
    token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
    mobile: 'PAYMENT',
    card: 'DISABLED',
    qrCode: 'PAYMENT',
    callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
  };

  // Teste via proxy
  console.log('📤 Teste via proxy (/emis-api/...)');
  try {
    const response1 = await fetch('/emis-api/online-payment-gateway/portal/frameToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Status: ${response1.status}`);
    const result1 = await response1.text();
    console.log(`📥 Resposta: ${result1}`);

    if (response1.ok) {
      console.log('✅ Proxy funcionando');
      return { success: true, proxy: true, response: result1 };
    } else {
      console.log('❌ Proxy com problema');
    }
  } catch (error) {
    console.error('❌ Erro no proxy:', error);
  }

  // Teste direto (pode falhar por CORS)
  console.log('\n📤 Teste direto (pode falhar por CORS)');
  try {
    const response2 = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Status: ${response2.status}`);
    const result2 = await response2.text();
    console.log(`📥 Resposta: ${result2}`);

    if (response2.ok) {
      console.log('✅ API direta funcionando (problema é proxy)');
      return { success: true, proxy: false, response: result2 };
    } else {
      console.log('❌ API direta também com problema');
    }
  } catch (error) {
    console.error('❌ Erro direto (esperado por CORS):', error);
  }

  return { success: false };
}

// Teste 4: Verificar se o problema é com o token
async function testToken() {
  console.log('🧪 Teste 4: Validação do token');
  console.log('='.repeat(50));

  const tokens = [
    'a53787fd-b49e-4469-a6ab-fa6acf19db48', // Token atual
    'test-token-123',
    'demo-token-456',
    'frame-token-789'
  ];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    console.log(`\n📤 Teste ${i + 1}: Token = "${token}"`);

    const testData = {
      reference: `TOKEN-TEST-${i + 1}`,
      amount: 100,
      token,
      mobile: 'PAYMENT',
      card: 'DISABLED',
      qrCode: 'PAYMENT',
      callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    };

    try {
      const response = await fetch('/emis-api/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log(`📡 Status: ${response.status}`);
      const result = await response.text();
      console.log(`📥 Resposta: ${result}`);

      if (response.ok) {
        console.log('✅ TOKEN VÁLIDO!');
        return { success: true, token, response: result };
      } else if (result.includes('Invalid token')) {
        console.log('❌ Token inválido');
      } else if (result.includes('reference is required')) {
        console.log('❌ Ainda "reference is required"');
      } else {
        console.log('❌ Outro erro');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }

  return { success: false };
}

// Função principal
async function debugFinal() {
  console.log('🚀 Debug Final - Identificando problema específico');
  console.log('='.repeat(80));

  // Teste 1: Formato da referência
  const result1 = await testReferenceFormat();
  console.log('\n' + '='.repeat(80));

  if (result1.success) {
    console.log('🎉 PROBLEMA RESOLVIDO! Formato de referência correto encontrado');
    return;
  }

  // Teste 2: Estrutura dos dados
  const result2 = await testDataStructure();
  console.log('\n' + '='.repeat(80));

  if (result2.success) {
    console.log('🎉 PROBLEMA RESOLVIDO! Estrutura de dados correta encontrada');
    return;
  }

  // Teste 3: Proxy
  const result3 = await testProxy();
  console.log('\n' + '='.repeat(80));

  if (result3.success) {
    if (result3.proxy) {
      console.log('🎉 PROBLEMA RESOLVIDO! Proxy funcionando');
    } else {
      console.log('🔧 Problema é com o proxy do Vite');
    }
    return;
  }

  // Teste 4: Token
  const result4 = await testToken();
  console.log('\n' + '='.repeat(80));

  if (result4.success) {
    console.log('🎉 PROBLEMA RESOLVIDO! Token válido encontrado');
    return;
  }

  // Resumo final
  console.log('📊 RESUMO FINAL:');
  console.log('='.repeat(60));
  console.log('❌ Nenhum teste passou');
  console.log('🔧 Problema pode ser:');
  console.log('- Configuração da API da EMIS');
  '- Token inválido ou expirado');
  console.log('- Formato de dados não aceito');
  console.log('- Problema no proxy do Vite');
}

// Executar debug
debugFinal();

// Exportar funções
window.debugFinal = debugFinal;
window.testReferenceFormat = testReferenceFormat;
window.testDataStructure = testDataStructure;
window.testProxy = testProxy;
window.testToken = testToken;

console.log('📝 Funções disponíveis:');
console.log('- debugFinal() - Debug completo');
console.log('- testReferenceFormat() - Testar formatos de referência');
console.log('- testDataStructure() - Testar estruturas de dados');
console.log('- testProxy() - Testar proxy');
console.log('- testToken() - Testar tokens'); 