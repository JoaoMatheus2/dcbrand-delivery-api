# 🔐 Configurar Mercado Pago no Vercel

## ✅ Variáveis de Ambiente

### PASSO 1: Acessar Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Clique em `dcbrand-delivery-api`
3. Vá em **Settings → Environment Variables**

---

### PASSO 2: Adicionar as 2 variáveis

#### Variável 1: Access Token

- **Key:** `MERCADO_PAGO_ACCESS_TOKEN`
- **Value:** `APP_USR-1349681792235867-101315-9bdb6622ece8bf412b3cc0fdfb4dc4e3-3759519861`
- **Type:** Secret
- **Environments:** ✅ Production

#### Variável 2: Public Key

- **Key:** `MERCADO_PAGO_PUBLIC_KEY`
- **Value:** `APP_USR-c1eddfc7-1f52-418f-883c-489e8a96a656`
- **Type:** Config
- **Environments:** ✅ Production

---

### PASSO 3: Salvar e Redeploy

1. Clique **"Save"** em cada variável
2. Vá em **Deployments**
3. Clique no deployment mais recente
4. Clique **3 pontinhos (...)** → **"Redeploy"**
5. **DESMARQUE** "Use existing Build Cache"
6. Clique **"Redeploy"**
7. Aguarde "Ready" em verde

---

## 🧪 Testar

Após redeploy (30s):

```powershell
# Health check pagamento
curl -Uri 'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/health' -UseBasicParsing

# Deve retornar:
# {"status":"ok","mercado_pago":"connected"}
```

---

## 💡 IMPORTANTE

### NÃO COMMITAR CREDENCIAIS

**Nunca coloque essas variáveis no código!**

```javascript
// ❌ ERRADO
const token = 'APP_USR-1349681792235867...';

// ✅ CORRETO
const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
```

---

### Sandbox vs Produção

**AGORA (Sandbox - Teste):**
```javascript
// API sandbox
const MP_API_BASE = 'https://api.sandbox.mercadopago.com';
// Checkout sandbox
checkout_url = resultado.data.sandbox_checkout_url;
```

**DEPOIS (Produção):**
```javascript
// API produção
const MP_API_BASE = 'https://api.mercadopago.com';
// Checkout produção
checkout_url = resultado.data.checkout_url;
```

---

## 🧪 Cartões de Teste (Sandbox)

**Aprovado:**
```
Número: 4111111111111111
Expiração: 12/25
CVV: 123
```

**Rejeitado:**
```
Número: 5555555555554444
Expiração: 12/25
CVV: 123
```

**Pendente:**
```
Número: 4002992278666662
Expiração: 12/25
CVV: 123
```

---

## 📊 Fluxo Completo

```
1. Cliente preenche checkout (nome, email, endereço)
2. Cliente seleciona entrega (moto boy / superfrete)
3. Cliente seleciona pagamento
4. Cliente clica "Confirmar Pagamento"
   ↓
5. Lovable chama: POST /api/v1/payments/create-preference
   ↓
6. Backend cria preferência Mercado Pago
   ↓
7. Backend retorna checkout_url
   ↓
8. Cliente redirecionado para Mercado Pago
   ↓
9. Cliente preenche dados do cartão
   ↓
10. Cliente completa pagamento
   ↓
11. Mercado Pago notifica webhook
    (POST /api/v1/payments/webhook)
   ↓
12. Backend atualiza status do pedido
   ↓
13. Cliente redirecionado para /success
```

---

## ✅ Checklist

- [ ] Access Token adicionado no Vercel
- [ ] Public Key adicionado no Vercel
- [ ] Redeploy executado
- [ ] Health check retorna "connected"
- [ ] Lovable chamando endpoint de pagamento
- [ ] Checkout Mercado Pago aparecendo
- [ ] Pagamento com cartão de teste funcionando
- [ ] Webhook recebendo notificações
- [ ] Pedido sendo criado no banco de dados

---

## 🚀 Próximo: Integrar no Lovable

Veja **MERCADO-PAGO-INTEGRATION.md** para código do checkout!

