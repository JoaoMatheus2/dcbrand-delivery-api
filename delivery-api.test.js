/**
 * Testes para DC Brand Delivery API
 * Usar: npm test
 */

const request = require('supertest');
const app = require('./delivery-api');

describe('🚚 DC Brand Delivery API', () => {

  describe('Health Check', () => {
    test('GET /health deve retornar status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Neighborhoods', () => {
    test('GET /api/v1/deliveries/neighborhoods retorna lista', async () => {
      const res = await request(app).get('/api/v1/deliveries/neighborhoods');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET neighborhood específico', async () => {
      const res = await request(app).get('/api/v1/deliveries/neighborhoods/4594');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(4594);
      expect(res.body.data.name).toBe('Afogados');
    });
  });

  describe('Moto Boy', () => {
    test('Calculate moto boy retorna taxa correta', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries/calculate-motoboy')
        .send({
          neighborhood_id: 4594,
          total_value: 500.00
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.delivery_fee).toBe(14.00);
      expect(res.body.data.final_total).toBe(514.00);
    });
  });

  describe('Correios', () => {
    test('Calculate Correios retorna frete', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries/calculate-correios')
        .send({
          cep_destino: '70000000',
          weight_kg: 0.5,
          total_value: 500.00
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.total_price).toBeGreaterThan(0);
    });
  });

  describe('Quote Unificado', () => {
    test('Quote moto boy', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries/quote')
        .send({
          type: 'motoboy',
          neighborhood_id: 4594,
          total_value: 500.00
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.method).toBe('motoboy');
    });

    test('Quote Correios', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries/quote')
        .send({
          type: 'correios',
          cep_destino: '70000000',
          total_value: 500.00
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.method).toBe('correios');
    });
  });

});
