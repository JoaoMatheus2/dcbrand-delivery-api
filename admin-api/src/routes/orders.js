const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Webhook Mercado Pago (SEM auth)
router.post('/webhook', require('../webhook/mercadoPagoWebhook'));

// Com autenticação
router.get('/', orderController.listOrders);
router.get('/dashboard/stats', orderController.getDashboardStats);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/', orderController.createOrder); // Manual

module.exports = router;