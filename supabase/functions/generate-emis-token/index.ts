
/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface EmisTokenRequest {
  reference: string
  amount: number
  token: string
  mobile: string
  card: string
  qrCode: string
  callbackUrl: string
}

interface EmisTokenResponse {
  success: boolean
  data?: any
  error?: string
}

serve(async (req) => {
  console.log('🚀 Edge Function generate-emis-token iniciada')
  console.log('📋 Método:', req.method)
  console.log('🔗 URL:', req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo a preflight CORS')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Method not allowed. Use POST.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    let body: EmisTokenRequest
    try {
      const rawBody = await req.text()
      console.log('📥 Body recebido:', rawBody)
      
      body = JSON.parse(rawBody)
      console.log('📋 Body parseado:', body)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do body:', parseError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Validate required fields
    console.log('🔍 Validando campos obrigatórios...')
    console.log('📋 Reference:', body.reference)
    console.log('📋 Amount:', body.amount)
    console.log('📋 Token:', body.token)
    
    if (!body.reference) {
      console.log('❌ Campo reference está faltando')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required field: reference' 
        }),
        { 
        status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
      console.log('❌ Campo amount inválido:', body.amount)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid field: amount (must be a positive number)' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!body.token) {
      console.log('❌ Campo token está faltando')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required field: token' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Validação passou')

    // Prepare EMIS API request
    const emisRequestData = {
      reference: body.reference,
      amount: body.amount,
      token: body.token,
      mobile: body.mobile || 'PAYMENT',
      card: body.card || 'DISABLED',
      qrCode: body.qrCode || 'PAYMENT',
      callbackUrl: body.callbackUrl || 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
    }

    console.log('🔄 Preparando dados para EMIS API:', emisRequestData)

    // Call EMIS API
    console.log('📡 Chamando API da EMIS...')
    const emisResponse = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(emisRequestData)
    })

    console.log('📡 Resposta da EMIS API - Status:', emisResponse.status)

    if (!emisResponse.ok) {
      const errorText = await emisResponse.text()
      console.error('❌ EMIS API Error:', emisResponse.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `EMIS API Error: ${emisResponse.status} - ${errorText}` 
        }),
        { 
        status: emisResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emisData = await emisResponse.json()
    console.log('✅ Token EMIS gerado com sucesso:', emisData)

    // Return success response
    const successResponse = {
      success: true, 
      data: emisData 
    }
    
    console.log('📤 Enviando resposta de sucesso:', successResponse)
    
    return new Response(
      JSON.stringify(successResponse),
      { 
      status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error generating EMIS token:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
