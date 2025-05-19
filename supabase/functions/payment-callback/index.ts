/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("payment-callback function initializing...");

serve(async (req: Request) => {
  console.log("payment-callback function invoked. Method:", req.method);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request for payment-callback.");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received payment callback payload:", JSON.stringify(payload, null, 2));

    // TODO: Implement EMIS callback validation logic here
    // 1. Verify the source of the request (e.g., check for a secret header or IP if EMIS provides one)
    // 2. Validate the payload structure and required fields (transactionId, status, reference, amount, etc.)
    
    // Exemplo de campos esperados (ajuste conforme a documentação da EMIS):
    const transactionId = payload.transactionId || payload.transaction_id;
    const paymentStatus = payload.status || payload.transaction_status;
    const orderReference = payload.reference || payload.order_reference || payload.merchRef; // merchRef é comum
    const amountPaid = payload.amount; // Pode vir como string ou número

    console.log(`Processing callback for Order Ref: ${orderReference}, Transaction ID: ${transactionId}, Status: ${paymentStatus}, Amount: ${amountPaid}`);

    // A EMIS geralmente envia o status como uma string.
    // Verifique a documentação da EMIS para os valores exatos de status.
    // Exemplo: "00" - Sucesso, "05" - Recusado, etc.
    // Para este exemplo, vamos assumir que "AUTHORIZATION" ou "PAYMENT" no campo apropriado indica sucesso,
    // ou um código numérico como "00".
    // É CRUCIAL verificar a documentação da EMIS para os valores corretos.
    
    let isSuccess = false;
    if (typeof paymentStatus === 'string') {
        // Adapte esta lógica com base nos valores reais de status da EMIS
        if (paymentStatus.toUpperCase() === "SUCCESS" || paymentStatus === "00" || paymentStatus.toUpperCase() === "AUTHORIZATION" || paymentStatus.toUpperCase() === "PAYMENT_SUCCESSFUL" || paymentStatus.toUpperCase() === "COMPLETED") {
            isSuccess = true;
        }
    } else if (typeof paymentStatus === 'number') {
        if (paymentStatus === 0) { // Exemplo, pode ser outro número que indique sucesso
            isSuccess = true;
        }
    }

    // Para interagir com o Supabase, você precisaria do cliente.
    // A forma padrão é:
    // import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
    // const supabaseClient = createClient(
    //   Deno.env.get('SUPABASE_URL')!,
    //   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use SERVICE_ROLE_KEY para operações de backend
    // );
    // Se você já tem o supabaseClient disponível no escopo de outra forma, ajuste aqui.
    // Por enquanto, o código abaixo assumirá que supabaseClient será definido.
    // **COMENTÁRIO PARA VOCÊ:** Descomente e ajuste a inicialização do supabaseClient acima se necessário.

    if (isSuccess) {
      console.log(`Payment successful for order ${orderReference}. Transaction ID: ${transactionId}.`);
      
      // **INÍCIO DA LÓGICA DE ATUALIZAÇÃO DO BANCO DE DADOS (ASSUMINDO QUE supabaseClient ESTÁ DEFINIDO)**
      // try {
      //   const { data: orderData, error: orderError } = await supabaseClient
      //     .from('orders') // Certifique-se que 'orders' é o nome correto da sua tabela de pedidos
      //     .update({ 
      //         payment_status: 'paid', // Ou o status que indica pagamento concluído
      //         emis_transaction_id: transactionId, // Armazena o ID da transação da EMIS
      //         payment_provider_payload: payload, // Opcional: armazenar todo o payload para auditoria
      //         updated_at: new Date().toISOString() 
      //     })
      //     .eq('id', orderReference) // Assumindo que 'id' na tabela 'orders' é o orderReference
      //     .eq('payment_status', 'pending_payment') // Idempotência: atualiza apenas se ainda estiver pendente
      //     .select(); // Para retornar os dados atualizados, se necessário

      //   if (orderError) {
      //     console.error(`DB update failed for order ${orderReference}: `, orderError);
      //     // Considerar se deve retornar um erro 500 aqui ou apenas logar
      //   } else {
      //     console.log(\`Order ${orderReference} updated successfully in DB.\`, orderData);
      //     // TODO: Aqui você pode acionar a criação da fatura (invoice)
      //     // Exemplo: await createInvoiceForOrder(supabaseClient, orderReference, companyId, customerId, etc.);
      //   }
      // } catch (dbError) {
      //   console.error(\`Error during database operations for order ${orderReference}: \`, dbError);
      // }
      // **FIM DA LÓGICA DE ATUALIZAÇÃO DO BANCO DE DADOS**

      // Placeholder para lógica de criação de fatura (deve ser implementada)
      console.log(`Placeholder: Invoice creation logic would be triggered here for order ${orderReference}.`);

    } else {
      console.warn(`Payment failed, not successful, or status unclear for order ${orderReference}. Status: ${paymentStatus}, Transaction ID: ${transactionId}. Payload:`, payload);
      
      // **INÍCIO DA LÓGICA DE ATUALIZAÇÃO PARA PAGAMENTO FALHADO (ASSUMINDO supabaseClient DEFINIDO)**
      // try {
      //   const { data: failedOrderData, error: failedOrderError } = await supabaseClient
      //     .from('orders')
      //     .update({ 
      //         payment_status: 'payment_failed', // Ou o status que indica falha no pagamento
      //         emis_transaction_id: transactionId,
      //         payment_provider_payload: payload,
      //         updated_at: new Date().toISOString()
      //     })
      //     .eq('id', orderReference)
      //     .select();

      //   if (failedOrderError) {
      //     console.error(\`DB update for failed payment on order ${orderReference} also failed: \`, failedOrderError);
      //   } else {
      //     console.log(\`Order ${orderReference} status updated to 'payment_failed' in DB.\`, failedOrderData);
      //   }
      // } catch (dbFailedError) {
      //   console.error(\`Error during database operations for failed payment on order ${orderReference}: \`, dbFailedError);
      // }
      // **FIM DA LÓGICA DE ATUALIZAÇÃO PARA PAGAMENTO FALHADO**
    }

    // A EMIS espera uma resposta 200 OK para confirmar o recebimento do callback.
    // O corpo da resposta geralmente é ignorado pela EMIS, mas pode ser útil para seu próprio registro.
    return new Response(JSON.stringify({ received: true, message: "Callback processed." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("GLOBAL ERROR in payment-callback function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof Error && error.stack) {
      console.error("Error Stack Trace:", error.stack);
    }
    // Mesmo em caso de erro do seu lado, a EMIS pode esperar um 200 OK.
    // Verifique a documentação da EMIS. Se eles tentarem novamente em não-200, você pode querer retornar 500
    // para erros que justifiquem uma nova tentativa, e 200 para erros que não (por exemplo, dados de solicitação incorretos).
    // Por enquanto, retornando 200 para confirmar o recebimento, mas registrando o erro.
    return new Response(JSON.stringify({
      received: true, // Confirmando o recebimento
      error: "Error processing callback.",
      details: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Ou 500 se a EMIS precisar tentar novamente
    });
  }
});
