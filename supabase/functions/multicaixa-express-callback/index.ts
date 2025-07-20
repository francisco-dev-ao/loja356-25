import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request data
    const rawData = await req.text()
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    console.log('🔄 Callback Multicaixa Express recebido:', {
      rawData,
      ipAddress,
      headers: Object.fromEntries(req.headers.entries())
    })

    // Parse the callback data
    let callbackData: any = {}
    try {
      // Try to parse as JSON first
      callbackData = JSON.parse(rawData)
    } catch {
      // If not JSON, try to parse as form data
      const formData = new URLSearchParams(rawData)
      callbackData = Object.fromEntries(formData.entries())
    }

    // Extract payment information
    const paymentReference = callbackData.reference || callbackData.referenceNumber || callbackData.id
    const amount = parseFloat(callbackData.amount || callbackData.value || '0')
    const status = callbackData.status || callbackData.paymentStatus || 'unknown'

    console.log('📊 Dados extraídos:', {
      paymentReference,
      amount,
      status,
      callbackData
    })

    // Save callback to database
    const { data: callbackRecord, error: callbackError } = await supabase
      .from('multicaixa_express_callbacks')
      .insert({
        raw_data: rawData,
        payment_reference: paymentReference,
        amount: amount,
        status: status,
        ip_address: ipAddress,
        processed_successfully: false
      })
      .select()
      .single()

    if (callbackError) {
      console.error('❌ Erro ao salvar callback:', callbackError)
      throw new Error(`Erro ao salvar callback: ${callbackError.message}`)
    }

    console.log('✅ Callback salvo:', callbackRecord)

    // Find payment by reference
    if (paymentReference) {
      const { data: payment, error: paymentError } = await supabase
        .from('multicaixa_express_payments')
        .select('*')
        .eq('reference', paymentReference)
        .single()

      if (paymentError) {
        console.error('❌ Erro ao buscar pagamento:', paymentError)
        // Continue processing even if payment not found
      } else if (payment) {
        console.log('💰 Pagamento encontrado:', payment)

        // Update payment status based on callback
        let newStatus: 'pending' | 'completed' | 'failed' = 'pending'
        
        if (status === 'ACCEPTED' || status === 'SUCCESS' || status === 'COMPLETED') {
          newStatus = 'completed'
        } else if (status === 'REJECTED' || status === 'FAILED' || status === 'CANCELLED') {
          newStatus = 'failed'
        }

        // Update payment status
        const { error: updateError } = await supabase
          .from('multicaixa_express_payments')
          .update({
            status: newStatus,
            emis_response: callbackData,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', payment.id)

        if (updateError) {
          console.error('❌ Erro ao atualizar pagamento:', updateError)
        } else {
          console.log('✅ Status do pagamento atualizado:', newStatus)
        }

        // Update order status if payment is completed
        if (newStatus === 'completed') {
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.order_id)

          if (orderUpdateError) {
            console.error('❌ Erro ao atualizar pedido:', orderUpdateError)
          } else {
            console.log('✅ Pedido marcado como pago:', payment.order_id)
          }

          // Send confirmation email
          try {
            const { data: orderData } = await supabase
              .from('orders')
              .select(`
                *,
                profiles (email, name)
              `)
              .eq('id', payment.order_id)
              .single()

            if (orderData?.profiles?.email) {
              const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <title>Pagamento Confirmado</title>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
                    .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>✅ Pagamento Confirmado!</h1>
                    </div>
                    <div class="content">
                      <h2>Olá ${orderData.profiles.name || 'Cliente'},</h2>
                      <p>Seu pagamento foi processado com sucesso!</p>
                      <p><strong>Referência:</strong> ${paymentReference}</p>
                      <p><strong>Valor:</strong> ${amount.toLocaleString('pt-AO')} AOA</p>
                      <p><strong>Data:</strong> ${new Date().toLocaleString('pt-AO')}</p>
                      <p>Obrigado pela sua compra!</p>
                    </div>
                    <div class="footer">
                      <p>Este é um email automático, não responda.</p>
                    </div>
                  </div>
                </body>
                </html>
              `

              const emailResponse = await fetch('https://mail3.angohost.ao/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: orderData.profiles.email,
                  subject: 'Pagamento Confirmado - Multicaixa Express',
                  html: emailHtml
                })
              })

              if (emailResponse.ok) {
                console.log('✅ Email de confirmação enviado')
              } else {
                console.error('❌ Erro ao enviar email:', await emailResponse.text())
              }
            }
          } catch (emailError) {
            console.error('❌ Erro ao enviar email de confirmação:', emailError)
          }
        }

        // Mark callback as processed
        await supabase
          .from('multicaixa_express_callbacks')
          .update({ processed_successfully: true })
          .eq('id', callbackRecord.id)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Callback processado com sucesso',
        paymentReference,
        status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro no callback:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 