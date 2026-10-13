# 🚚 DC Brand - Delivery & Checkout System

Implementação completa de sistema de entregas para e-commerce de importados, com suporte a **moto boy local** e **Correios nacional**.

---

## 📚 Estrutura do Projeto

```
dcbrand-backend/
├── delivery-api.js                 # API principal (Express.js)
├── delivery-neighborhoods.json     # Database bairros (~100 registros)
├── delivery-api.test.js            # Testes completos (Jest)
├── package.json                    # Dependências
├── .env.example                    # Variáveis de ambiente
├── CORREIOS-INTEGRATION.md         # Setup Correios (auth, credenciais)
├── LOVABLE-INTEGRATION.md          # Como Lovable consume API
├── README-DELIVERY.md              # Este arquivo
└── [Database]                      # PostgreSQL (será criado)
```

---

## 🎯 Funcionalidades

### ✅ Moto Boy (Recife)
- ~100 bairros cadastrados com preços fixos (R$ 10-25)
- Validação de CEP por região
- Tempo estimado: 1-3 dias úteis
- Preço fixo por bairro

### ✅ Correios (Nacional)
- Integração com API oficial Correios
- Serviços: PAC, SEDEX, SEDEX 10
- Cálculo dinâmico por CEP + peso
- Rastreamento de encomendas
- Tempo estimado variável

### ✅ Checkout
- Etapa 1: Dados do cliente
- Etapa 2: Escolher entrega (retirada, moto boy, Correios)
- Etapa 3: Forma de pagamento
- Etapa 4: Resumo com 3 valores separados:
  - Subtotal dos produtos
  - Taxa de entrega
  - Taxa de cartão (%)

---

## 🚀 Início Rápido

### 1. Setup

```bash
# Clone/crie o diretório
mkdir dcbrand-backend
cd dcbrand-backend

# Copie os 4 arquivos principais
# - delivery-api.js
# - delivery-neighborhoods.json
# - package.json
# - .env.example

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais (Correios vem depois)
```

### 2. Testar Localmente

```bash
# Terminal 1: Backend
npm run dev
# Vai rodar em http://localhost:3001

# Terminal 2: Teste um endpoint
curl http://localhost:3001/api/v1/deliveries/neighborhoods

# Terminal 3: Rode testes
npm test
```

### 3. Conectar com Lovable

```javascript
// Em Lovable, chame a API:
const response = await fetch('http://localhost:3001/api/v1/deliveries/neighborhoods');
```

---

## 📡 Endpoints

### Bairros (Moto Boy)
```
GET  /api/v1/deliveries/neighborhoods        # Lista todos
GET  /api/v1/deliveries/neighborhoods/:id    # Um bairro
POST /api/v1/deliveries/calculate-motoboy    # Calcula taxa
```

### Correios
```
POST /api/v1/deliveries/calculate-correios   # Calcula frete
GET  /api/v1/deliveries/tracking/:code       # Rastreia
```

### Unificado
```
POST /api/v1/deliveries/quote                # Orçamento (moto/correios)
```

### Status
```
GET  /health                                  # Health check
```

**Documentação detalhada:** Ver [CORREIOS-INTEGRATION.md](CORREIOS-INTEGRATION.md)

---

## 💾 Dados Principais

### Bairros Recife
```json
{
  "id": 4594,
  "name": "Afogados",
  "price": 14.00,
  "region": "west",
  "active": true
}
```

**Regiões:** Center (10-14), North (15-20), West (12-20), South (12-25), External (20-25)

**Total:** ~100 bairros cadastrados

---

## 🔌 Integração Lovable

### Fluxo de Entrega no Checkout

**ETAPA 2: Escolher Entrega**

```
┌─────────────────────────────┐
│ ○ RETIRADA NA LOJA (Grátis) │
│   [Informações da loja]     │
│                             │
│ ○ MOTO BOY                  │
│   [Dropdown bairros]        │
│   [Calcula taxa]            │
│                             │
│ ○ CORREIOS                  │
│   [Calcula frete]           │
│   [PAC vs SEDEX]            │
└─────────────────────────────┘
```

