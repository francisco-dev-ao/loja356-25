/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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
    // @ts-ignore - Deno object is available in Supabase Edge Functions runtime environment
    const GPO_CALLBACK_URL = Deno.env.get('EMIS_CALLBACK_URL');
    if (!GPO_CALLBACK_URL) {
        console.error("CRITICAL: EMIS_CALLBACK_URL environment variable is not set.");
        return new Response(JSON.stringify({
          error: "Configuration error: EMIS_CALLBACK_URL is not set.",
          details: "The server is missing a critical configuration for payment processing."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500, 
        });
    }

    console.log("MCX Config: Using FrameToken:", GPO_FRAME_TOKEN ? '******' : 'MISSING', "CallbackURL:", GPO_CALLBACK_URL, "CSS_URL:", GPO_CSS_URL);

    const requestData = await req.json();
    console.log("Received request data:", requestData);
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
      mobile: 'PAYMENT', // Alterado de AUTHORIZATION para PAYMENT
      card: 'DISABLED', // Alterado de AUTHORIZATION para DISABLED
      qrCode: 'PAYMENT',
      cssUrl: GPO_CSS_URL,
      callbackUrl: GPO_CALLBACK_URL
    };

    console.log("EMIS API Request: URL:", emisApiUrl, "Payload:", JSON.stringify(params));

    const emisResponse = await fetch(emisApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const responseText = await emisResponse.text();
    console.log(`EMIS API Response: Status: ${emisResponse.status}, Raw Body: ${responseText}`);

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

<MulticaixaExpressPayment
  amount={orderAmount}
  reference={orderId}
  onPaymentSuccess={(paymentRef) => {
    console.log("Pagamento bem-sucedido:", paymentRef);
    // Lógica de sucesso
  }}
  onPaymentError={(errorMessage) => {
    console.error("Erro no pagamento:", errorMessage);
    // Lógica de erro
  }}
/>
