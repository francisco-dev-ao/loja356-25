
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    
    // Get company settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("settings")
      .select("*")
      .eq("id", "company-settings")
      .single();
    
    if (settingsError) {
      throw new Error(`Error fetching settings: ${settingsError.message}`);
    }
    
    if (!settingsData) {
      throw new Error("Company settings not found");
    }
    
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
    
    // Get currency settings from the database
    const currencyLocale = settingsData.currency_locale || "pt-AO";
    const currencyCode = settingsData.currency_code || "AOA";
    const minDigits = settingsData.currency_min_digits || 2;
    const maxDigits = settingsData.currency_max_digits || 2;
    
    // Format currency with the stored settings - using proper Angolan format
    const formatCurrency = (amount: number): string => {
      try {
        const formatted = new Intl.NumberFormat(currencyLocale, {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: minDigits,
          maximumFractionDigits: maxDigits,
        }).format(amount);
        
        // Clean up and ensure proper formatting
        return formatted
          .replace(currencyCode, '')
          .trim() + ' kz';
      } catch (error) {
        // Fallback formatting
        const formatted = amount.toFixed(2).replace('.', ',');
        const parts = formatted.split(',');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return parts.join(',') + ' kz';
      }
    };
    
    // Prepare order items for email
    const items = order.order_items.map((item: any) => {
      return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.products?.name || "Produto"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
      </tr>`;
    }).join("");
    
    // Format order date
    const orderDate = new Date(order.created_at).toLocaleDateString("pt-BR");
    
    // Format payment method
    const paymentMethod = order.payment_method === "multicaixa" ? "Multicaixa Express" : "Transferência Bancária";
    
    // Format total
    const total = formatCurrency(order.total);
    
    // Get email template from settings or use default
    let emailHtml = settingsData.email_template_order;
    
    if (!emailHtml) {
      // Use default template if none exists in settings
      emailHtml = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmação de Pedido - ${settingsData.name}</title>
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
            <h1>${settingsData.name}</h1>
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
                  <td style="padding: 10px; text-align: right;"><strong>${total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>Após a confirmação do pagamento, você receberá suas licenças por email. Para verificar o status atual do seu pedido, acesse sua Área do Cliente:</p>
            
            <p style="text-align: center; margin: 20px 0;">
              <a href="${Deno.env.get("PUBLIC_SITE_URL") || ""}/cliente/dashboard" class="button">Acessar Área do Cliente</a>
            </p>
          </div>
          
          <div class="footer">
            <p>${settingsData.name} | ${settingsData.address}</p>
            <p>NIF: ${settingsData.nif} | Tel: ${settingsData.phone} | Email: ${settingsData.email}</p>
            <p>© ${new Date().getFullYear()} ${settingsData.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>`;
    } else {
      // Replace template variables
      const orderStatusText = order.status === 'completed' ? 'Concluído' : 
                             order.status === 'processing' ? 'Processando' : 'Pendente';
      
      const paymentStatusText = order.payment_status === 'paid' ? 'Pago' : 'Pendente';
      
      emailHtml = emailHtml
        .replace(/{{company_name}}/g, settingsData.name)
        .replace(/{{company_tagline}}/g, 'Licenças Microsoft Originais')
        .replace(/{{customer_name}}/g, customerName)
        .replace(/{{order_id}}/g, order.id.substring(0, 8) + '...')
        .replace(/{{order_date}}/g, orderDate)
        .replace(/{{order_status}}/g, orderStatusText)
        .replace(/{{payment_method}}/g, paymentMethod)
        .replace(/{{payment_status}}/g, paymentStatusText)
        .replace(/{{order_items}}/g, items)
        .replace(/{{order_total}}/g, total)
        .replace(/{{customer_dashboard_url}}/g, `${Deno.env.get("PUBLIC_SITE_URL") || ""}/cliente/dashboard`)
        .replace(/{{company_address}}/g, settingsData.address)
        .replace(/{{company_nif}}/g, settingsData.nif)
        .replace(/{{company_phone}}/g, settingsData.phone)
        .replace(/{{company_email}}/g, settingsData.email)
        .replace(/{{current_year}}/g, new Date().getFullYear().toString());
    }
    
    // Check if SMTP settings are configured
    if (settingsData.smtp_host && settingsData.smtp_user && settingsData.smtp_password) {
      // Create SMTP client
      const client = new SMTPClient({
        connection: {
          hostname: settingsData.smtp_host,
          port: parseInt(settingsData.smtp_port || '587'),
          tls: true,
          auth: {
            username: settingsData.smtp_user,
            password: settingsData.smtp_password,
          },
        },
      });

      // Send email
      await client.send({
        from: `${settingsData.smtp_from_name || settingsData.name} <${settingsData.smtp_from_email || 'noreply@example.com'}>`,
        to: customerEmail,
        subject: `Confirmação de Pedido - ${settingsData.name}`,
        html: emailHtml,
      });

      await client.close();
      console.log(`Email sent to ${customerEmail} with order confirmation`);
    } else {
      // Email settings not configured, log message
      console.log("SMTP not configured. Email would have been sent to:", customerEmail);
      console.log("Email body:", emailHtml);
    }
    
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
