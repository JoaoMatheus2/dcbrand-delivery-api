# 🎀 DC Brand Admin - Frontend

Dashboard administrativo para gerenciar produtos, variações e estoque da DC Brand.

---

## 🚀 SETUP INICIAL

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Cria arquivo `.env`:

```
REACT_APP_API_URL=http://localhost:3001
```

### 3. Rodar em Desenvolvimento

```bash
npm run dev
```

Abre no navegador: http://localhost:5173

---

## 📋 FUNCIONALIDADES

### 🔐 Login
- Autenticação simples com JWT
- Credenciais de teste: `admin@dcbrand.com` / `admin123`

### 📊 Dashboard
- KPIs: total de produtos, sem estoque, valor em estoque
- Resumo do sistema

### 📦 Produtos
- Listagem completa de produtos
- CRUD: criar, editar, deletar produtos
- Visualizar detalhes e variações

### 🎨 Variações (Tons/Cores)
- Adicionar múltiplas variações por produto
- Especificar: nome, cor (hex), SKU, preço, estoque
- Editar e deletar variações

### 📋 Estoque
- Visualizar estoque de todas as variações
- Filtrar por: todos, baixo estoque, sem estoque
- Ajustar estoque (+/-, input direto)
- Controle em tempo real

---

## 🎨 IDENTIDADE VISUAL

Cores DC Brand integradas:
- Primária: **Rosa Magenta** (#FF2D6F)
- Secundária: **Preto** (#000000)
- Acentos: Pink bebê, roxo, azul, verde neon, coral, amarelo

---

## 📁 ESTRUTURA DE ARQUIVOS

```
admin-web/
├── src/
│   ├── components/        # Navbar, Sidebar
│   ├── pages/            # Login, Dashboard, Products, Stock
│   ├── services/         # api.js (axios + JWT)
│   ├── App.jsx           # Routing principal
│   ├── App.css
│   └── index.css         # Estilos globais + cores
├── index.html            # Entry HTML
├── vite.config.js        # Configuração Vite
├── package.json
└── README.md
```

---

## 🔌 INTEGRAÇÃO COM API

Todos os endpoints usam JWT Token automaticamente:

```javascript
// Exemplo: Criar produto
const response = await productService.create({
  sku: "BAT-001",
  name: "Batom",
  base_price: 85,
  cost_price: 25
})
```

Interceptors automáticos:
- ✅ Adiciona token em todas as requisições
- ✅ Faz logout se token expirar (401)

---

## 🧪 TESTAR

1. **Backend rodando?**
   ```bash
   npm run dev  # Na pasta admin-api
   ```

2. **Frontend rodando?**
   ```bash
   npm run dev  # Na pasta admin-web
   ```

3. **Login?**
   - Email: `admin@dcbrand.com`
   - Senha: `admin123`

4. **Criar produto?**
   - Vá para "Produtos"
   - Clique "➕ Novo Produto"
   - Preencha e envie

5. **Adicionar variação?**
   - Clique no produto
   - "➕ Adicionar Variação"
   - Preencha cor, estoque, preço

---

## 🚀 BUILD PARA PRODUÇÃO

```bash
npm run build
```

Gera pasta `dist/` pronta para deploy.

---

## 📦 DEPLOY VERCEL

```bash
npm install -g vercel
vercel
```

Ou conecte GitHub no dashboard Vercel.

---

## 🔑 VARIÁVEIS DE AMBIENTE (Produção)

```
REACT_APP_API_URL=https://sua-api.vercel.app
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- Backend: `/mnt/user-data/outputs/README.md` (admin-api)
- Arquitetura: `/mnt/user-data/outputs/ADMIN-API-ARQUITETURA-COMPLETA.md`

---

**Tudo funcionando?** 🎉

Próximos passos:
1. ✅ Frontend rodando
2. ⏳ Deploy Vercel
3. ⏳ Implementar endpoint de login real (backend)
4. ⏳ Integração com pagamentos e pedidos

---

**Dúvidas? Erros?** Me avisa! 👀
