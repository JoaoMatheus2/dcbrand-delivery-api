const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/authenticate');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*'
}));
app.use(express.json());

// Conectar banco
connectDB();

// ============================================
// ROUTES
// ============================================

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/products', authenticate, require('./routes/products'));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'admin-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'DC Brand Admin API',
    version: '1.0.0',
    status: 'running'
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.get('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path 
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('Erro não capturado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro'
  });
});

// ============================================
// PRODUTOS PÚBLICOS (sem auth - pra Lovable)
// ============================================

app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    
    const products = await Product.find({ active: true })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({
      success: true,
      total: products.length,
      page,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 DC Brand Admin API rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/admin/products`);
  console.log(`   POST /api/admin/products`);
  console.log(`   GET  /api/admin/products/:id`);
  console.log(`   PUT  /api/admin/products/:id`);
  console.log(`   DELETE /api/admin/products/:id`);
  console.log(`   POST /api/admin/products/:id/variants`);
  console.log(`   PUT  /api/admin/products/:id/variants/:variantId/stock\n`);
});

module.exports = app;