**Código example:** Ver [LOVABLE-INTEGRATION.md](LOVABLE-INTEGRATION.md)

---

## 🔐 Segurança

- [x] CORS configurado
- [x] Validação de entrada
- [x] Tratamento de erros
- [ ] Autenticação JWT (admin, depois)
- [ ] Rate limiting (depois)
- [ ] Logging (depois)

---

## 🧪 Testes

```bash
# Rodar tudo
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

**Cobertura:** ~40 testes unitários
- Health check ✅
- Bairros (CRUD) ✅
- Cálculo moto boy ✅
- Cálculo Correios ✅
- Rastreamento ✅
- Edge cases ✅

---

## 📈 Arquitetura

```
[Lovable Frontend]
       ↓ (fetch)
[Express API]
       ├─ Memory Cache (Node-Cache)
       ├─ Bairros (JSON)
       ├─ Correios API (axios)
       └─ Rastreamento
       ↓ (futuro)
[PostgreSQL Database]
       ├─ orders
       ├─ customers
       └─ tracking
```

---

## 🔄 Próximos Passos

### Fase 1 (Agora)
- [x] Backend API com bairros ✅
- [x] Integração Correios (mock)
- [x] Testes completos
- [ ] Conectar Lovable

### Fase 2 (Semana 2)
- [ ] Credenciais reais Correios
- [ ] PostgreSQL (orders table)
- [ ] Gerar etiquetas

### Fase 3 (Admin)
- [ ] Dashboard admin
- [ ] Gerenciar estoque
- [ ] Editar preços bairros
- [ ] Ver pedidos

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| API não inicia | Verifique port 3001 livre: `lsof -i :3001` |
| 404 neighborhoods | Verificar arquivo JSON no mesmo diretório |
| Erro Correios | Credenciais ainda mock; após Correios liberar, atualizar .env |
| CORS error em Lovable | Verificar CORS_ORIGIN em .env |

---

## 📞 Contatos

| Recurso | Link |
|---------|------|
| **Código** | Este arquivo |
| **Testes** | `npm test` |
| **Correios** | comercial@correios.com.br |
| **Lovable** | dcbrand-test.lovable.app |

---

## 📋 Checklist Implementação

- [ ] Backend rodando localmente
- [ ] Testes passando (`npm test`)
- [ ] Lovable carregando bairros
- [ ] Cálculo moto boy funcionando
- [ ] Cálculo Correios funcionando (mock)
- [ ] Resumo mostra 3 valores separados
- [ ] Credenciais Correios configuradas (depois)
- [ ] Deploy produção pronto

---

## 🎓 Aprendizado

**Stack utilizado:**
- Node.js + Express (API)
- Jest + Supertest (Testes)
- Node-Cache (Cache em memória)
- Axios (HTTP client)

**Conceitos:**
- REST API design
- Error handling
- Caching strategy
- Integration testing

---

## 📝 Notas Importantes

1. **Bairros JSON:** Arquivo estático por enquanto. Migrar para DB quando tiver admin.

2. **Correios Mock:** Retorna dados simulados. Ativar com credenciais reais depois.

3. **Lovable:** Não consome dados offline. Sempre chama API.

4. **Peso padrão:** 0.5kg. Futuro: dinâmico por produto.

5. **CEP:** Validação básica (8 dígitos). Correios valida se existe.

---

## 🚀 Deploy

### Vercel (Recomendado)
```bash
vercel deploy
# Automaticamente expõe em https://dcbrand-api.vercel.app
```

### Render / Railway
1. Conecte seu repositório
2. Configure variáveis de ambiente
3. Deploy automático

### Ambiente
```bash
# Production
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://dcbrand.lovable.app
```

---

## 📄 Licença

MIT - Livre para uso comercial

---

**Última atualização:** 13/10/2026  
**Status:** ✅ Pronto para Fase 1 (API + Lovable)  
**Próximo:** Admin panel + Database
