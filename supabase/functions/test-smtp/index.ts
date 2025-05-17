
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const body = await req.json();
    const { host, port, user, password, from_email, from_name, to_email } = body;
    
    console.log("SMTP Test request received with params:", { 
      host, 
      port, 
      user, 
      from_email, 
      from_name, 
      to_email 
    });
    
    if (!host || !port || !user || !password || !from_email || !to_email) {
      throw new Error("Todos os campos obrigatórios devem ser preenchidos");
    }
    
    // Create SMTP client configuration
    const clientConfig = {
      connection: {
        hostname: host,
        port: parseInt(port),
        tls: true,
        auth: {
          username: user,
          password: password,
        },
      },
    };
    
    console.log("Creating SMTP client with config:", clientConfig);
    
    // Create SMTP client
    const client = new SMTPClient(clientConfig);

    console.log("SMTP client created, attempting to send test email...");
    
    // Send test email
    await client.send({
      from: `${from_name || "Sistema"} <${from_email}>`,
      to: to_email,
      subject: "Teste de Configuração SMTP",
      content: "Esta é uma mensagem de teste para verificar a configuração SMTP.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0072CE;">Teste de Configuração SMTP</h1>
          <p>Esta é uma mensagem de teste para verificar se a configuração SMTP está funcionando corretamente.</p>
          <p>Se você está vendo esta mensagem, sua configuração SMTP está correta!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Esta é uma mensagem automática, por favor não responda.</p>
        </div>
      `,
    });

    console.log("Test email sent successfully");
    
    // Close connection
    await client.close();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de teste enviado com sucesso.",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro no teste SMTP:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro ao testar SMTP: ${error.message || "Erro desconhecido"}`,
        error: error.toString(),
      }),
      {
        status: 200, // Using 200 instead of 400 so it's not treated as an HTTP error
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
