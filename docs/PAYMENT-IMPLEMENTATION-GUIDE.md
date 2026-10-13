# 🚀 Guia de Implementação - Mercado Pago + Lovable

## 📋 RESUMO DO TRABALHO

```
✅ API de Pagamento (Node.js Express)
✅ Endpoints Mercado Pago
✅ Webhook de confirmação
✅ Credenciais configuradas
✅ Testes em PowerShell
```

---

## 🔧 PASSO 1: Preparar o Backend

### A. Fazer merge do código

1. Acesse seu GitHub:
   ```
   https://github.com/JoaoMatheus2/dcbrand-delivery-api
   ```

2. Abra `delivery-api.js` (seu arquivo principal)

3. **Opção 1: Integrar tudo em um arquivo**
   - Copie o código de `payment-api.js` (este arquivo)
   - Cole após o último endpoint de entregas
   - Adicione `const crypto = require('crypto');` no topo se não tiver

4. **Opção 2: Separar em arquivo**
   - Crie `payment-api.js` no repositório
   - Importe em `index.js` ou `app.js`

---

### B. Atualizar dependências

```bash
npm install axios
# Já deve ter: express, cors, helmet, dotenv
```

---

### C. Variáveis de Ambiente (Vercel)

1. Acesse: https://vercel.com/dashboard
2. Clique em `dcbrand-delivery-api`
3. **Settings → Environment Variables**
4. Adicione:

| Key | Value |
|-----|-------|
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-1349681792235867-101315-9bdb6622ece8bf412b3cc0fdfb4dc4e3-3759519861` |
| `MERCADO_PAGO_PUBLIC_KEY` | `APP_USR-c1eddfc7-1f52-418f-883c-489e8a96a656` |

5. Clique **Save**
6. Vá em **Deployments** e faça **Redeploy** do deployment mais recente

---

### D. Testar Backend

Abra PowerShell e teste:

```powershell
# Health check
curl -Uri 'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/health' -UseBasicParsing

# Deve retornar:
# {"status":"ok","mercado_pago":"connected"}
```

---

## 🎨 PASSO 2: Implementar no Lovable

### A. Criar Componente de Pagamento

No Lovable, crie um novo componente:

```javascript
// CheckoutStep3.jsx - PAGAMENTO

import { useState } from 'react';

export function CheckoutStep3({ 
  formData, 
  delivery, 
  subtotal, 
  cardTax, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = subtotal + (delivery?.price || 0) + (cardTax || 0);

  const handlePagamento = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        order_id: `order-${Date.now()}`,
        customer_name: formData.nome,
        customer_email: formData.email,
        customer_phone: formData.telefone,
        items: [
          {
            name: "Produtos DC Brand",
            quantity: 1,
            price: subtotal,
            picture_url: "https://dcbrand.lovable.app/logo.png"
          }
        ],
        subtotal: subtotal,
        delivery_fee: delivery?.price || 0,
        card_tax: cardTax || 0,
        total: total
      };

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
        // ⚠️ IMPORTANTE: Mudar para sandbox_checkout_url em testes
        window.location.href = resultado.data.sandbox_checkout_url;
      } else {
        setError(resultado.error || 'Erro ao processar pagamento');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor de pagamento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-step">
      <h2>💳 Confirmação de Pagamento</h2>

      <div className="resumo-pagamento">
        <div className="linha">
          <span>Subtotal:</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="linha">
          <span>Entrega ({delivery?.method}):</span>
          <span>R$ {(delivery?.price || 0).toFixed(2)}</span>
        </div>
        {cardTax > 0 && (
          <div className="linha">
            <span>Taxa Cartão:</span>
            <span>R$ {cardTax.toFixed(2)}</span>
          </div>
        )}
        <div className="linha total">
          <span>TOTAL:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="erro">❌ {error}</div>
      )}

      <button 
        onClick={handlePagamento} 
        disabled={loading}
        className="btn-pagamento"
      >
        {loading ? '⏳ Processando...' : '💳 Ir para Pagamento'}
      </button>

      <p className="info">
        Você será redirecionado para o Mercado Pago para confirmar o pagamento.
      </p>
    </div>
  );
}
```

---

### B. Integrar com seu Checkout

No componente principal de checkout:

```javascript
import { useState } from 'react';
import { CheckoutStep1 } from './CheckoutStep1';
import { CheckoutStep2 } from './CheckoutStep2';
import { CheckoutStep3 } from './CheckoutStep3';
import { CheckoutStep4 } from './CheckoutStep4';

export function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: ''
  });
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);

  const subtotal = 500; // Calcular a partir do carrinho
  const cardTax = payment?.type === 'cartao' ? subtotal * 0.025 : 0; // 2.5%

  return (
    <div className="checkout">
      {step === 1 && (
        <CheckoutStep1 
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <CheckoutStep2 
          formData={formData}
          delivery={delivery}
          setDelivery={setDelivery}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <CheckoutStep3 
          formData={formData}
          delivery={delivery}
          subtotal={subtotal}
          cardTax={cardTax}
          onSuccess={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <CheckoutStep4 
          formData={formData}
          delivery={delivery}
          subtotal={subtotal}
          cardTax={cardTax}
        />
      )}
    </div>
  );
}
```

---

## 🧪 PASSO 3: Testar Fluxo Completo

### Teste Local

```powershell
# Terminal 1: Rodar backend
npm start

# Terminal 2: Rodar Lovable localmente
# (Depende de como você roda)
```

### Teste em Produção

1. Acesse: https://dcbrand-test.lovable.app/checkout
2. Preencha dados
3. Escolha entrega
4. Clique em "Ir para Pagamento"
5. Você será redirecionado para Mercado Pago
6. Use cartão de teste:
   ```
   Número: 4111111111111111
   Expiração: 12/25
   CVV: 123
   ```
7. Complete o pagamento
8. Será redirecionado para `/checkout/success`

---

## 📊 PASSO 4: Criar Banco de Dados (Opcional)

Para armazenar pedidos, você precisa de:

```sql
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),
  customer_phone VARCHAR(20),
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  card_tax DECIMAL(10,2),
  total DECIMAL(10,2),
  payment_status VARCHAR(20), -- approved, pending, rejected
  delivery_method VARCHAR(20), -- motoboy, superfrete
  created_at TIMESTAMP DEFAULT NOW()
);
```

E adicione ao webhook:

```javascript
// Em POST /api/v1/payments/webhook

if (payment.status === 'approved') {
  // Inserir no banco de dados
  await db.query(
    'INSERT INTO pedidos (...) VALUES (...)',
    [...]
  );
}
```

---

## ✅ CHECKLIST FINAL

- [ ] Backend: Código do payment-api.js integrado
- [ ] Backend: Variáveis de ambiente no Vercel
- [ ] Backend: Redeploy executado
- [ ] Backend: Health check retorna "connected"
- [ ] Lovable: Componente CheckoutStep3 criado
- [ ] Lovable: Chamada para API de pagamento
- [ ] Lovable: Redirecionamento para Mercado Pago funcionando
- [ ] Teste: Pagamento com cartão fictício aprovado
- [ ] Teste: Redirecionamento para /success
- [ ] Banco: Pedido criado (se implementado)

---

## 🚀 Próximos Passos

1. ✅ Admin panel para gerenciar pedidos
2. ✅ Email de confirmação
3. ✅ Tracking de pedidos
4. ✅ Integração com estoque
5. ✅ Sistema de cupons/desconto

---

## 💡 Dúvidas?

Docs: https://www.mercadopago.com.br/developers

