/**
 * DC Brand Payment API
 * Integração com Mercado Pago para processamento de pagamentos
 * 
 * Stack: Node.js + Express + Mercado Pago SDK
 */

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ============================================================================
// CONFIGURAÇÃO MERCADO PAGO
// ============================================================================

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY;
const MP_API_BASE = 'https://api.mercadopago.com';

// Para sandbox/teste:
// const MP_API_BASE = 'https://api.sandbox.mercadopago.com';

if (!MP_ACCESS_TOKEN) {
  console.warn('⚠️  MERCADO_PAGO_ACCESS_TOKEN não configurada!');
}

// ============================================================================
// CRIAR PREFERÊNCIA DE PAGAMENTO
// ============================================================================

app.post('/api/v1/payments/create-preference', async (req, res) => {
  try {
    const {
      order_id,
      customer_name,
      customer_email,
      customer_phone,
      items,
      subtotal,
      delivery_fee,
      card_tax,
      total
    } = req.body;

    // Validações
    if (!customer_email || !items || !total) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: customer_email, items, total'
      });
    }

    // Preparar itens para Mercado Pago
    const mp_items = items.map(item => ({
      title: item.name || 'Produto DC Brand',
      quantity: item.quantity || 1,
      unit_price: item.price || 0,
      picture_url: item.picture_url || 'https://dcbrand.lovable.app/logo.png'
    }));

    // Adicionar taxas como itens separados
    if (card_tax && card_tax > 0) {
      mp_items.push({
        title: 'Taxa de Cartão',
        quantity: 1,
        unit_price: card_tax
      });
    }

    // Payload da preferência Mercado Pago
    const preference = {
      items: mp_items,
      payer: {
        name: customer_name || 'Cliente',
        email: customer_email,
        phone: {
          area_code: '85', // Ceará - Recife
          number: customer_phone?.replace(/\D/g, '').slice(-9) || '0000000000'
        },
        address: {
          zip_code: '50010020' // Recife
        }
      },
      back_urls: {
        success: 'https://dcbrand.lovable.app/checkout/success',
        failure: 'https://dcbrand.lovable.app/checkout/failure',
        pending: 'https://dcbrand.lovable.app/checkout/pending'
      },
      auto_return: 'approved',
      external_reference: order_id || `order-${Date.now()}`,
      notification_url: 'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/webhook',
      statement_descriptor: 'DC BRAND BELEZA',
      metadata: {
        delivery_fee: delivery_fee || 0,
        subtotal: subtotal || 0,
        total: total
      }
    };

    console.log('Criando preferência Mercado Pago:', preference);

    // Chamar API Mercado Pago
    const response = await axios.post(
      `${MP_API_BASE}/checkout/preferences`,
      preference,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const preference_data = response.data;

    res.json({
      success: true,
      data: {
        preference_id: preference_data.id,
        checkout_url: preference_data.init_point, // URL do checkout
        sandbox_checkout_url: preference_data.sandbox_init_point, // URL sandbox (se teste)
        total: total,
        order_id: order_id
      }
    });

  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento',
      details: error.response?.data?.message || error.message
    });
  }
});

// ============================================================================
// WEBHOOK - NOTIFICAÇÕES DE PAGAMENTO
// ============================================================================

app.post('/api/v1/payments/webhook', async (req, res) => {
  try {
    const { type, data } = req.query;

    console.log('Webhook Mercado Pago recebido:', { type, data });

    // Tipos de notificação:
    // payment = pagamento
    // plan = plano de subscrição
    // subscription = subscrição
    // invoice = fatura

    if (type === 'payment') {
      const payment_id = data.id;

      // Consultar pagamento na API Mercado Pago
      const payment_info = await axios.get(
        `${MP_API_BASE}/v1/payments/${payment_id}`,
        {
          headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
          }
        }
      );

      const payment = payment_info.data;

      console.log('Informações do pagamento:', {
        id: payment.id,
        status: payment.status, // approved, pending, rejected, cancelled
        status_detail: payment.status_detail,
        amount: payment.transaction_amount,
        external_reference: payment.external_reference
      });

      // Aqui você processaria o pedido baseado no status
      if (payment.status === 'approved') {
        console.log('✅ Pagamento aprovado:', payment.external_reference);
        // TODO: Atualizar status do pedido no banco de dados
      } else if (payment.status === 'pending') {
        console.log('⏳ Pagamento pendente:', payment.external_reference);
      } else if (payment.status === 'rejected') {
        console.log('❌ Pagamento rejeitado:', payment.external_reference);
      }
    }

    // Sempre responder 200 para o Mercado Pago
    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao processar webhook:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// ============================================================================
// CONSULTAR STATUS DE PAGAMENTO
// ============================================================================

app.get('/api/v1/payments/status/:preference_id', async (req, res) => {
  try {
    const { preference_id } = req.params;

    const response = await axios.get(
      `${MP_API_BASE}/checkout/preferences/${preference_id}`,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    const preference = response.data;

    res.json({
      success: true,
      data: {
        preference_id: preference.id,
        status: preference.payments_status || 'pending',
        total: preference.total_amount,
        paid_amount: preference.paid_amount || 0,
        external_reference: preference.external_reference
      }
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar status do pagamento'
    });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/v1/payments/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mercado_pago: MP_ACCESS_TOKEN ? 'connected' : 'not configured'
  });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// ============================================================================
// START
// ============================================================================

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`💳 DC Brand Payment API rodando em http://localhost:${PORT}`);
  console.log(`🔗 Mercado Pago: ${MP_ACCESS_TOKEN ? 'Conectado' : 'Não configurado'}`);
});

module.exports = app;
