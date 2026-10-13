/**
 * DC Brand Delivery API
 * Gerencia entregas, bairros e integração com SuperFrete
 * 
 * Stack: Node.js + Express + SuperFrete
 */

const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const neighborhoods = require('./delivery-neighborhoods.json');

const app = express();
app.use(express.json());

const cache = new NodeCache({ stdTTL: 3600 });
const neighborhoodCache = new NodeCache({ stdTTL: 86400 });

// ============================================================================
// BAIRROS (Moto Boy)
// ============================================================================

app.get('/api/v1/deliveries/neighborhoods', (req, res) => {
  try {
    const cached = neighborhoodCache.get('all_neighborhoods');
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date()
      });
    }

    const active = neighborhoods.neighborhoods.filter(n => n.active);
    neighborhoodCache.set('all_neighborhoods', active);

    res.json({
      success: true,
      data: active,
      cached: false,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/v1/deliveries/neighborhoods/:id', (req, res) => {
  try {
    const { id } = req.params;
    const neighborhood = neighborhoods.neighborhoods.find(n => n.id === parseInt(id));

    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        error: 'Bairro não encontrado'
      });
    }

    if (!neighborhood.active) {
      return res.status(400).json({
        success: false,
        error: 'Este bairro não está disponível para entrega'
      });
    }

    res.json({
      success: true,
      data: neighborhood
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/v1/deliveries/calculate-motoboy', (req, res) => {
  try {
    const { neighborhood_id, total_value } = req.body;

    if (!neighborhood_id || !total_value) {
      return res.status(400).json({
        success: false,
        error: 'neighborhood_id e total_value são obrigatórios'
      });
    }

    const neighborhood = neighborhoods.neighborhoods.find(n => n.id === parseInt(neighborhood_id));

    if (!neighborhood || !neighborhood.active) {
      return res.status(404).json({
        success: false,
        error: 'Bairro não encontrado ou não disponível'
      });
    }

    const deliveryFee = neighborhood.price;
    const finalTotal = total_value + deliveryFee;

    res.json({
      success: true,
      data: {
        neighborhood: neighborhood.name,
        subtotal: total_value,
        delivery_fee: deliveryFee,
        delivery_method: 'motoboy',
        final_total: finalTotal,
        estimated_days: '1-3 dias úteis'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// SUPERFRETE (Nacional)
// ============================================================================

async function calculateSuperFrete(cepDestino, weightKg, totalValue) {
  try {
    console.log(`Calculando frete SuperFrete: CEP ${cepDestino}, Peso ${weightKg}kg`);

    // Validar CEP
    const cepLimpo = cepDestino.replace('-', '');
    if (!/^\d{8}$/.test(cepLimpo)) {
      throw new Error('CEP inválido');
    }

    // Chamar API SuperFrete
    const response = await axios.post(
      'https://api.superfrete.com/api/v0/calculate',
      {
        recipient: {
          address: {
            zip_code: cepLimpo
          }
        },
        shipper: {
          registered_number: '00000000000000', // CNPJ padrão (sem autenticação completa)
          address: {
            zip_code: '50010020' // Recife - CEP de origem
          }
        },
        dispatchers: [
          {
            products: [
              {
                weight: Math.max(weightKg, 0.5), // Mínimo 0.5kg
                height: 10,
                width: 10,
                length: 10
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPERFRETE_API_KEY || 'test'}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Pegar a opção mais barata
    const services = response.data.dispatchers?.[0]?.services || [];
    if (services.length === 0) {
      throw new Error('Nenhuma opção de frete disponível');
    }

    const cheapest = services.sort((a, b) => a.final_price - b.final_price)[0];

    return {
      cep_destino: cepDestino,
      weight_kg: weightKg,
      service_code: cheapest.service_code,
      service_name: cheapest.service_name,
      base_price: cheapest.final_price,
      prazo_entrega: `${cheapest.delivery_time} dias úteis`,
      total_price: cheapest.final_price,
      provider: 'superfrete'
    };
  } catch (error) {
    console.error('Erro SuperFrete:', error.message);
    
    // Fallback: retornar estimativa se API falhar
    const mockPrice = 25.00 + (weightKg * 10);
    return {
      cep_destino: cepDestino,
      weight_kg: weightKg,
      service_name: 'Sedex (estimado)',
      base_price: mockPrice,
      prazo_entrega: '2-3 dias úteis',
      total_price: mockPrice,
      provider: 'superfrete (estimado)',
      warning: 'Usando estimativa. Configure SUPERFRETE_API_KEY para preços reais.'
    };
  }
}

app.post('/api/v1/deliveries/calculate-correios', async (req, res) => {
  try {
    const { cep_destino, weight_kg = 0.5, total_value } = req.body;

    if (!cep_destino || !total_value) {
      return res.status(400).json({
        success: false,
        error: 'cep_destino e total_value são obrigatórios'
      });
    }

    if (!/^\d{8}$/.test(cep_destino.replace('-', ''))) {
      return res.status(400).json({
        success: false,
        error: 'CEP inválido. Use formato: 12345678'
      });
    }

    const cacheKey = `superfrete_${cep_destino}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date()
      });
    }

    const freteData = await calculateSuperFrete(cep_destino, weight_kg, total_value);
    cache.set(cacheKey, freteData);

    res.json({
      success: true,
      data: freteData,
      cached: false,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao calcular frete. Tente novamente ou use moto boy.',
      details: error.message
    });
  }
});

app.get('/api/v1/deliveries/tracking/:trackingCode', async (req, res) => {
  try {
    const { trackingCode } = req.params;

    if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trackingCode)) {
      return res.status(400).json({
        success: false,
        error: 'Código de rastreamento inválido'
      });
    }

    const mockTracking = {
      tracking_code: trackingCode,
      status: 'Em trânsito',
      last_update: new Date(),
      events: [
        {
          date: new Date(Date.now() - 86400000),
          time: '14:30',
          status: 'Objeto saiu para entrega',
          location: 'Recife, PE'
        }
      ]
    };

    res.json({
      success: true,
      data: mockTracking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ENDPOINT UNIFICADO
// ============================================================================

app.post('/api/v1/deliveries/quote', async (req, res) => {
  try {
    const { type, neighborhood_id, cep_destino, weight_kg = 0.5, total_value } = req.body;

    if (!type || !total_value) {
      return res.status(400).json({
        success: false,
        error: 'type e total_value são obrigatórios'
      });
    }

    if (type === 'motoboy') {
      if (!neighborhood_id) {
        return res.status(400).json({
          success: false,
          error: 'neighborhood_id é obrigatório para moto boy'
        });
      }

      const neighborhood = neighborhoods.neighborhoods.find(n => n.id === parseInt(neighborhood_id));
      if (!neighborhood || !neighborhood.active) {
        return res.status(404).json({
          success: false,
          error: 'Bairro não encontrado'
        });
      }

      return res.json({
        success: true,
        data: {
          method: 'motoboy',
          neighborhood: neighborhood.name,
          price: neighborhood.price,
          final_total: total_value + neighborhood.price,
          estimated_days: '1-3 dias úteis'
        }
      });

    } else if (type === 'correios') {
      if (!cep_destino) {
        return res.status(400).json({
          success: false,
          error: 'cep_destino é obrigatório para SuperFrete'
        });
      }

      const freteData = await calculateSuperFrete(cep_destino, weight_kg, total_value);

      return res.json({
        success: true,
        data: {
          method: 'superfrete',
          service: freteData.service_name,
          price: freteData.total_price,
          final_total: total_value + freteData.total_price,
          estimated_days: freteData.prazo_entrega,
          provider: freteData.provider
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        error: 'type deve ser "motoboy" ou "correios"'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ADMIN (básico)
// ============================================================================

app.patch('/api/v1/deliveries/neighborhoods/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { price, active } = req.body;

    const neighborhood = neighborhoods.neighborhoods.find(n => n.id === parseInt(id));
    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        error: 'Bairro não encontrado'
      });
    }

    if (price !== undefined) neighborhood.price = price;
    if (active !== undefined) neighborhood.active = active;

    neighborhoodCache.del('all_neighborhoods');

    res.json({
      success: true,
      data: neighborhood,
      message: 'Bairro atualizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    services: {
      neighborhoods: 'ok',
      superfrete: process.env.SUPERFRETE_API_KEY ? 'connected' : 'ready (fallback mode)',
      cache: 'ok'
    }
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚚 DC Brand Delivery API rodando em http://localhost:${PORT}`);
  console.log(`📍 Provider: SuperFrete (frete) + Moto Boy (Recife)`);
});

module.exports = app;