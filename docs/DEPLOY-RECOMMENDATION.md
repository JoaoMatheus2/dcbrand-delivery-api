# 🚀 Deploy - Opções Seguras e Econômicas

## 📊 Comparativo: Segurança + Economia

| Opção | Custo | Segurança | Escala | Recomendação |
|-------|-------|-----------|--------|--------------|
| **Vercel** | FREE | ⭐⭐⭐⭐⭐ | Alta | ✅ MELHOR |
| **Render** | FREE/5$ | ⭐⭐⭐⭐ | Média | ✅ Alternativa boa |
| **Railway** | PAY-AS-YOU-GO | ⭐⭐⭐⭐ | Alta | ✅ Flexível |
| **AWS Lambda** | FREE tier + pago | ⭐⭐⭐⭐⭐ | Altíssima | ❌ Overkill |
| **DigitalOcean** | $5-12/mês | ⭐⭐⭐⭐ | Alta | ⚠️ Requer config |
| **Heroku** | $7/mês | ⭐⭐⭐⭐ | Alta | ❌ Descontinuado |

---

## 🏆 RECOMENDAÇÃO #1: VERCEL (Grátis + Seguro)

### Por quê?
- ✅ **FREE TIER completo** para essa API
- ✅ **Serverless** (sem custo de servidor ocioso)
- ✅ **SSL/HTTPS automático** (segurança)
- ✅ **CI/CD automático** (deploy ao fazer push)
- ✅ **Variáveis de ambiente seguras**
- ✅ **Escalabilidade ilimitada** (sem pagar extra)
- ✅ **Suporte a Node.js** nativo
- ✅ **Logs e monitoring** inclusos

### Custo
```
0 = Grátis
(pode escalar para $20/mês se virar mega sucesso)
```

### Setup (15 minutos)

#### 1. Criar repositório GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/dcbrand-delivery-api.git
git push -u origin main
```

#### 2. Conectar Vercel
```bash
npm i -g vercel
vercel
# Siga as instruções no terminal
# Escolha: Import GitHub project
```

#### 3. Configurar variáveis de ambiente
No Vercel Dashboard:
- Projeto → Settings → Environment Variables
- Adicione:
  ```
  CORREIOS_USER=seu_usuario
  CORREIOS_PASSWORD=sua_senha
  CORREIOS_CONTRACT=seu_contrato
  CORS_ORIGIN=https://dcbrand.lovable.app
  ```

#### 4. Deploy automático
```bash
# Apenas faça push e pronto
git push origin main
# Vercel auto-deploya
```

### URL Gerada
```
https://dcbrand-delivery-api.vercel.app
```

### Configurar no Lovable
```javascript
const API = 'https://dcbrand-delivery-api.vercel.app';
```

---

## 🥈 ALTERNATIVA #2: RENDER (Grátis com Free Tier)

### Setup (10 minutos)
1. https://render.com
2. Conecte seu GitHub
3. Crie novo "Web Service"
4. Selecione seu repositório
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Adicione variáveis de ambiente
7. Deploy

### Custo
```
FREE tier com limitações (mínimo)
$5/mês para produção estável
```

### URL Gerada
```
https://dcbrand-api.onrender.com
```

---

## 🥉 ALTERNATIVA #3: RAILWAY (Pay-as-you-go)

### Vantagens
- Ótima para começar pequeno
- Paga só o que usa
- Suporte 24/7
- Fácil de escalar

### Custo
```
Grátis até $5/mês de uso
(para essa API provavelmente fica < $2/mês)
```

### Setup
1. https://railway.app
2. Conecte GitHub
3. Escolha seu repositório
4. Selecione Node.js
5. Configure variáveis
6. Deploy

---

## 🔒 SEGURANÇA - Checklist

- [x] **Variáveis de Ambiente**: Nunca commitar `.env` (usar `.env.example`)
- [x] **HTTPS/SSL**: Automático em Vercel, Render, Railway
- [x] **CORS**: Configurado apenas para domínios Lovable
- [x] **Rate Limiting**: Implementar no futuro (opcional)
- [x] **Validação de Input**: Já feita (CEP, bairro, valor)
- [x] **Error Handling**: Sim, não expõe dados sensíveis
- [x] **Logs**: Configurar logging estruturado (futuro)

### Segurança Extra (Futuro)

```javascript
// Adicionar ao delivery-api.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // max 100 requisições por 15min
});

