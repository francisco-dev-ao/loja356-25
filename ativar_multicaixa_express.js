// Script para ativar o método de pagamento Multicaixa Express
// Execute este script no console do navegador ou como Node.js

const SUPABASE_URL = "https://royvktipnkfnpdhytakw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXZrdGlwbmtmbnBkaHl0YWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODcyMjcsImV4cCI6MjA2MzA2MzIyN30.HvkiehFF3jxCLlc5sJR3P3MCX5alavaIpUtnCdiRrv0";

// Função para criar cliente Supabase
function createSupabaseClient() {
    return {
        from: (table) => ({
            select: (columns) => ({
                eq: (column, value) => ({
                    single: async () => {
                        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        return response.json();
                    }
                }),
                insert: async (data) => {
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    return response.json();
                },
                update: async (data) => ({
                    eq: (column, value) => ({
                        select: async (columns) => {
                            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
                                method: 'PATCH',
                                headers: {
                                    'apikey': SUPABASE_ANON_KEY,
                                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            });
                            return response.json();
                        }
                    })
                })
            })
        })
    };
}

// Função principal para ativar Multicaixa Express
async function ativarMulticaixaExpress() {
    console.log('🔄 Ativando Multicaixa Express...');
    
    const supabase = createSupabaseClient();
    
    try {
        // 1. Verificar se já existe configuração
        console.log('📋 Verificando configuração existente...');
        
        // 2. Inserir ou atualizar configuração
        const configData = {
            frame_token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
            callback_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback',
            success_url: 'https://angohost.co.ao/pay/successful',
            error_url: 'https://angohost.co.ao/pay/unsuccessful',
            css_url: null,
            commission_rate: 0,
            is_active: true
        };
        
        console.log('💾 Salvando configuração...');
        const result = await supabase.from('multicaixa_express_config').select('*').insert(configData);
        
        if (result.error) {
            console.error('❌ Erro ao salvar configuração:', result.error);
            return false;
        }
        
        console.log('✅ Configuração salva com sucesso!');
        
        // 3. Verificar se o método de pagamento existe
        console.log('💳 Verificando método de pagamento...');
        const paymentMethodData = {
            name: 'Multicaixa Express',
            description: 'Pagamento via Multicaixa Express Online',
            is_active: true
        };
        
        const paymentResult = await supabase.from('payment_methods').select('*').insert(paymentMethodData);
        
        if (paymentResult.error) {
            console.log('⚠️ Método de pagamento já existe ou erro:', paymentResult.error);
        } else {
            console.log('✅ Método de pagamento criado!');
        }
        
        // 4. Verificar status final
        console.log('🔍 Verificando status final...');
        const statusCheck = await supabase.from('multicaixa_express_config').select('*').eq('is_active', true).single();
        
        if (statusCheck.data) {
            console.log('🎉 Multicaixa Express ATIVADO com sucesso!');
            console.log('📊 Configuração:', statusCheck.data);
            return true;
        } else {
            console.log('❌ Falha na ativação');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro durante ativação:', error);
        return false;
    }
}

// Função para verificar status
async function verificarStatus() {
    console.log('🔍 Verificando status do Multicaixa Express...');
    
    const supabase = createSupabaseClient();
    
    try {
        const result = await supabase.from('multicaixa_express_config').select('*').eq('is_active', true).single();
        
        if (result.data) {
            console.log('✅ Multicaixa Express está ATIVO');
            console.log('📊 Configuração:', result.data);
            return true;
        } else {
            console.log('❌ Multicaixa Express está INATIVO');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro ao verificar status:', error);
        return false;
    }
}

// Função para testar conexão
async function testarConexao() {
    console.log('🧪 Testando conexão com EMIS...');
    
    try {
        const testData = {
            reference: 'TEST-' + Date.now(),
            amount: 100,
            token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
            mobile: 'PAYMENT',
            card: 'DISABLED',
            qrCode: 'PAYMENT',
            callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
        };
        
        const response = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexão com EMIS bem-sucedida!');
            console.log('📊 Resposta:', data);
            return true;
        } else {
            console.log('❌ Erro na conexão com EMIS:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao testar conexão:', error);
        return false;
    }
}

// Executar ativação
console.log('🚀 Iniciando ativação do Multicaixa Express...');
console.log('='.repeat(50));

// Verificar status atual
verificarStatus().then(isActive => {
    if (!isActive) {
        // Ativar se não estiver ativo
        ativarMulticaixaExpress().then(success => {
            if (success) {
                console.log('='.repeat(50));
                console.log('🎉 ATIVAÇÃO CONCLUÍDA COM SUCESSO!');
                console.log('='.repeat(50));
                
                // Testar conexão
                setTimeout(() => {
                    testarConexao();
                }, 1000);
            }
        });
    } else {
        console.log('✅ Multicaixa Express já está ativo!');
        testarConexao();
    }
});

// Exportar funções para uso no console
window.ativarMulticaixaExpress = ativarMulticaixaExpress;
window.verificarStatus = verificarStatus;
window.testarConexao = testarConexao;

console.log('📝 Funções disponíveis:');
console.log('- ativarMulticaixaExpress()');
console.log('- verificarStatus()');
console.log('- testarConexao()'); 