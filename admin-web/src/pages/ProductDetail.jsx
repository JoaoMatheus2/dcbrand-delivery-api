import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/api'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [variantForm, setVariantForm] = useState({
    name: '',
    color_hex: '#000000',
    color_name: '',
    sku_variant: '',
    stock: 0,
    price: ''
  })

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productService.get(id)
      setProduct(response.data.product)
    } catch (err) {
      setError('Erro ao carregar produto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVariantChange = (e) => {
    const { name, value } = e.target
    setVariantForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddVariant = async (e) => {
    e.preventDefault()
    try {
      await productService.addVariant(id, {
        ...variantForm,
        price: parseFloat(variantForm.price) || product.base_price,
        stock: parseInt(variantForm.stock)
      })
      setVariantForm({
        name: '',
        color_hex: '#000000',
        color_name: '',
        sku_variant: '',
        stock: 0,
        price: ''
      })
      setShowVariantForm(false)
      await loadProduct()
    } catch (err) {
      setError('Erro ao adicionar variação')
      console.error(err)
    }
  }

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm('Deletar esta variação?')) {
      try {
        await productService.deleteVariant(id, variantId)
        await loadProduct()
      } catch (err) {
        setError('Erro ao deletar variação')
      }
    }
  }

  const handleStockChange = async (variantId, newStock) => {
    try {
      await productService.updateStock(id, variantId, newStock, 'Ajuste manual')
      await loadProduct()
    } catch (err) {
      setError('Erro ao atualizar estoque')
    }
  }

  if (loading) return <p>Carregando...</p>
  if (error) return <div className="error-message">{error}</div>
  if (!product) return <p>Produto não encontrado</p>

  return (
    <div className="product-detail">
      <button onClick={() => navigate('/produtos')} className="btn btn-secondary">
        ← Voltar
      </button>

      <div className="product-info">
        <h1>{product.name}</h1>
        <div className="info-grid">
          <div>
            <label>SKU:</label>
            <p>{product.sku}</p>
          </div>
          <div>
            <label>Preço Base:</label>
            <p>R$ {product.base_price.toFixed(2)}</p>
          </div>
          <div>
            <label>Custo:</label>
            <p>R$ {product.cost_price.toFixed(2)}</p>
          </div>
          <div>
            <label>Estoque Total:</label>
            <p className={product.total_stock === 0 ? 'alert' : ''}>{product.total_stock} unidades</p>
          </div>
        </div>
        {product.description && (
          <div>
            <label>Descrição:</label>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      <div className="variants-section">
        <div className="variants-header">
          <h2>🎨 Variações ({product.variants.length})</h2>
          <button 
            onClick={() => setShowVariantForm(!showVariantForm)}
            className="btn btn-primary"
          >
            {showVariantForm ? 'Cancelar' : '➕ Adicionar Variação'}
          </button>
        </div>

        {showVariantForm && (
          <form onSubmit={handleAddVariant} className="variant-form">
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Nome da Variação (ex: Vermelho Intenso)"
                value={variantForm.name}
                onChange={handleVariantChange}
                required
              />
              <input
                type="text"
                name="color_name"
                placeholder="Nome da Cor"
                value={variantForm.color_name}
                onChange={handleVariantChange}
              />
            </div>

            <div className="form-row">
              <div className="color-picker">
                <label>Cor:</label>
                <input
                  type="color"
                  name="color_hex"
                  value={variantForm.color_hex}
                  onChange={handleVariantChange}
                />
                <code>{variantForm.color_hex}</code>
              </div>
              <input
                type="text"
                name="sku_variant"
                placeholder="SKU da Variação"
                value={variantForm.sku_variant}
                onChange={handleVariantChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                name="stock"
                placeholder="Estoque"
                value={variantForm.stock}
                onChange={handleVariantChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Preço (opcional)"
                step="0.01"
                value={variantForm.price}
                onChange={handleVariantChange}
              />
            </div>

            <button type="submit" className="btn btn-success">
              Adicionar Variação
            </button>
          </form>
        )}

        {product.variants.length === 0 ? (
          <p className="no-data">Nenhuma variação. Adicione uma!</p>
        ) : (
          <div className="variants-grid">
            {product.variants.map(variant => (
              <div key={variant.variant_id} className="variant-card">
                <div className="variant-color">
                  <div 
                    className="color-circle"
                    style={{ backgroundColor: variant.color_hex }}
                  />
                </div>
                <h3>{variant.name}</h3>
                <p className="variant-sku"><code>{variant.sku_variant}</code></p>
                {variant.color_name && <p>{variant.color_name}</p>}
                <p className="variant-price">R$ {variant.price.toFixed(2)}</p>
                
                <div className="stock-control">
                  <label>Estoque:</label>
                  <div className="stock-input">
                    <button
                      onClick={() => handleStockChange(variant.variant_id, variant.stock - 1)}
                      className="btn btn-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleStockChange(variant.variant_id, parseInt(e.target.value))}
                    />
                    <button
                      onClick={() => handleStockChange(variant.variant_id, variant.stock + 1)}
                      className="btn btn-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVariant(variant.variant_id)}
                  className="btn btn-sm btn-danger"
                >
                  Deletar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
