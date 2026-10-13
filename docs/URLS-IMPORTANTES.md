# 🔗 URLs E LINKS IMPORTANTES

## 🚀 PRODUÇÃO

**API Delivery + Pagamento:**  
📍 https://dcbrand-delivery-api-hl25.vercel.app

**Lovable (Produção):**  
📍 https://dcbrand.lovable.app

**Lovable (Teste):**  
📍 https://dcbrand-test.lovable.app

---

## 🛠️ DASHBOARD & CONTROLE

**Vercel Dashboard:**  
📍 https://vercel.com/dashboard

**Vercel - Projeto DC Brand API:**  
📍 https://vercel.com/dashboard/projects

**GitHub Repository:**  
📍 https://github.com/JoaoMatheus2/dcbrand-delivery-api

**Lovable Project:**  
📍 https://lovable.dev/projects/lovp_51mfc350ag8bm88tvjrpgf0h7z

---

## 💳 MERCADO PAGO

**Painel Mercado Pago:**  
📍 https://www.mercadopago.com.br/business

**Configurações / Aplicações:**  
📍 https://www.mercadopago.com.br/settings/applications

**Documentação:**  
📍 https://www.mercadopago.com.br/developers

**Checkout Sandbox (depois de criar preferência):**  
📍 https://sandbox.mercadopago.com/checkout/v2/{preference_id}

**Checkout Produção:**  
📍 https://checkout.mercadopago.com/v2/{preference_id}

---

## 📊 CREDENCIAIS

```
┌─ MERCADO PAGO ─────────────────────────────────────┐
│                                                     │
│ User ID:        3759519861                         │
│ App ID:         134968179223587                    │
│                                                     │
│ Access Token:   APP_USR-1349681792235867-...       │
│                 (salvo em Vercel)                  │
│                                                     │
│ Public Key:     APP_USR-c1eddfc7-1f52-418f-...     │
│                 (salvo em Vercel)                  │
│                                                     │
│ Ambiente:       🟢 SANDBOX (testes)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 INTEGRAÇÃO FLOW

```
LOVABLE
https://dcbrand-test.lovable.app/checkout
         ↓ (formulário checkout)
         ↓ (botão "Ir para Pagamento")
         ↓
API PAGAMENTO
https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/create-preference
         ↓
MERCADO PAGO
https://checkout.mercadopago.com/v2/{preference_id}
         ↓
WEBHOOK
https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/webhook
         ↓
BANCO DE DADOS
(Pedido criado)
```

---

## 🧪 TESTES

**Health Check API:**
```
GET https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/health
```

**Cartão Fictício (Sandbox):**
```
Número:     4111111111111111
Expiração:  12/25
CVV:        123
```

**Mergulho Rápido:**
```
https://sandbox.mercadopago.com/checkout/v2/
(cole o preference_id aqui)
```

---

## 📝 DOCUMENTAÇÃO GERADA

### Principais (LEIA ESSES)
- 📄 `PROXIMOS-PASSOS.md` - Timeline de implementação
- 📄 `MERCADO-PAGO-RESUMO.md` - Resumo executivo
- 📄 `MERCADO-PAGO-INTEGRATION.md` - Código Lovable

### Referência Completa
- 📄 `PAYMENT-IMPLEMENTATION-GUIDE.md` - Guia passo a passo
- 📄 `MERCADO-PAGO-SETUP.md` - Configurar Vercel
- 📄 `ENDPOINTS-PAGAMENTO.md` - Referência de endpoints

### Código
- 💾 `payment-api.js` - API pagamento
- 💾 `delivery-payment-api-INTEGRADO.js` - Versão completa

### Testes
- 🧪 `payment-api.test.ps1` - Testes PowerShell

---

## ☁️ VERCEL - ENV VARS

Adicionar em: https://vercel.com/dashboard → dcbrand-delivery-api → Settings → Environment Variables

```
MERCADO_PAGO_ACCESS_TOKEN
= APP_USR-1349681792235867-101315-9bdb6622ece8bf412b3cc0fdfb4dc4e3-3759519861

MERCADO_PAGO_PUBLIC_KEY
= APP_USR-c1eddfc7-1f52-418f-883c-489e8a96a656

SUPERFRETE_API_KEY
= (já está configurado)

CORREIOS_CEP_ORIGEM
= 50010020 (já está)

CORS_ORIGIN
= https://dcbrand-test.lovable.app,https://dcbrand.lovable.app (já está)
```

---

## 🔐 SEGURANÇA

⚠️ **NUNCA fazer isso:**
```javascript
// ❌ ERRADO
const token = 'APP_USR-1349681792235867...';
```

✅ **SEMPRE fazer isso:**
```javascript
// ✅ CORRETO
const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
```

---

## 🆘 SUPORTE

**Mercado Pago Docs:**  
https://www.mercadopago.com.br/developers

**Vercel Docs:**  
https://vercel.com/docs

**Express.js Docs:**  
https://expressjs.com

**Lovable Help:**  
https://lovable.dev/help

---

## 📞 CONTATOS

**DC Brand:**
- Proprietário: João
- Telefone: 81 99107-4103
- Email: dccbrand10@gmail.com
- Instagram: @dccbrand

**GitHub:**
- Account: JoaoMatheus2
- Repo: dcbrand-delivery-api

---

## ✅ QUICK LINKS

| Preciso de... | Link |
|---|---|
| Pagar| https://checkout.mercadopago.com/v2 |
| Configurar| https://vercel.com/dashboard |
| Editar site | https://lovable.dev/projects/lovp_51mfc350ag8bm88tvjrpgf0h7z |
| Gerenciar API | https://github.com/JoaoMatheus2/dcbrand-delivery-api |
| Docs Mercado Pago | https://www.mercadopago.com.br/developers |
| Testar API | PowerShell (curl) |

---

## 🚀 COMANDE RÁPIDO

```powershell
# Testar API
curl -Uri 'https://dcbrand-delivery-api-hl25.vercel.app/api/v1/payments/health' -UseBasicParsing

# Resultado esperado:
# {"status":"ok","mercado_pago":"connected"}
```

---

**Versão:** 1.0  
**Última atualização:** 13/10/2026  
**Status:** ✅ COMPLETO

