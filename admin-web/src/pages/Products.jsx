import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/api'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    base_price: '',
    cost_price: '',
    description: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.list(1, 50)
      setProducts(response.data.products || [])
    } catch (err) {
      setError('Erro ao carregar produtos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await productService.create(formData)
      setFormData({ sku: '', name: '', base_price: '', cost_price: '', description: '' })
      setShowForm(false)
      await loadProducts()
    } catch (err) {
      setError('Erro ao criar produto')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Deletar este produto?')) {
      try {
        await productService.delete(id)
        await loadProducts()
      } catch (err) {
        setError('Erro ao deletar produto')
      }
    }
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>📦 Produtos</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancelar' : '➕ Novo Produto'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <input
              type="text"
              name="sku"
              placeholder="SKU"
              value={formData.sku}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Nome do Produto"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              name="base_price"
              placeholder="Preço Base"
              step="0.01"
              value={formData.base_price}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="cost_price"
              placeholder="Preço de Custo"
              step="0.01"
              value={formData.cost_price}
              onChange={handleInputChange}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Descrição"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />

          <button type="submit" className="btn btn-success">
            Criar Produto
          </button>
        </form>
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p className="no-data">Nenhum produto encontrado. Crie o primeiro!</p>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nome</th>
                <th>Preço Base</th>
                <th>Custo</th>
                <th>Estoque</th>
                <th>Variações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td><code>{product.sku}</code></td>
                  <td>{product.name}</td>
                  <td>R$ {product.base_price.toFixed(2)}</td>
                  <td>R$ {product.cost_price.toFixed(2)}</td>
                  <td className={product.total_stock === 0 ? 'low-stock' : ''}>
                    {product.total_stock}
                  </td>
                  <td>{product.variants.length}</td>
                  <td className="actions">
                    <Link to={`/produtos/${product._id}`} className="btn btn-sm btn-info">
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
