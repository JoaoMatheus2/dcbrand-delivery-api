const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const productController = require('../controllers/productController');

// Produtos
router.get('/', authenticate, productController.listProducts);
router.post('/', authenticate, productController.createProduct);
router.get('/:id', authenticate, productController.getProduct);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

// Variações
router.post('/:id/variants', authenticate, productController.addVariant);
router.put('/:id/variants/:variantId', authenticate, productController.updateVariant);
router.delete('/:id/variants/:variantId', authenticate, productController.deleteVariant);
router.put('/:id/variants/:variantId/stock', authenticate, productController.updateVariantStock);

module.exports = router;