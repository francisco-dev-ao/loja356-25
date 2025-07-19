
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
      const itemTotal = item.price * item.quantity;
      return `<tr>
        <td style="padding: 15px 10px; border-bottom: 1px solid #e9ecef;">${item.products?.name || "Produto"}</td>
        <td style="padding: 15px 10px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
        <td style="padding: 15px 10px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 15px 10px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600;">${formatCurrency(itemTotal)}</td>
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
      // Use professional template
      emailHtml = `<!DOCTYPE html>
      <html lang="pt-AO">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Pedido - ${settingsData.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #0072CE 0%, #0056b3 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .order-info { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .order-info h3 { color: #0072CE; margin-bottom: 15px; font-size: 18px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: 600; color: #6c757d; }
          .info-value { font-weight: 500; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .items-table th { background-color: #0072CE; color: white; padding: 15px 10px; text-align: left; font-weight: 600; }
          .items-table td { padding: 15px 10px; border-bottom: 1px solid #e9ecef; }
          .items-table tr:last-child td { border-bottom: none; }
          .total-row { background-color: #f8f9fa; font-weight: bold; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #0072CE 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .footer { background-color: #343a40; color: white; padding: 25px 20px; text-align: center; }
          .footer-info { margin-bottom: 10px; }
          .footer-info strong { color: #0072CE; }
          .social-links { margin-top: 15px; }
          .highlight { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
          .highlight h4 { color: #856404; margin-bottom: 10px; }
          @media (max-width: 600px) {
            .info-row { flex-direction: column; }
            .info-label, .info-value { width: 100%; }
            .items-table th, .items-table td { padding: 10px 8px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>${settingsData.name}</h1>
            <p>Especialistas em Licenças Microsoft Originais</p>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <h2 style="color: #0072CE; margin-bottom: 20px;">🎉 Pedido Confirmado com Sucesso!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Olá <strong>${customerName}</strong>,
            </p>
            
            <p style="margin-bottom: 20px;">
              Obrigado por escolher a <strong>${settingsData.name}</strong>! Seu pedido foi recebido e está sendo processado com todo cuidado. 
              Abaixo você encontra todos os detalhes do seu pedido:
            </p>
            
            <!-- Order Information -->
            <div class="order-info">
              <h3>📋 Informações do Pedido</h3>
              <div class="info-row">
                <span class="info-label">Número do Pedido:</span>
                <span class="info-value">#${order.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Data do Pedido:</span>
                <span class="info-value">${orderDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value" style="color: #28a745;">✅ ${order.status === 'completed' ? 'Concluído' : order.status === 'processing' ? 'Processando' : 'Confirmado'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Método de Pagamento:</span>
                <span class="info-value">${paymentMethod}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status do Pagamento:</span>
                <span class="info-value">${order.payment_status === 'paid' ? '✅ Pago' : '⏳ Pendente'}</span>
              </div>
            </div>
            
            <!-- Items Table -->
            <h3 style="color: #0072CE; margin: 30px 0 15px 0;">🛍️ Produtos Adquiridos</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th style="text-align: center; width: 80px;">Qtd</th>
                  <th style="text-align: right; width: 120px;">Preço Unit.</th>
                  <th style="text-align: right; width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; font-size: 18px;">
                    <strong>💰 TOTAL GERAL:</strong>
                  </td>
                  <td style="text-align: right; font-size: 18px; color: #0072CE;">
                    <strong>${total}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Payment Instructions -->
            ${order.payment_method === 'multicaixa' ? `
            <div class="highlight">
              <h4>💳 Instruções de Pagamento - Multicaixa</h4>
              <p>Para finalizar sua compra, efetue o pagamento usando a referência Multicaixa fornecida na página de checkout.</p>
            </div>
            ` : ''}
            
            <!-- Next Steps -->
            <div style="background-color: #e7f3ff; border: 1px solid #0072CE; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0072CE; margin-bottom: 15px;">🚀 Próximos Passos</h4>
              <ol style="padding-left: 20px; line-height: 1.8;">
                <li><strong>Processamento:</strong> Verificaremos seu pagamento automaticamente</li>
                <li><strong>Preparação:</strong> Suas licenças serão preparadas pela nossa equipe</li>
                <li><strong>Entrega Digital:</strong> Você receberá as licenças e instruções por email</li>
                <li><strong>Suporte:</strong> Nossa equipe estará disponível para ajudar na ativação</li>
              </ol>
            </div>
            
            <!-- Customer Dashboard CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="margin-bottom: 15px;">Acompanhe o status do seu pedido a qualquer momento:</p>
              <a href="${Deno.env.get("PUBLIC_SITE_URL") || ""}/cliente/dashboard" class="cta-button">
                🔍 Acessar Área do Cliente
              </a>
            </div>
            
            <!-- Support Information -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0072CE; margin-bottom: 10px;">💬 Precisa de Ajuda?</h4>
              <p style="margin-bottom: 10px;">Nossa equipe de suporte está sempre pronta para ajudar:</p>
              <ul style="list-style: none; padding-left: 0;">
                <li style="margin: 5px 0;">📧 Email: <a href="mailto:${settingsData.email}" style="color: #0072CE;">${settingsData.email}</a></li>
                <li style="margin: 5px 0;">📱 WhatsApp: <a href="tel:${settingsData.phone}" style="color: #0072CE;">${settingsData.phone}</a></li>
                <li style="margin: 5px 0;">⏰ Horário: Segunda a Sexta, das 8h às 18h</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-info">
              <strong>${settingsData.name}</strong><br>
              ${settingsData.address}<br>
              NIF: ${settingsData.nif} | Tel: ${settingsData.phone}
            </div>
            <div style="border-top: 1px solid #495057; margin: 15px 0; padding-top: 15px;">
              <p style="font-size: 14px; opacity: 0.8;">
                © ${new Date().getFullYear()} ${settingsData.name}. Todos os direitos reservados.<br>
                Este email foi enviado automaticamente, por favor não responda.
              </p>
            </div>
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
    
    // Send email using mail3.angohost.ao API
    console.log(`Sending email to ${customerEmail} with order confirmation`);
    
    try {
      const emailResponse = await fetch('https://mail3.angohost.ao/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject: `Confirmação de Pedido - ${settingsData.name}`,
          html: emailHtml
        })
      });

      if (!emailResponse.ok) {
        throw new Error(`Email API error: ${emailResponse.status}`);
      }

      const emailResult = await emailResponse.json();
      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't throw error to prevent order confirmation failure
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
        status: 200, // Use 200 to avoid HTTP error handling
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
