const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  variantId: String,
  variantName: String,
  price: Number,
  discount: Number,
  finalPrice: Number,
  quantity: { type: Number, default: 1 },
  image: String
});

const orderSchema = new mongoose.Schema({
  // Identificação
  orderId: { type: String, unique: true, required: true }, // ID do Mercado Pago
  externalReference: String, // ID único nosso
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected', 'refunded'],
    default: 'pending'
  },
  
  // Cliente
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    cpf: String,
    document: String // número do documento
  },
  
  // Endereço de Entrega
  shippingAddress: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'BR' }
  },
  
  // Itens
  items: [orderItemSchema],
  
  // Valores
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Frete
  shipping_method: {
    type: String,
    enum: ['moto_boy', 'superfrete', 'pickup'],
    default: 'moto_boy'
  },
  shipping_id: String, // ID do SuperFrete se aplicável
  shipping_tracking: String, // código de rastreamento
  
  // Pagamento
  payment: {
    method: { type: String, enum: ['credit_card', 'debit_card', 'pix', 'boleto'] },
    installments: { type: Number, default: 1 },
    mpPaymentId: String, // ID do Mercado Pago
    mpPreferenceId: String // Preference ID da transação
  },
  
  // Timeline
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Notas
  notes: String,
  adminNotes: String,
  
  // Metadata
  source: { type: String, default: 'website' }, // website | app | manual
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

// Índices para buscas rápidas
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ total: 1 });

module.exports = mongoose.model('Order', orderSchema);