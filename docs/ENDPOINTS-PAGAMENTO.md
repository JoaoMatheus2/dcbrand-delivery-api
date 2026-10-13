# 💳 ENDPOINTS DE PAGAMENTO - REFERÊNCIA RÁPIDA

**Base URL:** `https://dcbrand-delivery-api-hl25.vercel.app`

---

## 🟢 CRIAR PREFERÊNCIA (Checkout)

```
POST /api/v1/payments/create-preference
Content-Type: application/json

Request:
{
  "order_id": "order-123",
  "customer_name": "João Silva",
  "customer_email": "joao@dcbrand.com",
  "customer_phone": "85987654321",
  "items": [
    {
      "name": "Produtos DC Brand",
      "quantity": 1,
      "price": 500.00,
      "picture_url": "https://..."
    }
  ],
  "subtotal": 500.00,
  "delivery_fee": 14.00,
  "card_tax": 12.50,
  "total": 526.50
}

Response:
{
  "success": true,
  "data": {
    "preference_id": "123456789",
    "checkout_url": "https://checkout.mercadopago.com/v2/123456789",
    "sandbox_checkout_url": "https://sandbox.mercadopago.com/checkout/v2/123456789",
    "total": 526.50,
    "order_id": "order-123"
  }
}

Status: 200 OK
```

---

## 🟣 WEBHOOK (Notificação de Pagamento)

```
POST /api/v1/payments/webhook?type=payment&data.id=123456789

Mercado Pago envia automaticamente:
- type: "payment"
- data.id: ID do pagamento

Seu backend:
1. Recebe webhook
2. Consulta status na API Mercado Pago
3. Atualiza banco de dados
4. Envia email de confirmação

Response:
{ "success": true }

Status: 200 OK
```

---

## 🔵 CONSULTAR STATUS

```
GET /api/v1/payments/status/:preference_id

Exemplo:
GET /api/v1/payments/status/123456789

Response:
{
  "success": true,
  "data": {
    "preference_id": "123456789",
    "status": "pending",
    "total": 526.50,
    "paid_amount": 0,
    "external_reference": "order-123"
  }
}

Statuses:
- pending: Aguardando pagamento
- approved: Pagamento aprovado ✅
- rejected: Pagamento rejeitado ❌
- cancelled: Cancelado

Status: 200 OK
```

---

## 🟡 HEALTH CHECK

```
GET /api/v1/payments/health

Response:
{
  "status": "ok",
  "timestamp": "2026-10-13T22:41:53.000Z",
  "mercado_pago": "connected"
}

Status: 200 OK
```

---

## 📝 FLUXO COMPLETO

```
1️⃣ CLIENTE PREENCHE CHECKOUT
   └─ Lovable coleta dados

2️⃣ LOVABLE CHAMA /create-preference
   ├─ POST com dados do pedido
   ├─ Backend envia para Mercado Pago
   └─ Recebe checkout_url

3️⃣ LOVABLE REDIRECIONA
   └─ window.location.href = checkout_url

4️⃣ CLIENTE PAGA NO MERCADO PAGO
   ├─ Preenche dados do cartão
   └─ Confirma pagamento

5️⃣ MERCADO PAGO CONFIRMA
   ├─ Webhook chama /payments/webhook
   └─ Backend atualiza pedido

6️⃣ CLIENTE RETORNA
   └─ Redirecionado para /success
```

---

## 🧪 TESTE RÁPIDO (PowerShell)

```powershell
# 1. Health Check
curl -Uri 'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/health' -UseBasicParsing

# 2. Criar Preferência
$body = @{
    order_id = "test-001"
    customer_name = "João"
    customer_email = "joao@test.com"
    customer_phone = "85987654321"
    items = @(@{name = "Produto"; quantity = 1; price = 500})
    subtotal = 500
    delivery_fee = 14
    card_tax = 12.50
    total = 526.50
} | ConvertTo-Json

curl -Uri 'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/create-preference' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body $body `
  -UseBasicParsing

# 3. Pega o preference_id da resposta e usa em:
# https://sandbox.mercadopago.com/checkout/v2/{preference_id}
```

---

## 🔐 CREDENCIAIS

```
Variável de Ambiente: MERCADO_PAGO_ACCESS_TOKEN
Valor: APP_USR-1349681792235867-101315-9bdb6622ece8bf412b3cc0fdfb4dc4e3-3759519861

Variável de Ambiente: MERCADO_PAGO_PUBLIC_KEY
Valor: APP_USR-c1eddfc7-1f52-418f-883c-489e8a96a656

⚠️ NUNCA expor no código!
```

---

## 💡 DICAS

### Teste com cartão fictício:
```
Número:     4111111111111111
Expiração:  12/25
CVV:        123
Resultado:  APROVADO ✅
```

### Para rejeitado:
```
Número:     5555555555554444
Resultado:  REJEITADO ❌
```

### Para pendente:
```
Número:     4002992278666662
Resultado:  PENDENTE ⏳
```

---

## ⚡ NO LOVABLE

```javascript
// Chamar endpoint
const response = await fetch(
  'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/create-preference',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: `order-${Date.now()}`,
      customer_name: formData.nome,
      customer_email: formData.email,
      customer_phone: formData.telefone,
      items: [{name: "Produtos", quantity: 1, price: subtotal}],
      subtotal,
      delivery_fee,
      card_tax,
      total
    })
  }
);

const resultado = await response.json();

// Redirecionar para Mercado Pago
window.location.href = resultado.data.sandbox_checkout_url;
```

---

## ✅ RESULTADO ESPERADO

```
User clica "Pagar"
        ↓
Lovable chama /create-preference
        ↓
Backend envia para Mercado Pago
        ↓
Retorna checkout_url
        ↓
User redirecionado para Mercado Pago
        ↓
User paga com cartão
        ↓
Mercado Pago confirma
        ↓
Webhook notifica seu backend
        ↓
Pedido criado no banco
        ↓
User retorna para /success
        ↓
✅ ORDEM COMPLETA
```

---

**Versão:** 1.0  
**Última atualização:** 13/10/2026

