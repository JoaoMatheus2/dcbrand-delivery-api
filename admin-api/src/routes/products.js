const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const productController = require('../controllers/productController');

// ✅ UPLOAD (precisa estar primeiro!)
router.post('/upload-image', authenticate, productController.uploadImage);

// Produtos
router.get('/', authenticate, productController.listProducts);
router.post('/', authenticate, productController.createProduct);
router.get('/:id', authenticate, productController.getProduct);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);
router.put('/:id/stock', authenticate, productController.updateProductStock);

// Variações
router.post('/:id/variants', authenticate, productController.addVariant);
router.put('/:id/variants/:variantId', authenticate, productController.updateVariant);
router.delete('/:id/variants/:variantId', authenticate, productController.deleteVariant);
router.put('/:id/variants/:variantId/stock', authenticate, productController.updateVariantStock);
router.put('/:id/variants/:variantId/price', authenticate, productController.updateVariantPrice);
router.post('/:id/variants/:variantId/images', authenticate, productController.uploadVariantImage);

// ✅ IMAGENS
router.put('/:id/images', authenticate, productController.addProductImage);

module.exports = router;