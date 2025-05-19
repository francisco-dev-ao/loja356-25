
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'
import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from generate-emis-token edge function!")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const requestData = await req.json()
    const { reference, amount, token, callbackUrl, cssUrl } = requestData

    console.log("Processing payment request:", { reference, amount, token })

    // EMIS API URL
    const emisApiUrl = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken"

    // Parameters for EMIS payment page
    const params = {
      reference: reference,
      amount: amount,
      token: token,
      mobile: 'PAYMENT',
      card: 'DISABLED',
      qrCode: 'PAYMENT',
      cssUrl: cssUrl,
      callbackUrl: callbackUrl
    }

    console.log("Sending to EMIS API:", params)
    
    // Make API request to EMIS
    const response = await fetch(emisApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    
    if (!response.ok) {
      throw new Error(`EMIS API responded with status: ${response.status}`)
    }
    
    const responseData = await response.json()
    console.log("EMIS API response:", responseData)

    // Return the EMIS response
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in edge function:", error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
