
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

    console.log("Processing payment request:", { reference, amount, token, callbackUrl, cssUrl })

    if (!reference || !amount || !token || !callbackUrl || !cssUrl) {
      console.error("Missing required parameters:", { reference, amount, token, callbackUrl, cssUrl })
      throw new Error("Missing required parameters for EMIS token generation")
    }

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
    
    // Make API request to EMIS with proper error handling
    const response = await fetch(emisApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    })
    
    // Get response text first to help with debugging
    const responseText = await response.text()
    console.log("EMIS API raw response:", responseText)
    
    if (!response.ok) {
      throw new Error(`EMIS API responded with status: ${response.status}, body: ${responseText}`)
    }
    
    // Try to parse JSON response
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing EMIS API response:", e)
      throw new Error(`Invalid JSON response from EMIS API: ${responseText}`)
    }
    
    console.log("EMIS API parsed response:", responseData)

    if (!responseData.id) {
      throw new Error(`EMIS API response missing token ID: ${JSON.stringify(responseData)}`)
    }

    // Return the EMIS response
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in edge function:", error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Error processing EMIS token request. Please check the edge function logs."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
