/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

console.log("payment-callback function initializing...");

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  console.log("payment-callback function invoked. Method:", req.method);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request for payment-callback.");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received payment callback payload:", JSON.stringify(payload, null, 2));

    // Extrair dados do callback da EMIS
    const transactionId = payload.transactionId || payload.transaction_id || payload.id;
    const paymentStatus = payload.status || payload.transaction_status || payload.payment_status;
    const orderReference = payload.reference || payload.order_reference || payload.merchRef || payload.order_id;
    const amountPaid = payload.amount || payload.amount_paid;
    const paymentMethod = payload.payment_method || 'multicaixa_express';

    console.log(`Processing callback for Order Ref: ${orderReference}, Transaction ID: ${transactionId}, Status: ${paymentStatus}, Amount: ${amountPaid}`);

    // Determinar se o pagamento foi bem-sucedido
    let isSuccess = false;
    if (typeof paymentStatus === 'string') {
        // Status de sucesso da EMIS (ajuste conforme documentação)
        const successStatuses = [
            "SUCCESS", "00", "AUTHORIZATION", "PAYMENT_SUCCESSFUL", 
            "COMPLETED", "APPROVED", "PAID", "SUCCESSFUL"
        ];
        isSuccess = successStatuses.some(status => 
            paymentStatus.toUpperCase() === status
        );
    } else if (typeof paymentStatus === 'number') {
        // Códigos numéricos de sucesso (ajuste conforme documentação)
        const successCodes = [0, 200, 201];
        isSuccess = successCodes.includes(paymentStatus);
    }

    // Salvar callback no banco de dados
    try {
      const { data: callbackData, error: callbackError } = await supabaseClient
        .from('multicaixa_express_callbacks')
        .insert({
          raw_data: JSON.stringify(payload),
          payment_reference: orderReference,
          amount: amountPaid,
          status: paymentStatus,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          processed_successfully: true
        })
        .select()
        .single();

      if (callbackError) {
        console.error('Error saving callback:', callbackError);
      } else {
        console.log('Callback saved successfully:', callbackData);
      }
    } catch (callbackError) {
      console.error('Error saving callback:', callbackError);
    }

    if (isSuccess) {
      console.log(`Payment successful for order ${orderReference}. Transaction ID: ${transactionId}.`);
      
      try {
        // Atualizar status do pagamento Multicaixa Express
        const { data: paymentData, error: paymentError } = await supabaseClient
          .from('multicaixa_express_payments')
          .update({ 
            status: 'completed',
            emis_response: payload,
            completed_at: new Date().toISOString()
          })
          .eq('reference', orderReference)
          .eq('status', 'pending')
          .select()
          .single();

        if (paymentError) {
          console.error(`Payment update failed for reference ${orderReference}:`, paymentError);
        } else {
          console.log(`Payment ${orderReference} updated successfully.`, paymentData);
        }

        // Buscar pedido pelo payment_reference
        const { data: orderData } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('payment_reference', orderReference)
          .single();

        if (orderData) {
          // Atualizar pedido
          await supabaseClient.from('orders').update({
            payment_status: 'paid',
            status: 'completed',
            updated_at: new Date().toISOString()
          }).eq('id', orderData.id);

          // Atualizar fatura vinculada
          await supabaseClient.from('invoices').update({
            status: 'paid',
            updated_at: new Date().toISOString()
          }).eq('order_id', orderData.id);
        }

      } catch (dbError) {
        console.error(`Error during database operations for order ${orderReference}:`, dbError);
      }

    } else {
      console.warn(`Payment failed for order ${orderReference}. Status: ${paymentStatus}, Transaction ID: ${transactionId}.`);
      
      try {
        // Atualizar status do pagamento para falhado
        const { data: paymentData, error: paymentError } = await supabaseClient
          .from('multicaixa_express_payments')
          .update({ 
            status: 'failed',
            emis_response: payload,
            completed_at: new Date().toISOString()
          })
          .eq('reference', orderReference)
          .eq('status', 'pending')
          .select()
          .single();

        if (paymentError) {
          console.error(`Payment update failed for reference ${orderReference}:`, paymentError);
        } else {
          console.log(`Payment ${orderReference} marked as failed.`, paymentData);
        }

        // Atualizar status do pedido para falhado
        const { data: orderData, error: orderError } = await supabaseClient
          .from('orders')
          .update({ 
            payment_status: 'payment_failed',
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderReference)
          .eq('payment_status', 'pending_payment')
          .select()
          .single();

        if (orderError) {
          console.error(`Order update failed for ${orderReference}:`, orderError);
        } else {
          console.log(`Order ${orderReference} marked as failed.`, orderData);
        }

      } catch (dbError) {
        console.error(`Error during database operations for failed payment on order ${orderReference}:`, dbError);
      }
    }

    // Retornar resposta de sucesso para a EMIS
    return new Response(JSON.stringify({ 
      received: true, 
      message: "Callback processed successfully.",
      orderReference,
      status: isSuccess ? 'success' : 'failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("GLOBAL ERROR in payment-callback function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof Error && error.stack) {
      console.error("Error Stack Trace:", error.stack);
    }
    
    return new Response(JSON.stringify({
      received: true,
      error: "Error processing callback.",
      details: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
