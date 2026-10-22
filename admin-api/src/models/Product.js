const mongoose = require('mongoose');

// Schema de Variação (Tom/Cor)
const variantSchema = new mongoose.Schema({
  variant_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  color_hex: String,
  color_name: String,
  sku_variant: {
  type: String,
  sparse: true,
  unique: true
	},
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  barcode: String,
  active: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schema de Produto
const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  description: String,
  brand: {
    type: String,
    default: 'DC Brand'
  },
  base_price: {
    type: Number,
    required: true
  },
  cost_price: {
    type: Number,
    required: true
  },
  image_url: String,
  images: [String],
  
  // Variações (tons/cores)
  variants: [variantSchema],
  
  // Estoque total (calculado automaticamente)
  total_stock: {
    type: Number,
    default: 0
  },
  
  active: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  created_by: String,
  updated_by: String
});

// Middleware: Calcular total_stock antes de salvar
productSchema.pre('save', function() {
  this.total_stock = this.variants.reduce((sum, v) => sum + v.stock, 0);
  this.updated_at = new Date();
});

// Index para busca rápida
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
