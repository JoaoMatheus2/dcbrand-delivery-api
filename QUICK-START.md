# 🚀 Quick Start - DC Brand Delivery API

## ⏱️ 5 Minutos para começar

### 1️⃣ Setup (2 min)
```bash
# Copie os arquivos para uma pasta
mkdir dcbrand-api
cd dcbrand-api

# Instale dependências
npm install

# Copie .env.example para .env
cp .env.example .env
```

### 2️⃣ Rodar Localmente (1 min)
```bash
npm run dev
# Abra: http://localhost:3001/health
```

### 3️⃣ Testar um Endpoint (1 min)
```bash
# Terminal novo:
curl http://localhost:3001/api/v1/deliveries/neighborhoods
```

### 4️⃣ Conectar com Lovable (1 min)
No seu código Lovable:
```javascript
const API = 'http://localhost:3001';
const neighborhoods = await fetch(`${API}/api/v1/deliveries/neighborhoods`)
  .then(r => r.json());
```

---

## 📁 Arquivos Inclusos

| Arquivo | Descrição |
|---------|-----------|
| `delivery-api.js` | API principal (Express) |
| `delivery-neighborhoods.json` | 100 bairros Recife |
| `delivery-api.test.js` | Testes (Jest) |
| `package.json` | Dependências |
| `.env.example` | Variáveis de ambiente |
| `README-DELIVERY.md` | Documentação completa |
| `CORREIOS-INTEGRATION.md` | Setup Correios |
| `LOVABLE-INTEGRATION.md` | Como conectar Lovable |

---

## 🔑 Endpoints Principais

```bash
# Bairros
GET /api/v1/deliveries/neighborhoods

# Calcular moto boy
POST /api/v1/deliveries/calculate-motoboy
{
  "neighborhood_id": 4594,
  "total_value": 500.00
}

# Calcular Correios
POST /api/v1/deliveries/calculate-correios
{
  "cep_destino": "70000000",
  "weight_kg": 0.5,
  "total_value": 500.00
}

# Orçamento unificado
POST /api/v1/deliveries/quote
{
  "type": "motoboy" | "correios",
  "neighborhood_id": 4594,  // se motoboy
  "cep_destino": "70000000", // se correios
  "total_value": 500.00
}

# Status
GET /health
```

---

## 🧪 Rodar Testes
```bash
npm test
```

---

## 🚀 Deploy (Próximos Passos)

Ver seção "Deploy" em README-DELIVERY.md

---

## ❓ Dúvidas?

1. Verifique `README-DELIVERY.md` (documentação completa)
2. Veja `CORREIOS-INTEGRATION.md` (setup Correios)
3. Leia `LOVABLE-INTEGRATION.md` (conectar Lovable)

**Desenvolvido por:** João Matheus
**Data:** 13/10/2026
