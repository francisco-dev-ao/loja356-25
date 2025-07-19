import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const MULTICAIXA_EXPRESS_API = 'https://gpo-express.angohost.ao';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...requestData } = await req.json()
    
    let apiUrl = '';
    let method = 'GET';
    let body = null;

    if (action === 'create-payment') {
      apiUrl = `${MULTICAIXA_EXPRESS_API}/api/gerar-token`;
      method = 'POST';
      body = JSON.stringify(requestData);
    } else if (action === 'verify-payment') {
      apiUrl = `${MULTICAIXA_EXPRESS_API}/api/servicos/${requestData.servicoId}`;
      method = 'GET';
    } else {
      throw new Error('Ação não suportada');
    }

    console.log(`🔄 Fazendo requisição para: ${apiUrl}`);
    console.log(`🔄 Método: ${method}`);
    if (body) {
      console.log(`🔄 Body: ${body}`);
    }

    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body && { body }),
    });

    console.log(`🔄 Status da resposta: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta da API:', data);
      
      return new Response(
        JSON.stringify({
          success: true,
          ...data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      let errorData;
      try {
        errorData = await response.json();
        console.log('❌ Erro da API:', errorData);
      } catch {
        console.log('❌ Não foi possível ler resposta de erro');
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorData?.error || errorData?.message || `Erro HTTP: ${response.status}`,
          message: 'Erro na comunicação com o serviço Multicaixa Express'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status >= 500 ? 500 : 400,
        }
      )
    }
  } catch (error) {
    console.error('❌ Erro no proxy:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do proxy',
        message: 'Erro na comunicação com o serviço Multicaixa Express'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})