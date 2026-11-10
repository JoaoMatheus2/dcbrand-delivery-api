const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: String,
  description: String,
  
  // ✅ PREÇO
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
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
    id: { type: String, required: true },
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
    isOutOfStock: Boolean
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ MIDDLEWARE: Calcular preços finais
productSchema.pre('save', function(next) {
  if (this.price && this.discount) {
    this.finalPrice = this.price * (1 - this.discount / 100);
  } else if (this.price) {
    this.finalPrice = this.price;
  }
  
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach(variant => {
      const variantPrice = variant.price || this.price;
      const variantDiscount = variant.discount !== undefined ? variant.discount : this.discount;
      
      variant.finalPrice = variantPrice * (1 - variantDiscount / 100);
      variant.isOutOfStock = variant.stock <= 0;
    });
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);