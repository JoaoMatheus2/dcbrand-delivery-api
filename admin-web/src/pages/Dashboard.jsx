import { useState, useEffect } from 'react'
import { productService } from '../services/api'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await productService.list(1, 100)
      
      if (response.data.products) {
        const products = response.data.products
        const totalProducts = products.length
        const lowStock = products.filter(p => p.total_stock === 0).length
        const totalValue = products.reduce((sum, p) => sum + (p.base_price * p.total_stock), 0)

        setStats({
          totalProducts,
          lowStock,
          totalValue
        })
      }
    } catch (err) {
      setError('Erro ao carregar dados')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>📦 Total de Produtos</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>

          <div className="stat-card alert">
            <h3>⚠️ Sem Estoque</h3>
            <p className="stat-value">{stats.lowStock}</p>
          </div>

          <div className="stat-card">
            <h3>💰 Valor Total em Estoque</h3>
            <p className="stat-value">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      <div className="dashboard-info">
        <h2>✨ Bem-vindo ao Admin DC Brand!</h2>
        <p>Use o menu lateral para gerenciar produtos, variações e estoque.</p>
        <ul>
          <li>📦 <strong>Produtos:</strong> CRUD completo de itens</li>
          <li>🎨 <strong>Variações:</strong> Gerencie tons, cores e tamanhos</li>
          <li>📋 <strong>Estoque:</strong> Controle quantidades em tempo real</li>
        </ul>
      </div>
    </div>
  )
}
