/**
 * DC BRAND - DELIVERY + PAYMENT API
 * Integração completa: Entregas (Moto Boy + SuperFrete) + Pagamento (Mercado Pago)
 * 
 * Este arquivo combina delivery-api.js + payment-api.js
 * Use como referência ou copie diretamente para seu servidor
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '*').split(','),
  credentials: true
}));

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

// MERCADO PAGO
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY;
const MP_API_BASE = 'https://api.mercadopago.com'; // Produção
// const MP_API_BASE = 'https://api.sandbox.mercadopago.com'; // Sandbox

// SUPERFRETE
const SUPERFRETE_API_KEY = process.env.SUPERFRETE_API_KEY;
const SUPERFRETE_API_BASE = 'https://api.superfrete.com';

// CORREIOS
const CORREIOS_CEP_ORIGEM = process.env.CORREIOS_CEP_ORIGEM || '50010020';

// BAIRROS RECIFE
const NEIGHBORHOODS = require('./delivery-neighborhoods.json') || [];

// ============================================================================
// 🚚 DELIVERIES - MOTO BOY
// ============================================================================

/**
 * GET /api/v1/deliveries/neighborhoods
 * Retorna lista de 100 bairros de Recife com preços
 */
app.get('/api/v1/deliveries/neighborhoods', (req, res) => {
  try {
    res.json({
      success: true,
      total: NEIGHBORHOODS.length,
      data: NEIGHBORHOODS
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/deliveries/neighborhoods/:id
 * Retorna informações de um bairro específico
 */
app.get('/api/v1/deliveries/neighborhoods/:id', (req, res) => {
  try {
    const { id } = req.params;
    const neighborhood = NEIGHBORHOODS.find(n => n.id == id);
    
    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        error: 'Bairro não encontrado'
      });
    }

    res.json({ success: true, data: neighborhood });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/deliveries/calculate-motoboy
 * Calcula taxa de entrega por moto boy (local - Recife)
 */
app.post('/api/v1/deliveries/calculate-motoboy', (req, res) => {
  try {
    const { neighborhood_id, total_value } = req.body;

    if (!neighborhood_id) {
      return res.status(400).json({
        success: false,
        error: 'neighborhood_id é obrigatório'
      });
    }

    const neighborhood = NEIGHBORHOODS.find(n => n.id == neighborhood_id);
    
    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        error: 'Bairro não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        method: 'motoboy',
        neighborhood: neighborhood.name,
        price: neighborhood.price,
        final_total: (total_value || 0) + neighborhood.price
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 🚚 DELIVERIES - SUPERFRETE (CORREIOS)
// ============================================================================

/**
 * POST /api/v1/deliveries/calculate-correios
 * Calcula frete via SuperFrete (Correios/Sedex)
 */
app.post('/api/v1/deliveries/calculate-correios', async (req, res) => {
  try {
    const { cep_destino, weight_kg, total_value } = req.body;

    if (!cep_destino || !weight_kg) {
      return res.status(400).json({
        success: false,
        error: 'cep_destino e weight_kg são obrigatórios'
      });
    }

    // Payload SuperFrete (formato correto)
    const superfrete_payload = {
      from: { postal_code: CORREIOS_CEP_ORIGEM },
      to: { postal_code: cep_destino },
      services: '1,2,17', // 1=Sedex, 2=PAC, 17=E-Sedex
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false
      },
      package: {
        height: 10,
        width: 10,
        length: 10,
        weight: weight_kg
      }
    };

    console.log('SuperFrete request:', superfrete_payload);

    // Chamar SuperFrete
    const response = await axios.post(
      `${SUPERFRETE_API_BASE}/api/v0/calculator`,
      superfrete_payload,
      {
        headers: {
          'Authorization': `Bearer ${SUPERFRETE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extrair primeira opção (Sedex)
    const carriers = response.data.data || [];
    const sedex = carriers.find(c => c.service_code === '04162') || carriers[0];

    const price = sedex ? parseFloat(sedex.price) : 30;

    res.json({
      success: true,
      data: {
        method: 'superfrete',
        service: sedex ? sedex.service_name : 'Sedex (estimado)',
        price: price,
        estimated_days: sedex ? sedex.estimated_days : 3,
        final_total: (total_value || 0) + price
      }
    });

  } catch (error) {
    console.error('SuperFrete error:', error.response?.data || error.message);
    
    // Fallback para modo estimado
    res.json({
      success: true,
      data: {
        method: 'superfrete',
        service: 'Sedex (estimado)',
        price: 30, // Valor padrão estimado
        estimated_days: 3,
        final_total: (total_value || 0) + 30,
        warning: 'Usando valor estimado. Confirme com operador.'
      }
    });
  }
});

// ============================================================================
// 🚚 DELIVERIES - QUOTE UNIFICADO
// ============================================================================

/**
 * POST /api/v1/deliveries/quote
 * Endpoint unificado para cálculo de frete (RECOMENDADO)
 * 
 * Suporta:
 * - Moto Boy (type: "motoboy")
 * - Correios/SuperFrete (type: "correios")
 */
app.post('/api/v1/deliveries/quote', async (req, res) => {
  try {
    const { type, neighborhood_id, cep_destino, weight_kg, total_value } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'type é obrigatório (motoboy ou correios)'
      });
    }

    if (type === 'motoboy') {
      if (!neighborhood_id) {
        return res.status(400).json({
          success: false,
          error: 'neighborhood_id é obrigatório para motoboy'
        });
      }

      const neighborhood = NEIGHBORHOODS.find(n => n.id == neighborhood_id);
      if (!neighborhood) {
        return res.status(404).json({
          success: false,
          error: 'Bairro não encontrado'
        });
      }

      return res.json({
        success: true,
        data: {
          type: 'motoboy',
          neighborhood: neighborhood.name,
          price: neighborhood.price,
          final_total: (total_value || 0) + neighborhood.price
        }
      });
    }

    if (type === 'correios') {
      if (!cep_destino || !weight_kg) {
        return res.status(400).json({
          success: false,
          error: 'cep_destino e weight_kg são obrigatórios para correios'
        });
      }

      // Chamar SuperFrete
      const superfrete_payload = {
        from: { postal_code: CORREIOS_CEP_ORIGEM },
        to: { postal_code: cep_destino },
        services: '1,2,17',
        options: { own_hand: false, receipt: false, insurance_value: 0, use_insurance_value: false },
        package: { height: 10, width: 10, length: 10, weight: weight_kg }
      };

      try {
        const response = await axios.post(
          `${SUPERFRETE_API_BASE}/api/v0/calculator`,
          superfrete_payload,
          {
            headers: {
              'Authorization': `Bearer ${SUPERFRETE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const carriers = response.data.data || [];
        const sedex = carriers.find(c => c.service_code === '04162') || carriers[0];
        const price = sedex ? parseFloat(sedex.price) : 30;

        return res.json({
          success: true,
          data: {
            type: 'correios',
            service: sedex ? sedex.service_name : 'Sedex (estimado)',
            price: price,
            estimated_days: sedex ? sedex.estimated_days : 3,
            final_total: (total_value || 0) + price
          }
        });
      } catch (error) {
        console.error('SuperFrete error:', error.message);
        
        // Fallback
        return res.json({
          success: true,
          data: {
            type: 'correios',
            service: 'Sedex (estimado)',
            price: 30,
            estimated_days: 3,
            final_total: (total_value || 0) + 30
          }
        });
      }
    }

    res.status(400).json({
      success: false,
      error: 'type inválido'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 💳 PAYMENTS - MERCADO PAGO
// ============================================================================

/**
 * POST /api/v1/payments/create-preference
 * Cria preferência de pagamento (checkout)
 */
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

    if (!customer_email || !items || !total) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: customer_email, items, total'
      });
    }

    const mp_items = items.map(item => ({
      title: item.name || 'Produto DC Brand',
      quantity: item.quantity || 1,
      unit_price: item.price || 0,
      picture_url: item.picture_url || 'https://dcbrand.lovable.app/logo.png'
    }));

    if (card_tax && card_tax > 0) {
      mp_items.push({
        title: 'Taxa de Cartão',
        quantity: 1,
        unit_price: card_tax
      });
    }

    const preference = {
      items: mp_items,
      payer: {
        name: customer_name || 'Cliente',
        email: customer_email,
        phone: {
  area_code: '85',
  number: customer_phone?.replace(/\D/g, '') || '00000000000'
}
      },
      back_urls: {
  success: 'https://dcbrand-test.lovable.app/checkout/success',    
  failure: 'https://dcbrand-test.lovable.app/checkout/failure',    
  pending: 'https://dcbrand-test.lovable.app/checkout/pending'     
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
        checkout_url: preference_data.init_point,
        sandbox_checkout_url: preference_data.sandbox_init_point,
        total: total,
        order_id: order_id
      }
    });

  } catch (error) {
    console.error('Erro Mercado Pago:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento',
      details: error.response?.data?.message || error.message
    });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Webhook para notificações de pagamento
 */
app.post('/api/v1/payments/webhook', async (req, res) => {
  try {
    const { type, data } = req.query;

    console.log('Webhook Mercado Pago:', { type, data });

    if (type === 'payment') {
      const payment_id = data.id;

      const payment_info = await axios.get(
        `${MP_API_BASE}/v1/payments/${payment_id}`,
        {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        }
      );

      const payment = payment_info.data;

      console.log('Pagamento recebido:', {
        id: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        external_reference: payment.external_reference
      });

      // TODO: Atualizar banco de dados aqui
      if (payment.status === 'approved') {
        console.log('✅ Pagamento aprovado:', payment.external_reference);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Erro webhook:', error.message);
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/payments/status/:preference_id
 * Consulta status de um pagamento
 */
app.get('/api/v1/payments/status/:preference_id', async (req, res) => {
  try {
    const { preference_id } = req.params;

    const response = await axios.get(
      `${MP_API_BASE}/checkout/preferences/${preference_id}`,
      {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
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
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar status'
    });
  }
});

// ============================================================================
// 🏥 HEALTH & INFO
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    version: '2.0',
    features: ['deliveries', 'payments']
  });
});

app.get('/api/v1/deliveries/health', (req, res) => {
  res.json({
    status: 'ok',
    superfrete: SUPERFRETE_API_KEY ? 'configured' : 'not configured'
  });
});

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
// ROOT ROUTE
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    message: 'DC Brand Delivery + Payment API',
    version: '2.0',
    status: 'ok'
  });
});

// Rota 404 para qualquer outro GET
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// ============================================================================
// START
// ============================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 DC BRAND DELIVERY + PAYMENT API
🏃 Rodando em http://localhost:${PORT}

✅ Entregas: Moto Boy + SuperFrete
✅ Pagamento: Mercado Pago ${MP_ACCESS_TOKEN ? '✔️' : '❌'}
✅ CORS: ${process.env.CORS_ORIGIN || '*'}

Endpoints:
  🚚 GET  /api/v1/deliveries/neighborhoods
  🚚 POST /api/v1/deliveries/quote
  💳 POST /api/v1/payments/create-preference
  💳 POST /api/v1/payments/webhook
  💳 GET  /api/v1/payments/health
  `);
});

module.exports = app;
