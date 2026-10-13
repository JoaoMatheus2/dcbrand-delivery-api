# 💳 Integração Mercado Pago - Lovable Checkout

## 📋 Dados da Conta

```
Access Token: APP_USR-1349681792235867-101315-9bdb6622ece8bf412b3cc0fdfb4dc4e3-3759519861
Public Key:   APP_USR-c1eddfc7-1f52-418f-883c-489e8a96a656
User ID:      3759519861
Ambiente:     SANDBOX (teste)
```

---

## 🚀 FLUXO DE PAGAMENTO

### 1️⃣ ETAPA 3 (Lovable - Frontend)

```javascript
// Quando cliente clica "Prosseguir para pagamento"

const handlePagamento = async () => {
  // Dados do cliente
  const dados_pagamento = {
    order_id: `order-${Date.now()}`,
    customer_name: form.nome,
    customer_email: form.email,
    customer_phone: form.telefone,
    items: [
      {
        name: "Produtos DC Brand",
        quantity: 1,
        price: subtotal,
        picture_url: "https://dcbrand.lovable.app/products.jpg"
      }
    ],
    subtotal: subtotal,
    delivery_fee: delivery_fee,
    card_tax: card_tax,
    total: total
  };

  // Chamar seu backend para criar preferência
  const response = await fetch('https://seu-backend.com/api/v1/payments/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados_pagamento)
  });

  const resultado = await response.json();
  
  if (resultado.success) {
    // Redirecionar para checkout Mercado Pago
    window.location.href = resultado.data.checkout_url;
    // Ou para sandbox:
    // window.location.href = resultado.data.sandbox_checkout_url;
  }
};
```

---

### 2️⃣ BACKEND (Node.js - Seu servidor)

```javascript
POST /api/v1/payments/create-preference
Content-Type: application/json

{
  "order_id": "order-1791930000000",
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "customer_phone": "85987654321",
  "items": [
    {
      "name": "Produtos DC Brand",
      "quantity": 1,
      "price": 500.00
    }
  ],
  "subtotal": 500.00,
  "delivery_fee": 14.00,
  "card_tax": 12.50,
  "total": 526.50
}

// Resposta:
{
  "success": true,
  "data": {
    "preference_id": "123456789",
    "checkout_url": "https://checkout.mercadopago.com/v2/123456789",
    "sandbox_checkout_url": "https://sandbox.mercadopago.com/checkout/v2/123456789",
    "total": 526.50
  }
}
```

---

### 3️⃣ MERCADO PAGO (Redirect)

Cliente é redirecionado para:
```
https://sandbox.mercadopago.com/checkout/v2/123456789
```

Lá ele:
- ✅ Confirma dados
- ✅ Seleciona forma de pagamento
- ✅ Completa pagamento

---

### 4️⃣ WEBHOOK (Confirmação)

Mercado Pago envia notificação para:
```
POST https://seu-backend.com/api/v1/payments/webhook?type=payment&data.id=123456789
```

Seu backend:
- ✅ Recebe notificação
- ✅ Consulta status na API Mercado Pago
- ✅ Atualiza pedido no banco de dados
- ✅ Envia email de confirmação

---

### 5️⃣ REDIRECIONAMENTO (Return)

Após pagamento, cliente é redirecionado para:
```
https://dcbrand.lovable.app/checkout/success  (aprovado)
https://dcbrand.lovable.app/checkout/failure  (rejeitado)
https://dcbrand.lovable.app/checkout/pending  (pendente)
```

---

## 🔧 COMO IMPLEMENTAR NO LOVABLE

### PASSO 1: Adicionar SDK Mercado Pago

No `<head>` do Lovable:
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

---

### PASSO 2: Criar componente de pagamento

```javascript
// Em seu componente de checkout - ETAPA 3

import { useState } from 'react';

export function PagamentoStep() {
  const [loading, setLoading] = useState(false);

  const handlePagamento = async () => {
    setLoading(true);

    const payload = {
      order_id: `order-${Date.now()}`,
      customer_name: "João Silva",
      customer_email: "joao@example.com",
      customer_phone: "85987654321",
      items: [{ name: "Compra DC Brand", quantity: 1, price: 500 }],
      subtotal: 500,
      delivery_fee: 14,
      card_tax: 12.50,
      total: 526.50
    };

    try {
      const response = await fetch(
        'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/create-preference',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const resultado = await response.json();

      if (resultado.success) {
        // Redirecionar para checkout
        window.location.href = resultado.data.sandbox_checkout_url; // TESTE
        // Depois mudar para:
        // window.location.href = resultado.data.checkout_url; // PRODUÇÃO
      } else {
        alert('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar ao servidor de pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Confirmação de Pagamento</h2>
      <p>Total: R$ 526,50</p>
      <button onClick={handlePagamento} disabled={loading}>
        {loading ? 'Processando...' : 'Ir para Pagamento'}
      </button>
    </div>
  );
}
```

---

## 📱 TESTE COM CARTÃO FICTÍCIO

**Cartão de teste Mercado Pago:**
```
Número: 4111111111111111
Expiração: 12/25
CVV: 123
```

---

## ✅ Checklist Implementação

- [ ] Adicionar SDK Mercado Pago no Lovable
- [ ] Criar componente de pagamento (ETAPA 3)
- [ ] Testar com cartão fictício
- [ ] Confirmar redirecionamento para Mercado Pago
- [ ] Confirmar return URL após pagamento
- [ ] Testar webhook
- [ ] Adicionar tratamento de erro
- [ ] Mudar para produção (remover sandbox)

---

## 🔗 Links Úteis

- **Docs Mercado Pago:** https://www.mercadopago.com.br/developers
- **Dashboard:** https://www.mercadopago.com.br/business
- **Painel de testes:** https://www.mercadopago.com.br/settings/applications

---

## 💡 Próximos Passos

1. ✅ Integrar pagamento no Lovable
2. ✅ Testar com cartão fictício
3. ✅ Criar banco de dados de pedidos
4. ✅ Admin panel para gerenciar pedidos
5. ✅ Email de confirmação

