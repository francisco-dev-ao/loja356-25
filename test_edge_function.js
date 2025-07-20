// Script para testar a Edge Function generate-emis-token
// Execute este script no console do navegador

const SUPABASE_URL = "https://royvktipnkfnpdhytakw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXZrdGlwbmtmbnBkaHl0YWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODcyMjcsImV4cCI6MjA2MzA2MzIyN30.HvkiehFF3jxCLlc5sJR3P3MCX5alavaIpUtnCdiRrv0";

async function testEdgeFunction() {
    console.log('🧪 Testando Edge Function generate-emis-token...');
    
    const testData = {
        reference: 'TEST-' + Date.now(),
        amount: 100,
        token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
        mobile: 'PAYMENT',
        card: 'DISABLED',
        qrCode: 'PAYMENT',
        callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    };

    console.log('📤 Dados enviados:', testData);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-emis-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log('📡 Status da resposta:', response.status);
        console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

        const result = await response.text();
        console.log('📥 Resposta bruta:', result);

        try {
            const parsedResult = JSON.parse(result);
            console.log('📋 Resposta parseada:', parsedResult);
            
            if (response.ok && parsedResult.success) {
                console.log('✅ Edge Function funcionando!');
                console.log('🎯 Token gerado:', parsedResult.data);
            } else {
                console.log('❌ Edge Function retornou erro:', parsedResult.error);
            }
        } catch (parseError) {
            console.log('❌ Erro ao fazer parse da resposta:', parseError);
        }

    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
}

// Teste com dados mínimos
async function testMinimalData() {
    console.log('🧪 Testando com dados mínimos...');
    
    const minimalData = {
        reference: 'TEST-MIN',
        amount: 50,
        token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48'
    };

    console.log('📤 Dados mínimos:', minimalData);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-emis-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(minimalData)
        });

        console.log('📡 Status:', response.status);
        const result = await response.text();
        console.log('📥 Resposta:', result);

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Teste com dados inválidos
async function testInvalidData() {
    console.log('🧪 Testando com dados inválidos...');
    
    const invalidData = {
        reference: '', // vazio
        amount: -10,   // negativo
        token: ''      // vazio
    };

    console.log('📤 Dados inválidos:', invalidData);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-emis-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invalidData)
        });

        console.log('📡 Status:', response.status);
        const result = await response.text();
        console.log('📥 Resposta:', result);

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Executar todos os testes
console.log('🚀 Iniciando testes da Edge Function...');
console.log('='.repeat(50));

// Teste 1: Dados completos
testEdgeFunction().then(() => {
    console.log('='.repeat(50));
    
    // Teste 2: Dados mínimos
    return testMinimalData();
}).then(() => {
    console.log('='.repeat(50));
    
    // Teste 3: Dados inválidos
    return testInvalidData();
}).then(() => {
    console.log('='.repeat(50));
    console.log('✅ Todos os testes concluídos!');
});

// Exportar funções para uso manual
window.testEdgeFunction = testEdgeFunction;
window.testMinimalData = testMinimalData;
window.testInvalidData = testInvalidData; 