const Product = require('../models/Product');

// ==========================================
// GET - Listar Todos os Produtos
// ==========================================
exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, hasPromotion, isOutOfStock } = req.query;
    
    let filter = {};
    
    // Filtro por categoria
    if (category) {
      filter.category = category;
    }
    
    // Filtro por busca (nome, sku)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por promoção ativa
    if (hasPromotion === 'true') {
      filter['promotion.isActive'] = true;
    }
    
    // Filtro por fora de estoque
    if (isOutOfStock === 'true') {
      filter['variants.stock'] = { $lte: 0 };
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
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

// ==========================================
// POST - Criar Produto
// ==========================================
exports.createProduct = async (req, res) => {
  try {
    const { sku, name, category, description, price, discount, images, variants, promotion, brand, tags, cost_price, featured, active } = req.body;
    
    // Validações
    if (!sku || !name || price === undefined) {
      return res.status(400).json({ 
        error: 'SKU, nome e preço são obrigatórios' 
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
      category: category || '',
      description: description || '',
      price,
      discount: discount || 0,
      images: images || [],
      variants: variants || [],
      promotion: promotion || { isActive: false },
      brand: brand || '',
      tags: tags || [],
      cost_price: cost_price || 0,
      featured: featured || false,
      active: active !== undefined ? active : true
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

// ==========================================
// GET - Detalhe do Produto
// ==========================================
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// PUT - Atualizar Produto
// ==========================================
exports.updateProduct = async (req, res) => {
  try {
const { name, description, price, base_price, discount, category, images, promotion, brand, tags, cost_price, featured, active, total_stock } = req.body;    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Atualizar campos básicos
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (category) product.category = category;

    // ✅ Atualizar novos campos
    if (brand !== undefined) product.brand = brand;
    if (tags !== undefined) product.tags = tags;
    if (cost_price !== undefined) product.cost_price = cost_price;
    if (featured !== undefined) product.featured = featured;
    if (active !== undefined) product.active = active;
    if (base_price !== undefined) product.base_price = base_price;
    if (total_stock !== undefined) product.total_stock = total_stock;    

    // ✅ Validar images - deve ser array de objetos
    if (images !== undefined) {
      if (Array.isArray(images)) {
        // Validar que cada item tem url
        const validImages = images.map(img => ({
          url: img.url || img,
          alt: img.alt || product.name,
          isMain: img.isMain || false
        }));
        product.images = validImages;
      } else if (typeof images === 'string') {
        // Se vier string, retornar erro
        return res.status(400).json({ 
          error: 'Campo images deve ser um array de objetos com estrutura: [{url, alt, isMain}]' 
        });
      }
    }
    
    if (promotion) product.promotion = promotion;
    
    product.updatedAt = new Date();
    await product.save();
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// DELETE - Deletar Produto
// ==========================================
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
// VARIAÇÕES (TONS/CORES/TAMANHOS)
// ============================================

// POST - Adicionar Variação
exports.addVariant = async (req, res) => {
  try {
    const { name, sku, price, discount, color, colorHex, size, stock } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const variant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Variação',
      sku: sku || `${product.sku}-var-${Date.now()}`,
      price: price || product.price,
      discount: discount !== undefined ? discount : product.discount,
      color: color || '',
      colorHex: colorHex || '#000000',
      size: size || '',
      stock: stock || 0
    };
    
    product.variants.push(variant);
    await product.save();
    
    res.status(201).json({
      success: true,
      variant_id: variant.id,
      message: 'Variação adicionada com sucesso',
      variant
    });
  } catch (error) {
    console.error('Erro ao adicionar variação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT - Atualizar Variação (COMPLETA)
exports.updateVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { name, sku, price, discount, color, colorHex, size, stock } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) {
      return res.status(404).json({ error: 'Variação não encontrada' });
    }
    
    // Atualizar campos
    if (name) variant.name = name;
    if (sku) variant.sku = sku;
    if (price !== undefined) variant.price = price;
    if (discount !== undefined) variant.discount = discount;
    if (color) variant.color = color;
    if (colorHex) variant.colorHex = colorHex;
    if (size) variant.size = size;
    if (stock !== undefined) variant.stock = stock;
    
    await product.save();
    
    res.json({ success: true, variant });
  } catch (error) {
    console.error('Erro ao atualizar variação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE - Deletar Variação
exports.deleteVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const initialLength = product.variants.length;
    product.variants = product.variants.filter(v => v.id !== variantId);
    
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

// PUT - Atualizar Estoque de Variação
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
    
    const variant = product.variants.find(v => v.id === variantId);
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

// ==========================================
// ✅ PUT - Atualizar Preço + Desconto de Variação (NOVO)
// ==========================================
exports.updateVariantPrice = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { price, discount } = req.body;
    
    if (price === undefined && discount === undefined) {
      return res.status(400).json({ error: 'price ou discount é obrigatório' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) {
      return res.status(404).json({ error: 'Variação não encontrada' });
    }
    
    if (price !== undefined) variant.price = price;
    if (discount !== undefined) variant.discount = discount;
    
    await product.save();
    
    res.json({ success: true, variant });
  } catch (error) {
    console.error('Erro ao atualizar preço da variação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// ✅ POST - Upload de Imagem (NOVO)
// ==========================================
exports.uploadImage = async (req, res) => {
  try {
    const { base64, filename, productId, alt } = req.body;
    
    if (!base64 || !filename) {
      return res.status(400).json({ error: 'base64 e filename são obrigatórios' });
    }
    
    // Importar put do Vercel Blob
    const { put } = require('@vercel/blob');
    
    // Converter base64 pra buffer
    const buffer = Buffer.from(base64, 'base64');
    
    // Upload pro Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true
    });
    
    // Se tem productId, adiciona a imagem ao produto
    if (productId) {
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      // Cria objeto de imagem com estrutura correta
      const imageObject = {
        url: blob.url,
        alt: alt || product.name,
        isMain: product.images.length === 0 // Primeira imagem é principal
      };
      
      // Adiciona ao array
      product.images.push(imageObject);
      await product.save();
      
      return res.json({
        success: true,
        image: imageObject,
        product_id: productId,
        message: 'Imagem enviada e adicionada ao produto'
      });
    }
    
    // Se não tem productId, só retorna a imagem
    res.json({
      success: true,
      image: {
        url: blob.url,
        alt: alt || filename,
        isMain: true
      },
      filename: blob.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// ✅ PUT - Adicionar Imagem a um Produto (NOVO ENDPOINT)
// ==========================================
exports.addProductImage = async (req, res) => {
  try {
    const { imageUrl, alt, isMain } = req.body;
    const productId = req.params.id;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl é obrigatório' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const imageObject = {
      url: imageUrl,
      alt: alt || product.name,
      isMain: isMain !== undefined ? isMain : product.images.length === 0
    };
    
    product.images.push(imageObject);
    await product.save();
    
    res.json({
      success: true,
      image: imageObject,
      product
    });
  } catch (error) {
    console.error('Erro ao adicionar imagem:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};