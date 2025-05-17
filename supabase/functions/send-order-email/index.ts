
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      throw new Error("ID do pedido é obrigatório");
    }
    
    console.log(`Processing email for order: ${orderId}`);
    
    // Get company settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'company-settings')
      .single();
    
    if (settingsError) {
      throw new Error(`Erro ao obter configurações: ${settingsError.message}`);
    }
    
    if (!settings || !settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
      throw new Error("Configurações SMTP não encontradas");
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (name, email),
        order_items:order_items (
          quantity, 
          price, 
          product_id (name)
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      throw new Error(`Erro ao obter detalhes do pedido: ${orderError.message}`);
    }
    
    if (!order || !order.profiles) {
      throw new Error("Pedido ou cliente não encontrado");
    }
    
    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: settings.smtp_host,
        port: parseInt(settings.smtp_port || "587"),
        tls: true,
        auth: {
          username: settings.smtp_user,
          password: settings.smtp_password,
        },
      },
    });
    
    console.log("SMTP client created");
    
    // Get the email template
    let emailTemplate = settings.email_template_order || "";
    if (!emailTemplate) {
      throw new Error("Template de email não configurado");
    }
    
    // Process order items for the template
    let orderItemsHtml = "";
    let orderTotal = 0;
    
    if (order.order_items && Array.isArray(order.order_items)) {
      order.order_items.forEach((item: any) => {
        const itemTotal = item.price * item.quantity;
        orderTotal += itemTotal;
        
        orderItemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_id?.name || "Produto"}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatMoney(item.price)}</td>
          </tr>
        `;
      });
    }
    
    // Replace template variables
    const customerName = order.profiles.name || "Cliente";
    const orderDate = new Date(order.created_at).toLocaleDateString('pt-BR');
    const currentYear = new Date().getFullYear();
    
    // Replace all template variables
    emailTemplate = emailTemplate
      .replace(/{{company_name}}/g, settings.name || "LicencasPRO")
      .replace(/{{company_tagline}}/g, "Licenças Microsoft Originais")
      .replace(/{{customer_name}}/g, customerName)
      .replace(/{{order_id}}/g, order.id)
      .replace(/{{order_date}}/g, orderDate)
      .replace(/{{order_status}}/g, translateOrderStatus(order.status))
      .replace(/{{payment_method}}/g, translatePaymentMethod(order.payment_method))
      .replace(/{{payment_status}}/g, translatePaymentStatus(order.payment_status))
      .replace(/{{order_items}}/g, orderItemsHtml)
      .replace(/{{order_total}}/g, formatMoney(order.total))
      .replace(/{{customer_dashboard_url}}/g, `${Deno.env.get("SITE_URL") || "https://licencaspro.ao"}/cliente/pedidos`)
      .replace(/{{company_address}}/g, settings.address || "")
      .replace(/{{company_nif}}/g, settings.nif || "")
      .replace(/{{company_phone}}/g, settings.phone || "")
      .replace(/{{company_email}}/g, settings.email || "")
      .replace(/{{current_year}}/g, currentYear.toString());
    
    // Send the email
    await client.send({
      from: `${settings.smtp_from_name || settings.name} <${settings.smtp_from_email || settings.email}>`,
      to: order.profiles.email,
      subject: `Confirmação de Pedido #${order.id.substring(0, 8)}`,
      html: emailTemplate,
    });
    
    console.log("Order confirmation email sent successfully");
    
    // Close connection
    await client.close();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de confirmação enviado com sucesso",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro ao enviar email: ${error.message || "Erro desconhecido"}`,
      }),
      {
        status: 200, // Using 200 to not trigger HTTP error handling
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});

// Helper functions
function formatMoney(value: number): string {
  try {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  } catch (error) {
    return `AOA ${value.toFixed(2)}`;
  }
}

function translateOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'processing': 'Em Processamento',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
}

function translatePaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'paid': 'Pago',
    'failed': 'Falhou'
  };
  return statusMap[status] || status;
}

function translatePaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    'multicaixa': 'Multicaixa Express',
    'bank_transfer': 'Transferência Bancária'
  };
  return methodMap[method] || method;
}
