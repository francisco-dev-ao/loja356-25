
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request data
    const requestData = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '';
    
    console.log('Received payment callback:', JSON.stringify(requestData));
    
    // Save the callback data regardless of content
    const { data: callbackData, error: callbackError } = await supabase
      .from('multicaixa_express_callbacks')
      .insert({
        payment_reference: requestData.reference?.id,
        status: requestData.status,
        amount: requestData.amount,
        raw_data: requestData,
        ip_address: clientIP
      })
      .select()
      .single();
    
    if (callbackError) {
      console.error('Error saving callback:', callbackError);
      return new Response(JSON.stringify({ status: 'error', message: 'Error saving callback' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Process payment if status is ACCEPTED
    if (requestData.status === 'ACCEPTED' && requestData.reference && requestData.reference.id) {
      // Extract order ID from reference (format: orderId-AH-uniqueString)
      const orderIdParts = requestData.reference.id.split('-');
      const orderId = orderIdParts[0];
      
      if (!orderId) {
        console.error('Invalid order ID from reference:', requestData.reference.id);
        return new Response(JSON.stringify({ status: 'error', message: 'Invalid reference format' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Get order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total, payment_status')
        .eq('id', orderId)
        .single();
      
      if (orderError || !orderData) {
        console.error('Order not found:', orderId, orderError);
        return new Response(JSON.stringify({ status: 'error', message: 'Order not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Verify amount
      if (parseFloat(requestData.amount) >= parseFloat(orderData.total.toString())) {
        // Update payment transaction
        const { error: paymentUpdateError } = await supabase
          .from('multicaixa_express_payments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            emis_response: requestData
          })
          .eq('reference', requestData.reference.id);
        
        if (paymentUpdateError) {
          console.error('Error updating payment:', paymentUpdateError);
        }
        
        // Update order status
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        
        if (orderUpdateError) {
          console.error('Error updating order:', orderUpdateError);
        }
        
        // Mark callback as processed
        await supabase
          .from('multicaixa_express_callbacks')
          .update({ processed_successfully: true })
          .eq('id', callbackData.id);
        
        return new Response(JSON.stringify({ status: 'success', message: 'Payment processed successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } else {
        console.error('Amount mismatch:', requestData.amount, orderData.total);
        return new Response(JSON.stringify({ status: 'error', message: 'Amount mismatch' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }
    
    // For any other status, just acknowledge receipt
    return new Response(JSON.stringify({ status: 'success', message: 'Callback received' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error processing callback:', error);
    return new Response(JSON.stringify({ status: 'error', message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
