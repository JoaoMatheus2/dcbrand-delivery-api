const Product = require('../models/Product');

// GET - Listar produtos
exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    
    let filter = { active: true };
    
    // Filtro por categoria
    if (category) {
      filter.category_id = category;
    }
    
    // Filtro por busca
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product
      .find(filter)
      .populate('category_id')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST - Criar produto
exports.createProduct = async (req, res) => {
  try {
    const { sku, name, base_price, cost_price, description, brand, tags } = req.body;
    
    // Validações
    if (!sku || !name || !base_price || !cost_price) {
      return res.status(400).json({ 
        error: 'SKU, nome, preço base e custo são obrigatórios' 
      });
    }
    
    // Verificar SKU único
    const existing = await Product.findOne({ sku });
    if (existing) {
      return res.status(400).json({ error: 'SKU já existe' });
    }
    
    const product = new Product({
      sku,
      name,
      base_price,
      cost_price,
      description: description || '',
      brand: brand || 'DC Brand',
      tags: tags || [],
      variants: [],
      created_by: req.user?.email || 'admin'
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      product_id: product._id,
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET - Detalhe do produto
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id');
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT - Editar produto
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, base_price, cost_price, active, featured, brand, tags } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Atualizar campos
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (base_price) product.base_price = base_price;
    if (cost_price) product.cost_price = cost_price;
    if (typeof active === 'boolean') product.active = active;
    if (typeof featured === 'boolean') product.featured = featured;
    if (brand) product.brand = brand;
    if (tags) product.tags = tags;
    
    product.updated_by = req.user?.email || 'admin';
    product.updated_at = new Date();
    
    await product.save();
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE - Deletar produto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ success: true, message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// VARIAÇÕES (TONS/CORES)
// ============================================

// POST - Adicionar variação
exports.addVariant = async (req, res) => {
  try {
    const { name, color_hex, color_name, sku_variant, stock, price } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Validar SKU variant único
    const existingVariant = await Product.findOne({
      'variants.sku_variant': sku_variant
    });
    if (existingVariant) {
      return res.status(400).json({ error: 'SKU da variação já existe' });
    }
    
    const variant = {
      variant_id: `var-${Date.now()}`,
      name: name || 'Variação',
      color_hex: color_hex || '#000000',
      color_name: color_name || 'Padrão',
      sku_variant,
      stock: stock || 0,
      price: price || product.base_price,
      active: true
    };
    
    product.variants.push(variant);
    await product.save();
    
    res.status(201).json({
      success: true,
      variant_id: variant.variant_id,
      variant,
      message: 'Variação adicionada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar variação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT - Editar variação
exports.updateVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { name, color_hex, color_name, stock, price } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const variant = product.variants.find(v => v.variant_id === variantId);
    if (!variant) {
      return res.status(404).json({ error: 'Variação não encontrada' });
    }
    
    if (name) variant.name = name;
    if (color_hex) variant.color_hex = color_hex;
    if (color_name) variant.color_name = color_name;
    if (stock !== undefined) variant.stock = stock;
    if (price) variant.price = price;
    
    await product.save();
    
    res.json({ success: true, variant });
  } catch (error) {
    console.error('Erro ao atualizar variação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE - Deletar variação
exports.deleteVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const initialLength = product.variants.length;
    product.variants = product.variants.filter(v => v.variant_id !== variantId);
    
    if (product.variants.length === initialLength) {
      return res.status(404).json({ error: 'Variação não encontrada' });
    }
    
    await product.save();
    
    res.json({ success: true, message: 'Variação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar variação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT - Ajustar estoque de uma variação
exports.updateVariantStock = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { stock, reason } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ error: 'Estoque é obrigatório' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const variant = product.variants.find(v => v.variant_id === variantId);
    if (!variant) {
      return res.status(404).json({ error: 'Variação não encontrada' });
    }
    
    const previousStock = variant.stock;
    variant.stock = stock;
    
    await product.save();
    
    res.json({ 
      success: true, 
      variant,
      movement: {
        previous_stock: previousStock,
        new_stock: stock,
        quantity_change: stock - previousStock,
        reason: reason || 'Ajuste manual'
      }
    });
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
