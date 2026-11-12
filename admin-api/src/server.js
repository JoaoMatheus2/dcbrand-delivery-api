const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/authenticate');
require('./jobs/scheduledTasks');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN?.split(',') || '*'
// }));
app.use(express.json());

// Conectar banco
connectDB();

// ============================================
// ROUTES
// ============================================

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/products', authenticate, require('./routes/products'));
// Rotas de Pedidos
const orderRoutes = require('./routes/orders');
app.post('/api/admin/orders/webhook', (req, res, next) => {
  require('./webhook/mercadoPagoWebhook')(req, res);
}); // SEM AUTH para webhook
app.use('/api/admin/orders', authenticate, orderRoutes); // COM AUTH

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
// FOTOS PÚBLICAS (redirect pra Vercel Blob)
// ============================================

app.get('/api/public/photos', async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({ error: 'key é obrigatório' });
    }
    
    const Product = require('./models/Product');
    
    // Procura um produto que tenha essa imagem
    const product = await Product.findOne({
      'images.url': { $regex: key }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    // Encontra a imagem correta
    const image = product.images.find(img => img.url.includes(key));
    
    if (!image) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    // Faz redirect pra URL do Vercel Blob
    res.redirect(image.url);
  } catch (error) {
    console.error('Erro ao buscar foto:', error);
    res.status(500).json({ error: error.message });
  }
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
