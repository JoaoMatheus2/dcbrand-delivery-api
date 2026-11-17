const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: String,
  description: String,

  // ✅ NOVOS CAMPOS
  brand: String,
  tags: [String],
  cost_price: Number,
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },

  // ✅ PREÇO
  price: { type: Number },
  discount: { type: Number, default: 0 },
  total_stock: { type: Number, default: 0 },  // ← ADICIONA AQUI
  finalPrice: { type: Number },

  // ✅ PROMOÇÃO
  promotion: {
    isActive: { type: Boolean, default: false },
    name: String,
    discountPercentage: Number,
    startDate: Date,
    endDate: Date
  },

  // ✅ IMAGENS
  images: [{
    url: String,
    alt: String,
    isMain: Boolean
  }],

  // ✅ VARIAÇÕES COM ESTOQUE INDIVIDUAL
  variants: [{
  id: { type: String, default: () => `var-${Date.now()}` },
  name: String,
  sku: String,
  price: Number,
  discount: Number,
  finalPrice: Number,
  color: String,
  colorHex: String,
  size: String,
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  isOutOfStock: Boolean,
  images: [{              // ← ADICIONA ISSO
    url: String,
    alt: String,
    isMain: Boolean
  }]
}],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ MIDDLEWARE: Calcular preços finais
productSchema.pre('save', function(next) {
  // ✅ VALIDA E CORRIGE PREÇOS
  // Se tem promoção ativa: price deve ser base_price COM desconto aplicado
  if (this.promotion && this.promotion.isActive) {
    // Se price não tá correto, recalcula
    const expectedPrice = this.base_price * (1 - this.promotion.discountPercentage / 100);
    this.price = Math.round(expectedPrice * 100) / 100; // Evita erro de float
    this.finalPrice = this.price;
  } else {
    // SEM promoção: price deve ser = base_price
    if (!this.price) {
      this.price = this.base_price;
    }
    // Aplica desconto manual se houver
    if (this.discount) {
      this.finalPrice = this.price - (this.price * this.discount / 100);
    } else {
      this.finalPrice = this.price;
    }
  }

  // ✅ CALCULA total_stock
  if (this.variants && this.variants.length > 0) {
    this.total_stock = this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    this.variants.forEach(variant => {
      const variantPrice = variant.price || this.price;
      const variantDiscount = variant.discount || this.discount;
      variant.finalPrice = variantPrice - (variantPrice * variantDiscount / 100);
      variant.isOutOfStock = variant.stock <= 0;
    });
  }

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);