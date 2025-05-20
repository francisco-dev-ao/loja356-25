
/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

import { corsHeaders } from '../_shared/cors.ts' 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("generate-emis-token function initializing...");

function formatEmisReference(orderId: string): string {
  try {
    const alphanumericOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    const randomSuffix = Math.floor(Math.random() * 90) + 10;
    const rawReference = `${alphanumericOrderId}-AH-${randomSuffix}`;
    return rawReference.substring(0, 20);
  } catch (e) {
    console.error("Error formatting EMIS reference for orderId:", orderId, e);
    return orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }
}

// --- Configurações ---
const GPO_FRAME_TOKEN = 'a53787fd-b49e-4469-a6ab-fa6acf19db48'; 
const GPO_CSS_URL = 'https://pagamentonline.emis.co.ao/gpoconfig/qr_code_mobile_v2.css';

serve(async (req: Request) => {
  console.log("generate-emis-token function invoked. Method:", req.method);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request.");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use a fallback if the environment variable is not set
    // @ts-ignore - Deno object is available in Supabase Edge Functions runtime environment
    const GPO_CALLBACK_URL = Deno.env.get('EMIS_CALLBACK_URL') || 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback';
    
    if (!GPO_CALLBACK_URL) {
        console.error("CRITICAL: EMIS_CALLBACK_URL environment variable is not set and no fallback provided.");
        return new Response(JSON.stringify({
          error: "Configuration error: EMIS_CALLBACK_URL is not set.",
          details: "The server is missing a critical configuration for payment processing."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500, 
        });
    }

    console.log("MCX Config: Using FrameToken:", GPO_FRAME_TOKEN ? 'SET' : 'MISSING', 
                "CallbackURL:", GPO_CALLBACK_URL, 
                "CSS_URL:", GPO_CSS_URL);

    let requestData;
    try {
      requestData = await req.json();
      console.log("Received request data:", requestData);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body",
        details: String(parseError)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const { reference: originalReference, amount } = requestData;

    if (!originalReference || typeof originalReference !== 'string' || !amount || typeof amount !== 'number' || amount <= 0) {
      console.error("VALIDATION ERROR: Missing or invalid params. Ref:", originalReference, "Amount:", amount);
      return new Response(JSON.stringify({
        error: "Missing or invalid required parameters (reference: string, amount: positive number).",
        details: `Received reference: ${originalReference}, amount: ${amount}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, 
      });
    }

    const formattedReference = formatEmisReference(originalReference);
    const formattedAmount = amount.toFixed(2);

    console.log(`Formatted Ref: ${formattedReference}, Formatted Amount: ${formattedAmount}`);

    const emisApiUrl = "https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken";
    const params = {
      reference: formattedReference,
      amount: formattedAmount,
      token: GPO_FRAME_TOKEN,
      mobile: 'PAYMENT', 
      card: 'DISABLED', 
      qrCode: 'PAYMENT',
      cssUrl: GPO_CSS_URL,
      callbackUrl: GPO_CALLBACK_URL
    };

    console.log("EMIS API Request: URL:", emisApiUrl, "Payload:", JSON.stringify(params));

    let emisResponse;
    try {
      emisResponse = await fetch(emisApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });
    } catch (fetchError) {
      console.error("Network error when calling EMIS API:", fetchError);
      return new Response(JSON.stringify({
        error: "Network error when connecting to EMIS API",
        details: String(fetchError)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502
      });
    }

    let responseText;
    try {
      responseText = await emisResponse.text();
      console.log(`EMIS API Response: Status: ${emisResponse.status}, Raw Body: ${responseText}`);
    } catch (textError) {
      console.error("Error reading EMIS API response body:", textError);
      return new Response(JSON.stringify({
        error: "Error reading EMIS API response",
        details: String(textError)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502
      });
    }

    if (!emisResponse.ok) {
      console.error(`EMIS API ERROR: Status ${emisResponse.status}. Body: ${responseText}`);
      return new Response(JSON.stringify({
        error: "EMIS API request failed.",
        details: `EMIS API responded with status: ${emisResponse.status}. Response: ${responseText}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: emisResponse.status, 
      });
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("EMIS API PARSE ERROR: Invalid JSON. Raw:", responseText, "Error:", e);
      return new Response(JSON.stringify({
        error: "Invalid JSON response from EMIS API.",
        details: `Content: ${responseText}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502, 
      });
    }

    console.log("EMIS API Parsed Response:", responseData);

    if (!responseData || typeof responseData.id !== 'string' || !responseData.id.trim()) {
      console.error("EMIS API LOGIC ERROR: Missing/invalid token ID. Resp:", responseData);
      return new Response(JSON.stringify({
        error: "EMIS API response missing or invalid token ID.",
        details: `Received: ${JSON.stringify(responseData)}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502, 
      });
    }

    console.log("Successfully obtained EMIS token ID:", responseData.id);
    return new Response(JSON.stringify({ id: responseData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("GLOBAL ERROR in generate-emis-token:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof Error && error.stack) {
      console.error("Error Stack Trace:", error.stack);
    }
    return new Response(JSON.stringify({
      error: "Internal Server Error while processing EMIS token request.",
      details: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
