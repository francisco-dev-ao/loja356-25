
import { CompanySettings } from './types';

// Default settings to use if no settings are found in the database
export const defaultSettings: CompanySettings = {
  id: 'company-settings',
  name: 'LicençasPRO, Lda',
  address: 'Rua Comandante Gika, n.º 100, Luanda, Angola',
  nif: '5417124080',
  phone: '+244 923 456 789',
  email: 'financeiro@licencaspro.ao',
  website: 'www.licencaspro.ao',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  smtp_secure: true,
  currency_locale: 'pt-AO',
  currency_code: 'AOA',
  currency_min_digits: 2,
  currency_max_digits: 2,
  email_template_order: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmação de Pedido - {{company_name}}</title>
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
      <h1>{{company_name}}</h1>
      <p>{{company_tagline}}</p>
    </div>
    
    <div class="content">
      <h2>Confirmação de Pedido</h2>
      <p>Olá {{customer_name}},</p>
      <p>Seu pedido foi recebido e está sendo processado. Abaixo seguem os detalhes do seu pedido:</p>
      
      <h3>Informações do Pedido:</h3>
      <p><strong>Número do Pedido:</strong> {{order_id}}</p>
      <p><strong>Data:</strong> {{order_date}}</p>
      <p><strong>Status:</strong> {{order_status}}</p>
      <p><strong>Método de Pagamento:</strong> {{payment_method}}</p>
      <p><strong>Status de Pagamento:</strong> {{payment_status}}</p>
      
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
          {{order_items}}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong>{{order_total}}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <p>Após a confirmação do pagamento, você receberá suas licenças por email.</p>
      
      <p style="text-align: center; margin: 20px 0;">
        <a href="{{customer_dashboard_url}}" class="button">Acessar Área do Cliente</a>
      </p>
    </div>
    
    <div class="footer">
      <p>{{company_name}} | {{company_address}}</p>
      <p>NIF: {{company_nif}} | Tel: {{company_phone}} | Email: {{company_email}}</p>
      <p>&copy; {{current_year}} {{company_name}}. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `
};
