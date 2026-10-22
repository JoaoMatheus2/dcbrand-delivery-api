# 🚀 DC Brand Admin API

API de administração para o sistema DC Brand com gerenciamento de produtos, variações (tons/cores) e estoque.

---

## 📋 SETUP INICIAL

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar `.env`

Cria arquivo `.env` na raiz do projeto (copiar de `.env.example`):

```bash
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/dcbrand_admin
PORT=3001
NODE_ENV=development
JWT_SECRET=sua_chave_super_secreta_123456
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Precisa de MongoDB?** Cria conta grátis em: https://www.mongodb.com/cloud/atlas

### 3. Rodar em Desenvolvimento

```bash
npm run dev
```

Deve aparecer:
```
✅ MongoDB conectado
🚀 DC Brand Admin API rodando na porta 3001
```

---

## 📡 ENDPOINTS

### Produtos (CRUD)

```
GET    /api/admin/products              → Listar (paginado)
POST   /api/admin/products              → Criar novo
GET    /api/admin/products/:id          → Detalhe
PUT    /api/admin/products/:id          → Editar
DELETE /api/admin/products/:id          → Deletar
```

### Variações (Tons/Cores)

```
POST   /api/admin/products/:id/variants                    → Adicionar tom
PUT    /api/admin/products/:id/variants/:variantId         → Editar tom
DELETE /api/admin/products/:id/variants/:variantId         → Deletar tom
PUT    /api/admin/products/:id/variants/:variantId/stock   → Ajustar estoque
```

---

## 🧪 TESTES RÁPIDOS (PowerShell)

### 1. Criar Produto

```powershell
$body = @{
    sku = "BAT-VELUDO-001"
    name = "Batom Veludo"
    base_price = 85
    cost_price = 25
    description = "Batom com acabamento aveludado"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/admin/products" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json
```

**Resposta:**
```json
{
  "success": true,
  "product_id": "65f1234567890abc...",
  "message": "Produto criado com sucesso"
}
```

### 2. Listar Produtos

```powershell
$response = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/admin/products" `
  -Method GET

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 3. Adicionar Variação (Tom)

```powershell
$body = @{
    name = "Vermelho Intenso"
    color_hex = "#FF0000"
    color_name = "Vermelho"
    sku_variant = "BAT-VELUDO-001-RED"
    stock = 10
    price = 85
} | ConvertTo-Json

# Substitui <PRODUCT_ID> pelo ID do produto anterior
$response = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/admin/products/<PRODUCT_ID>/variants" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json
```

### 4. Ajustar Estoque

```powershell
$body = @{
    stock = 8
    reason = "Venda pedido #001"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/admin/products/<PRODUCT_ID>/variants/<VARIANT_ID>/stock" `
  -Method PUT `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json
```

---

## 🏗️ ESTRUTURA DE PRODUTOS

Cada produto pode ter múltiplas **variações** (tons/cores):

```javascript
{
  _id: ObjectId,
  sku: "BAT-VELUDO-001",
  name: "Batom Veludo",
  base_price: 85,
  cost_price: 25,
  variants: [
    {
      variant_id: "var-1234567890",
      name: "Vermelho Intenso",
      color_hex: "#FF0000",
      sku_variant: "BAT-VELUDO-001-RED",
      stock: 10,
      price: 85
    },
    {
      variant_id: "var-0987654321",
      name: "Rosa Suave",
      color_hex: "#FFB3D9",
      sku_variant: "BAT-VELUDO-001-PINK",
      stock: 5,
      price: 85
    }
  ],
  total_stock: 15
}
```

---

## 📦 DEPLOY VERCEL

### 1. Git (opcional, mas recomendado)

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy Vercel

```bash
npm install -g vercel
vercel
```

Ou conecte GitHub no dashboard da Vercel: https://vercel.com

### 3. Configurar Variáveis de Ambiente

No dashboard Vercel → Settings → Environment Variables:

```
MONGODB_URI = sua_connection_string
JWT_SECRET = sua_chave_secreta
CORS_ORIGIN = https://seu-frontend.vercel.app,https://seu-dominio.com
```

---

## 🔐 AUTENTICAÇÃO

Todos os endpoints `/api/admin/**` requerem token JWT:

```bash
Authorization: Bearer <seu_token_jwt>
```

**Gerar token:**

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { email: 'admin@dcbrand.com', id: '123' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

---

## 📊 EXEMPLO COMPLETO: Criar Batom com 4 Tons

### 1. Criar Produto

```bash
POST /api/admin/products

{
  "sku": "BAT-VELUDO-001",
  "name": "Batom Veludo",
  "base_price": 85,
  "cost_price": 25,
  "description": "Batom com acabamento aveludado"
}
```

Resposta: `product_id: "65f1234..."`

### 2. Adicionar Tons (4x - uma para cada cor)

```bash
POST /api/admin/products/65f1234.../variants

{
  "name": "Vermelho Intenso",
  "color_hex": "#FF0000",
  "color_name": "Vermelho",
  "sku_variant": "BAT-VELUDO-001-RED",
  "stock": 10,
  "price": 85
}
```

Repete para Rosa, Nude, Vinho...

### 3. Resultado Final

Produto com:
- ✅ 4 tons
- ✅ Estoque total: 23 unidades
- ✅ Cada tom com SKU único
- ✅ Cores representadas em hex
- ✅ Preços (podem variar por tom)

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Backend rodando (agora)
2. ⏳ Frontend (React) - próximo
3. ⏳ Conectar com Lovable
4. ⏳ Dashboard
5. ⏳ Deploy completo

---

## 📚 DOCUMENTAÇÃO ADICIONAL

Ver arquivos:
- `ADMIN-API-ARQUITETURA-COMPLETA.md` - visão geral
- `ADMIN-BACKEND-SETUP-PRÁTICO.md` - detalhes de implementação

---

**Dúvidas? Erro rodando?** Checa:
1. MongoDB conectado
2. `.env` preenchido corretamente
3. Porta 3001 livre
4. Node.js instalado (`node --version`)