app.use('/api/', limiter);
```

---

## 📈 Escalabilidade

### Fase 1 (Agora)
- API serverless + cache em memória
- ~1000 req/min sem problema
- Custo: **R$ 0**

### Fase 2 (Quando crescer)
- Adicionar PostgreSQL ($15/mês)
- Manter API em Vercel ($0-20)
- Custo: **R$ 15-50/mês**

### Fase 3 (Mega escala)
- CDN ($10/mês)
- Banco de dados gerenciado ($50/mês)
- Custo: **R$ 50-150/mês**

---

## 🚀 PASSO A PASSO - DEPLOY VERCEL

### Prerequisitos
- GitHub account (grátis)
- Vercel account (grátis)

### 1. Preparar código
```bash
# Crie um repositório Git
git init

# Criar .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
*.log
EOF

# Committar
git add .
git commit -m "Initial: DC Brand Delivery API"
```

### 2. Fazer push para GitHub
```bash
# GitHub → New Repository (ex: dcbrand-delivery-api)
git remote add origin https://github.com/seu-usuario/dcbrand-delivery-api.git
git branch -M main
git push -u origin main
```

### 3. Conectar com Vercel
```bash
# Opção A: CLI
npm i -g vercel
vercel

# Opção B: Website
# 1. Acesse vercel.com
# 2. Sign in com GitHub
# 3. Clique "Import Project"
# 4. Selecione seu repositório
# 5. Configure variáveis de ambiente
# 6. Deploy
```

### 4. Configurar Variáveis
```
CORREIOS_USER = seu_usuario_correios
CORREIOS_PASSWORD = sua_senha_correios
CORREIOS_CONTRACT = seu_contrato
CORREIOS_CEP_ORIGEM = 50010020
CORS_ORIGIN = https://dcbrand-test.lovable.app,https://dcbrand.lovable.app
NODE_ENV = production
PORT = 3001
```

### 5. Testar Deploy
```bash
# Vercel vai gerar uma URL como:
# https://dcbrand-delivery-api.vercel.app

# Testar health check:
curl https://dcbrand-delivery-api.vercel.app/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "neighborhoods": "ok",
    "correios": "ready (mock)",
    "cache": "ok"
  }
}
```

### 6. Atualizar Lovable
```javascript
// Em Lovable, altere:
const API_BASE_URL = 'https://dcbrand-delivery-api.vercel.app';

// De:
const API_BASE_URL = 'http://localhost:3001';
```

### 7. Auto-Deploy
```bash
# De agora em diante, apenas faça:
git push origin main

# Vercel automatically deploys em 30-60s
```

---

## ⚠️ IMPORTANTE

### NÃO COMMITTAR
```bash
❌ .env (com senhas)
❌ node_modules/
❌ logs/
```

### SEMPRE COMMITTAR
```bash
✅ .env.example (sem senhas)
✅ .gitignore
✅ package.json
✅ package-lock.json (ou yarn.lock)
✅ código fonte
```

---

## 📊 Custo Anual Estimado

### Cenário 1: Startup (0-100 pedidos/dia)
```
Vercel:     R$ 0
Correios:   R$ 0 (integração em sandbox)
TOTAL:      R$ 0/ano ✅
```

### Cenário 2: Crescimento (100-1000 pedidos/dia)
```
Vercel:     R$ 0-300/ano
PostgreSQL: R$ 180/ano
Correios:   R$ 50-200/ano (variável)
TOTAL:      R$ 230-500/ano ✅
```

### Cenário 3: Escala (1000+ pedidos/dia)
```
Vercel:     R$ 240/ano
PostgreSQL: R$ 600/ano
CDN:        R$ 120/ano
Correios:   R$ 200-500/ano (variável)
TOTAL:      R$ 1160-1500/ano ✅
```

---

## 🎯 RESUMO FINAL

### Escolha: **VERCEL**

**Por quê:**
1. ✅ Grátis (não paga nada agora)
2. ✅ Segurança de nível empresarial
3. ✅ Auto-deploy (push → live em 1 min)
4. ✅ Escalável (crescer sem custo até 100k req/mês)
5. ✅ Suporte 24/7
6. ✅ Integrado com Lovable (ambos cloud)

**Próximos passos:**
1. Prepare repositório Git
2. Push para GitHub
3. Deploy em Vercel (5 minutos)
4. Configure Lovable para usar URL Vercel
5. Pronto! 🎉

---

## 📞 Suporte

**Vercel:** https://vercel.com/support  
**Render:** https://render.com/docs  
**Railway:** https://railway.app/docs  

---

**Recomendação final:** Deploy no Vercel HOJE. Grátis, seguro, rápido! 🚀

