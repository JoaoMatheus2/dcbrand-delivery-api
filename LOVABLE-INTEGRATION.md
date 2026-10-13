# Integração Lovable ↔ API

## 🔌 Como conectar

No seu componente Lovable:

```javascript
const API_BASE_URL = 'http://localhost:3001'; // Dev
// const API_BASE_URL = 'https://sua-api.vercel.app'; // Produção

// Carregar bairros
const response = await fetch(`${API_BASE_URL}/api/v1/deliveries/neighborhoods`);
const { data } = await response.json();
// data = array de bairros com preços
```

## 📱 Fluxo Checkout

### ETAPA 2: Entrega
```javascript
// Moto Boy - mostrar dropdown com bairros
<select onChange={handleNeighborhoodChange}>
  {data.map(n => (
    <option value={n.id}>{n.name} (+R$ {n.price})</option>
  ))}
</select>

// Correios - calcular automaticamente
const quote = await fetch(`${API_BASE_URL}/api/v1/deliveries/calculate-correios`, {
  method: 'POST',
  body: JSON.stringify({
    cep_destino: cepValue,
    weight_kg: 0.5,
    total_value: subtotal
  })
});
```

### ETAPA 4: Resumo
```javascript
Subtotal:     R$ 500.00
+ Entrega:    R$ 14.00  (ou valor Correios)
+ Taxa Cart:  R$ 12.50  (2.5%)
────────────────────────
TOTAL:        R$ 526.50
```

## 🔐 CORS

Backend já tem CORS configurado para:
- http://localhost:3000 (dev)
- https://dcbrand-test.lovable.app
- https://dcbrand.lovable.app

## 📡 Endpoints principais

```
GET  /api/v1/deliveries/neighborhoods          # Lista bairros
POST /api/v1/deliveries/calculate-motoboy      # Taxa moto boy
POST /api/v1/deliveries/calculate-correios     # Frete Correios
POST /api/v1/deliveries/quote                  # Orçamento unificado
GET  /health                                   # Status
```

