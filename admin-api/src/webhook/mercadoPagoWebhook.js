// admin-api/src/webhook/mercadoPagoWebhook.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const emailService = require('../services/emailService'); // ✨ NOVO

async function mercadoPagoWebhook(req, res) {
  try {
    const { type, data } = req.body;

    console.log('🔔 Webhook MP recebido:', type, data?.id);

    if (type === 'payment') {
      const paymentId = data.id;
      const externalReference = data.external_reference;

      let order = await Order.findOne({ externalReference });

      if (!order) {
        order = new Order({
          orderId: paymentId,
          externalReference,
          payment: { mpPaymentId: paymentId }
        });
      }

      const mpStatus = data.status;
      
      order.paymentStatus = mpStatus;
      order.payment.mpPaymentId = paymentId;

      if (mpStatus === 'approved') {
        order.status = 'approved';
        order.approvedAt = new Date();
        
        // Decrementar estoque
        if (order.items?.length > 0) {
          for (const item of order.items) {
            await Product.updateOne(
              { _id: item.productId, 'variants.id': item.variantId },
              { $inc: { 'variants.$.stock': -item.quantity } }
            );
          }
        }

        // ✨ ENVIAR EMAILS
        await emailService.sendSaleNotificationToAdmin(order);
        await emailService.sendOrderConfirmationToCustomer(order);
      }

      await order.save();
      console.log('✅ Pedido atualizado:', order._id);
    }

    res.status(200).json({ message: 'Webhook processado' });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = mercadoPagoWebhook;