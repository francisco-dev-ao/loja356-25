import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the request body
    const requestBody = await req.json()
    
    console.log('🔄 Proxy EMIS - Dados recebidos:', requestBody)

    // Validate required fields
    if (!requestBody.reference || !requestBody.amount || !requestBody.token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: reference, amount, token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Make request to EMIS API
    const emisResponse = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📡 EMIS Response Status:', emisResponse.status)

    if (emisResponse.ok) {
      const responseData = await emisResponse.json()
      console.log('✅ EMIS Response Success:', responseData)
      
      return new Response(
        JSON.stringify(responseData),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      const errorText = await emisResponse.text()
      console.error('❌ EMIS API Error:', emisResponse.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `EMIS API Error: ${emisResponse.status}`,
          details: errorText 
        }),
        { 
          status: emisResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Proxy Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 