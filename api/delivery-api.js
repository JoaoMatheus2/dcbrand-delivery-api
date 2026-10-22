/**
 * DC BRAND - DELIVERY + PAYMENT API (CORRIGIDO)
 * ✅ AGORA RETORNA TODAS AS OPÇÕES: Sedex + PAC + E-Sedex
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '*').split(','),
  credentials: true
}));

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_API_BASE = 'https://api.mercadopago.com';
const SUPERFRETE_API_KEY = process.env.SUPERFRETE_API_KEY;
const SUPERFRETE_API_BASE = 'https://api.superfrete.com';
const CORREIOS_CEP_ORIGEM = process.env.CORREIOS_CEP_ORIGEM || '50010020';
const NEIGHBORHOODS = require('./delivery-neighborhoods.json') || [];

// ============================================================================
// 🚚 DELIVERIES
// ============================================================================

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

app.post('/api/v1/deliveries/calculate-motoboy', (req, res) => {
  try {
    const { neighborhood_id, total_value } = req.body;
    if (!neighborhood_id) {
      return res.status(400).json({ success: false, error: 'neighborhood_id é obrigatório' });
    }

    const neighborhood = NEIGHBORHOODS.find(n => n.id == neighborhood_id);
    if (!neighborhood) {
      return res.status(404).json({ success: false, error: 'Bairro não encontrado' });
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

/**
 * ✅ CORRIGIDO: Retorna TODAS as opções de frete
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

    // ✅ TODAS as opções retornadas
    const carriers = response.data.data || [];
    
    const options = carriers.map(c => ({
      service_code: c.service_code,
      service_name: c.service_name || 'Serviço Desconhecido',
      price: parseFloat(c.price),
      estimated_days: c.estimated_days || 0,
      service_id: c.service_id
    }));

    const cheapest = options.reduce((min, current) => 
      current.price < min.price ? current : min
    );

    res.json({
      success: true,
      data: {
        method: 'superfrete',
        options: options, // ✅ ARRAY COM TODAS!
        default_option: cheapest,
        final_total: (total_value || 0) + cheapest.price
      }
    });

  } catch (error) {
    console.error('SuperFrete error:', error.message);
    res.json({
      success: true,
      data: {
        method: 'superfrete',
        options: [
          { service_name: 'Sedex (estimado)', price: 30, estimated_days: 3 },
          { service_name: 'PAC (estimado)', price: 15, estimated_days: 7 }
        ],
        final_total: (total_value || 0) + 15,
        warning: 'Valores estimados'
      }
    });
  }
});

/**
 * ✅ QUOTE unificado - retorna TODAS as opções
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
        return res.status(400).json({ success: false, error: 'neighborhood_id é obrigatório' });
      }
      const neighborhood = NEIGHBORHOODS.find(n => n.id == neighborhood_id);
      if (!neighborhood) {
        return res.status(404).json({ success: false, error: 'Bairro não encontrado' });
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
          error: 'cep_destino e weight_kg são obrigatórios'
        });
      }

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
        const options = carriers.map(c => ({
          service_code: c.service_code,
          service_name: c.service_name || 'Serviço Desconhecido',
          price: parseFloat(c.price),
          estimated_days: c.estimated_days || 0
        }));

        const cheapest = options.reduce((min, current) => 
          current.price < min.price ? current : min
        );

        return res.json({
          success: true,
          data: {
            type: 'correios',
            options: options, // ✅ TODAS AS OPÇÕES!
            default_option: cheapest,
            final_total: (total_value || 0) + cheapest.price
          }
        });
      } catch (error) {
        console.error('SuperFrete error:', error.message);
        return res.json({
          success: true,
          data: {
            type: 'correios',
            options: [
              { service_name: 'Sedex (estimado)', price: 30, estimated_days: 3 },
              { service_name: 'PAC (estimado)', price: 15, estimated_days: 7 }
            ],
            final_total: (total_value || 0) + 15
          }
        });
      }
    }

    res.status(400).json({ success: false, error: 'type inválido' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 💳 PAYMENTS
// ============================================================================

app.post('/api/v1/payments/create-preference', async (req, res) => {
  try {
    const { order_id, customer_name, customer_email, customer_phone, items, subtotal, delivery_fee, card_tax, total } = req.body;

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
      mp_items.push({ title: 'Taxa de Cartão', quantity: 1, unit_price: card_tax });
    }

    const preference = {
      items: mp_items,
      payer: {
        name: customer_name || 'Cliente',
        email: customer_email,
        phone: { area_code: '85', number: customer_phone?.replace(/\D/g, '') || '00000000000' }
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
      metadata: { delivery_fee: delivery_fee || 0, subtotal: subtotal || 0, total: total }
    };

    const response = await axios.post(`${MP_API_BASE}/checkout/preferences`, preference, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
    });

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
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento',
      details: error.response?.data?.message || error.message
    });
  }
});

// ✅ Buscar bairros por CEP
app.post('/api/v1/deliveries/neighborhoods-by-cep', async (req, res) => {
  try {
    const { cep } = req.body;
    const cepLimpo = cep.replace(/\D/g, '');

    console.log('Buscando bairros para CEP:', cepLimpo);

    const cepResponse = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const cepData = await cepResponse.json();

    if (cepData.erro) {
      return res.status(400).json({
        success: false,
        error: 'CEP não encontrado'
      });
    }

    const bairroViacep = cepData.bairro || 'Centro';
    const cidade = cepData.localidade;
    const estado = cepData.uf;

    const bairrosDisponiveis = NEIGHBORHOODS.filter(n => n.active !== false);

    res.json({
      success: true,
      cep: cepLimpo,
      cidade: cidade,
      estado: estado,
      bairro_viacep: bairroViacep,
      bairros_disponiveis: bairrosDisponiveis.map(b => ({
        id: b.id,
        name: b.name,
        price: b.price,
        region: b.region
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar bairros:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar bairros'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.1', features: ['deliveries', 'payments'] });
});

app.get('/', (req, res) => {
  res.json({ message: 'DC Brand Delivery + Payment API v2.1', status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 DC BRAND API v2.1 - Porta ${PORT} - ✅ Sedex + PAC + E-Sedex`);
});

module.exports = app;