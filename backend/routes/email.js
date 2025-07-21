const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Configurar transporter de email
const createTransporter = async () => {
  try {
    // Buscar configurações de email do banco
    const result = await pool.query(
      'SELECT * FROM public.settings WHERE id = $1',
      ['company-settings']
    );
    
    let emailConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
    
    if (result.rows.length > 0 && result.rows[0].data.smtp) {
      const smtpConfig = result.rows[0].data.smtp;
      emailConfig = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      };
    }
    
    return nodemailer.createTransporter(emailConfig);
  } catch (error) {
    console.error('Erro ao configurar email:', error);
    return null;
  }
};

// Enviar email de confirmação de pedido
router.post('/send-order-confirmation', authMiddleware, async (req, res) => {
  try {
    const { orderId, customerEmail, customerName } = req.body;
    
    // Buscar dados do pedido
    const orderResult = await pool.query(
      `SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name
       FROM public.orders o 
       LEFT JOIN public.order_items oi ON o.id = oi.order_id
       LEFT JOIN public.products p ON oi.product_id = p.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Organizar dados do pedido
    const order = orderResult.rows[0];
    const items = orderResult.rows.map(row => ({
      name: row.product_name,
      quantity: row.quantity,
      price: row.price
    }));
    
    // Buscar configurações da empresa
    const settingsResult = await pool.query(
      'SELECT * FROM public.settings WHERE id = $1',
      ['company-settings']
    );
    
    const companySettings = settingsResult.rows.length > 0 ? settingsResult.rows[0].data : {};
    
    const transporter = await createTransporter();
    if (!transporter) {
      return res.status(500).json({ error: 'Erro ao configurar email' });
    }
    
    // Template do email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Confirmação de Pedido</h2>
        <p>Olá ${customerName},</p>
        <p>Seu pedido foi recebido com sucesso!</p>
        
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h3>Detalhes do Pedido #${order.id}</h3>
          <p><strong>Total:</strong> ${order.total} AOA</p>
          <p><strong>Método de Pagamento:</strong> ${order.payment_method}</p>
          ${order.payment_reference ? `<p><strong>Referência:</strong> ${order.payment_reference}</p>` : ''}
          
          <h4>Itens:</h4>
          <ul>
            ${items.map(item => `
              <li>${item.name} - Qtd: ${item.quantity} - Preço: ${item.price} AOA</li>
            `).join('')}
          </ul>
        </div>
        
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <p>Obrigado pela preferência!</p>
        
        ${companySettings.company_name ? `<p><strong>${companySettings.company_name}</strong></p>` : ''}
      </div>
    `;
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: `Confirmação de Pedido #${order.id}`,
      html: emailHtml
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

// Testar configuração SMTP
router.post('/test-smtp', authMiddleware, async (req, res) => {
  try {
    const { smtp } = req.body;
    
    const transporter = nodemailer.createTransporter({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass
      }
    });
    
    // Verificar conexão
    await transporter.verify();
    
    // Enviar email de teste
    const mailOptions = {
      from: smtp.user,
      to: smtp.user,
      subject: 'Teste de Configuração SMTP',
      text: 'Este é um email de teste para verificar a configuração SMTP.'
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Email de teste enviado com sucesso' });
  } catch (error) {
    console.error('Erro no teste SMTP:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;