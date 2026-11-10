// admin-api/src/services/emailService.js

const nodemailer = require('nodemailer');

// Configurar transporte
let transporter;

if (process.env.SENDGRID_API_KEY) {
  // SendGrid (produção)
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
} else {
  // Gmail (desenvolvimento)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

class EmailService {
  
  // 📧 Email ao Admin - Nova Venda
  async sendSaleNotificationToAdmin(order) {
    const itemsHtml = order.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.productName}</strong><br/>
            ${item.variantName || ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
            ${item.quantity}x
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
            <strong>R$ ${item.finalPrice?.toFixed(2) || '0.00'}</strong>
          </td>
        </tr>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #FF2D6F 0%, #000 100%); color: #fff; padding: 20px; text-align: center; border-radius: 8px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px 0; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #333; font-size: 16px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          .values { background: #f9f9f9; padding: 15px; border-radius: 6px; }
          .values div { display: flex; justify-content: space-between; padding: 5px 0; }
          .total { font-size: 18px; font-weight: bold; color: #FF2D6F; border-top: 2px solid #FF2D6F; padding-top: 10px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Nova Venda!</h1>
            <p>Pedido #${order.orderId?.substring(0, 10) || 'N/A'}</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>👤 Cliente</h2>
              <p>
                <strong>${order.customer?.name || 'N/A'}</strong><br/>
                ${order.customer?.email || 'N/A'}<br/>
                ${order.customer?.phone || 'Sem telefone'}
              </p>
            </div>

            <div class="section">
              <h2>📦 Itens</h2>
              <table>
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; text-align: left;">Produto</th>
                    <th style="padding: 8px; text-align: center;">Qtd</th>
                    <th style="padding: 8px; text-align: right;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="values">
                <div>
                  <span>Subtotal:</span>
                  <strong>R$ ${order.subtotal?.toFixed(2) || '0.00'}</strong>
                </div>
                ${order.shipping > 0 ? `
                <div>
                  <span>Frete (${order.shipping_method}):</span>
                  <strong>R$ ${order.shipping?.toFixed(2) || '0.00'}</strong>
                </div>
                ` : ''}
                ${order.discount > 0 ? `
                <div style="color: #10B981;">
                  <span>Desconto:</span>
                  <strong>-R$ ${order.discount?.toFixed(2) || '0.00'}</strong>
                </div>
                ` : ''}
                <div class="total">
                  <span>Total:</span>
                  <strong>R$ ${order.total?.toFixed(2) || '0.00'}</strong>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>📍 Endereço de Entrega</h2>
              <p style="color: #666;">
                ${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.number || 'N/A'}<br/>
                ${order.shippingAddress?.complement ? order.shippingAddress.complement + '<br/>' : ''}
                ${order.shippingAddress?.neighborhood || 'N/A'} - ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}<br/>
                ${order.shippingAddress?.zipCode || 'N/A'}
              </p>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 ${process.env.SHOP_NAME}. Não responda este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `🎉 Nova Venda - Pedido #${order.orderId?.substring(0, 10) || 'N/A'}`,
        html
      });
      console.log('✅ Email enviado ao admin');
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
    }
  }

  // 📧 Email ao Cliente - Confirmação de Compra
  async sendOrderConfirmationToCustomer(order) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #FF2D6F 0%, #000 100%); color: #fff; padding: 20px; text-align: center; border-radius: 8px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px 0; }
          .status-box { background: #10B98120; border-left: 4px solid #10B981; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .status-box h3 { margin: 0 0 5px 0; color: #10B981; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Compra Confirmada!</h1>
          </div>

          <div class="content">
            <p>Oi <strong>${order.customer?.name || 'Cliente'}</strong>,</p>
            <p>Sua compra foi processada com sucesso! 🎉</p>

            <div class="status-box">
              <h3>Número do Pedido</h3>
              <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">
                #${order.orderId || 'N/A'}
              </p>
            </div>

            <h3>Resumo</h3>
            <p><strong>Total:</strong> R$ ${order.total?.toFixed(2) || '0.00'}</p>
            <p><strong>Entrega em:</strong> ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}</p>

            <p style="color: #666; margin-top: 20px;">
              Você receberá um email quando seu pedido for enviado! 📦
            </p>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Dúvidas?</strong></p>
              <p style="color: #666; margin: 5px 0;">
                Email: support@dcbrand.com<br/>
                WhatsApp: (81) 99999-9999
              </p>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 ${process.env.SHOP_NAME}. Não responda este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: order.customer?.email,
        subject: `✅ Compra Confirmada - Pedido #${order.orderId?.substring(0, 10) || 'N/A'}`,
        html
      });
      console.log(`✅ Email de confirmação enviado para ${order.customer?.email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email ao cliente:', error.message);
    }
  }

  // 📧 Resumo Diário de Vendas
  async sendDailySalesReport() {
    try {
      const Order = require('../models/Order');
      
      // Pedidos de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const orders = await Order.find({
        createdAt: { $gte: today },
        status: { $ne: 'cancelled' }
      });

      if (orders.length === 0) {
        console.log('📊 Nenhuma venda hoje');
        return;
      }

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const approvedCount = orders.filter(o => o.paymentStatus === 'approved').length;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #FF2D6F 0%, #000 100%); color: #fff; padding: 20px; text-align: center; border-radius: 8px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-card h3 { margin: 0; font-size: 12px; color: #666; }
            .stat-card .number { font-size: 24px; font-weight: bold; color: #FF2D6F; margin: 10px 0 0 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background: #f0f0f0; padding: 8px; text-align: left; font-weight: bold; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Relatório Diário</h1>
              <p>${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="stats">
              <div class="stat-card">
                <h3>Pedidos</h3>
                <div class="number">${orders.length}</div>
              </div>
              <div class="stat-card">
                <h3>Pagamentos Confirmados</h3>
                <div class="number">${approvedCount}</div>
              </div>
              <div class="stat-card">
                <h3>Revenue</h3>
                <div class="number">R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
              </div>
              <div class="stat-card">
                <h3>Ticket Médio</h3>
                <div class="number">R$ ${(totalRevenue / orders.length).toFixed(0)}</div>
              </div>
            </div>

            <h3>Últimas Vendas</h3>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.slice(-5).map(o => `
                  <tr>
                    <td>${o.customer?.name || 'N/A'}</td>
                    <td>R$ ${o.total?.toFixed(2) || '0.00'}</td>
                    <td>
                      ${o.paymentStatus === 'approved' ? '✅' : '⏳'}
                      ${o.paymentStatus}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>© 2026 ${process.env.SHOP_NAME}.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `📊 Relatório Diário - ${new Date().toLocaleDateString('pt-BR')} (${orders.length} vendas)`,
        html
      });

      console.log('✅ Relatório diário enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar relatório:', error.message);
    }
  }
}

module.exports = new EmailService();