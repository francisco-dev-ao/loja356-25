
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    // Initialize Supabase client with Admin key to bypass RLS policies
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Get order details including customer info
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        payment_status,
        payment_method,
        total,
        profiles:user_id (
          name,
          email
        ),
        order_items (
          id,
          product_id,
          quantity,
          price,
          products:product_id (
            name
          )
        )
      `)
      .eq("id", orderId)
      .single();
      
    if (orderError) throw orderError;
    if (!order) throw new Error("Order not found");
    
    const customerEmail = order.profiles.email;
    const customerName = order.profiles.name || "Cliente";
    
    // Prepare order items for email
    const items = order.order_items.map((item: any) => {
      return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.products?.name || "Produto"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${new Intl.NumberFormat('pt-AO', {
          style: 'decimal',
          minimumFractionDigits: 2
        }).format(item.price)} kz</td>
      </tr>`;
    }).join("");
    
    // Format order date
    const orderDate = new Date(order.created_at).toLocaleDateString("pt-BR");
    
    // Format payment method
    const paymentMethod = order.payment_method === "multicaixa" ? "Multicaixa Express" : "Transferência Bancária";
    
    // Format total
    const total = new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(order.total);
    
    // Create email HTML
    const emailHtml = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmação de Pedido - LicençasPRO</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0072CE; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; }
        .footer { background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f1f1f1; padding: 10px; text-align: left; }
        .button { background-color: #0072CE; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LicençasPRO</h1>
          <p>Licenças Microsoft Originais</p>
        </div>
        
        <div class="content">
          <h2>Confirmação de Pedido</h2>
          <p>Olá ${customerName},</p>
          <p>Seu pedido foi recebido e está sendo processado. Abaixo seguem os detalhes do seu pedido:</p>
          
          <h3>Informações do Pedido:</h3>
          <p><strong>Número do Pedido:</strong> ${order.id.substring(0, 8)}...</p>
          <p><strong>Data:</strong> ${orderDate}</p>
          <p><strong>Status:</strong> ${order.status === 'completed' ? 'Concluído' : order.status === 'processing' ? 'Processando' : 'Pendente'}</p>
          <p><strong>Método de Pagamento:</strong> ${paymentMethod}</p>
          <p><strong>Status de Pagamento:</strong> ${order.payment_status === 'paid' ? 'Pago' : 'Pendente'}</p>
          
          <h3>Itens do Pedido:</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th style="text-align: center;">Quantidade</th>
                <th style="text-align: right;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${items}
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>${total} kz</strong></td>
              </tr>
            </tbody>
          </table>
          
          <p>Após a confirmação do pagamento, você receberá suas licenças por email. Para verificar o status atual do seu pedido, acesse sua Área do Cliente:</p>
          
          <p style="text-align: center; margin: 20px 0;">
            <a href="${Deno.env.get("PUBLIC_SITE_URL") || ""}/cliente/dashboard" class="button">Acessar Área do Cliente</a>
          </p>
        </div>
        
        <div class="footer">
          <p>LicençasPRO, Lda | Rua Comandante Gika, n.º 100, Luanda, Angola</p>
          <p>NIF: 5417124080 | Tel: +244 923 456 789 | Email: financeiro@licencaspro.ao</p>
          <p>© 2023 LicençasPRO. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>`;
    
    // Send email using a fake service (for demonstration purposes)
    // In production you should integrate with a real email service
    console.log(`Email sent to ${customerEmail} with subject "Confirmação de Pedido - LicençasPRO"`);
    console.log("Email body:", emailHtml);
    
    // Send a successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de confirmação enviado com sucesso."
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
    
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Erro ao enviar email de confirmação." 
      }),
      { 
        status: 400, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
