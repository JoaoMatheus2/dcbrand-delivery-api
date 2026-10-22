import { useState, useEffect } from 'react'
import { productService } from '../services/api'
import './Stock.css'

export default function Stock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, low, empty

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.list(1, 100)
      setProducts(response.data.products || [])
    } catch (err) {
      setError('Erro ao carregar produtos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredProducts = () => {
    switch (filter) {
      case 'low':
        return products.filter(p => p.total_stock > 0 && p.total_stock <= 5)
      case 'empty':
        return products.filter(p => p.total_stock === 0)
      default:
        return products
    }
  }

  const handleStockUpdate = async (productId, variantId, newStock) => {
    try {
      await productService.updateStock(productId, variantId, newStock, 'Ajuste de estoque')
      await loadProducts()
    } catch (err) {
      setError('Erro ao atualizar estoque')
    }
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div className="stock-page">
      <h1>📋 Gerenciamento de Estoque</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="stock-filters">
        <button
          onClick={() => setFilter('all')}
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        >
          📦 Todos ({products.length})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
        >
          ⚠️ Baixo Estoque ({products.filter(p => p.total_stock > 0 && p.total_stock <= 5).length})
        </button>
        <button
          onClick={() => setFilter('empty')}
          className={`filter-btn ${filter === 'empty' ? 'active' : ''}`}
        >
          ❌ Sem Estoque ({products.filter(p => p.total_stock === 0).length})
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="no-data">Nenhum produto encontrado nesta categoria.</p>
      ) : (
        <div className="stock-table">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Variação</th>
                <th>Cor</th>
                <th>SKU</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product =>
                product.variants.map(variant => (
                  <tr key={`${product._id}-${variant.variant_id}`} 
                      className={variant.stock === 0 ? 'empty-stock' : variant.stock <= 5 ? 'low-stock' : ''}>
                    <td>{product.name}</td>
                    <td>{variant.name}</td>
                    <td>
                      {variant.color_hex && (
                        <div className="color-indicator">
                          <div 
                            style={{ backgroundColor: variant.color_hex }}
                            className="color-box"
                          />
                          {variant.color_name}
                        </div>
                      )}
                    </td>
                    <td><code>{variant.sku_variant}</code></td>
                    <td className="stock-cell">
                      <div className="stock-control-inline">
                        <button
                          onClick={() => handleStockUpdate(product._id, variant.variant_id, variant.stock - 1)}
                          className="btn btn-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleStockUpdate(product._id, variant.variant_id, parseInt(e.target.value))}
                          className="stock-input-inline"
                        />
                        <button
                          onClick={() => handleStockUpdate(product._id, variant.variant_id, variant.stock + 1)}
                          className="btn btn-sm"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStockUpdate(product._id, variant.variant_id, 0)}
                        className="btn btn-sm btn-warning"
                        title="Zerar estoque"
                      >
                        Zerar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
