# ✅ Checklist de Deploy - DC Brand Delivery API

## 🎯 Tudo que você precisa fazer

### PASSO 1: Setup Local (5 min)
- [ ] Download/extrair `dcbrand-delivery-api.zip`
- [ ] Abrir terminal na pasta
- [ ] Rodar `npm install`
- [ ] Rodar `npm run dev`
- [ ] Testar: `curl http://localhost:3001/health`

### PASSO 2: Preparar Git (5 min)
- [ ] Criar `.gitignore` (já incluso)
- [ ] Rodar `git init`
- [ ] Rodar `git add .`
- [ ] Rodar `git commit -m "Initial commit"`

### PASSO 3: GitHub (5 min)
- [ ] Ir para https://github.com/new
- [ ] Criar repositório `dcbrand-delivery-api`
- [ ] Rodar comandos que aparecem (git remote + git push)
- [ ] Verificar se código está no GitHub

### PASSO 4: Vercel Deploy (5 min)
- [ ] Ir para https://vercel.com
- [ ] Fazer login com GitHub
- [ ] Clicar "Add New Project"
- [ ] Selecionar `dcbrand-delivery-api`
- [ ] Clicar "Import"

### PASSO 5: Configurar Variáveis (2 min)
- [ ] Vercel → Project Settings → Environment Variables
- [ ] Adicionar:
  ```
  CORREIOS_USER = seu_usuario
  CORREIOS_PASSWORD = sua_senha
  CORREIOS_CONTRACT = seu_contrato
  CORREIOS_CEP_ORIGEM = 50010020
  CORS_ORIGIN = https://dcbrand-test.lovable.app,https://dcbrand.lovable.app
  NODE_ENV = production
  ```
- [ ] Clicar "Save"

### PASSO 6: Deploy (30 seg)
- [ ] Vercel → Deployments
- [ ] Clicar "Redeploy"
- [ ] Aguardar "Ready" (em verde)

### PASSO 7: Testar (1 min)
- [ ] Copiar URL do Vercel (ex: https://dcbrand-delivery-api.vercel.app)
- [ ] Testar: `https://seu-dominio.vercel.app/health`
- [ ] Deve retornar `{"status": "ok", ...}`

### PASSO 8: Conectar Lovable (2 min)
- [ ] Lovable → Seu checkout
- [ ] Alterar:
  ```javascript
  // De:
  const API = 'http://localhost:3001';
  
  // Para:
  const API = 'https://seu-dominio.vercel.app';
  ```
- [ ] Testar fluxo de checkout
- [ ] Verificar se dropdown de bairros carrega

### PASSO 9: Testar Produção (5 min)
- [ ] Simular compra completa
- [ ] Testar moto boy (bairro)
- [ ] Testar Correios (CEP externo)
- [ ] Verificar cálculo de taxas

### PASSO 10: Ativar Correios (depois)
- [ ] Contatar Correios: comercial@correios.com.br
- [ ] Receber credenciais
- [ ] Atualizar `.env` no Vercel
- [ ] Auto-redeploy em 30s

---

## 📋 Informações Importantes

### URLs
```
GitHub:   https://github.com/seu-usuario/dcbrand-delivery-api
Vercel:   https://dcbrand-delivery-api.vercel.app (GERADA AUTOMATICAMENTE)
Lovable:  https://dcbrand-test.lovable.app
```

### Comandos Úteis
```bash
# Rodar localmente
npm run dev

# Rodar testes
npm test

# Ver logs do Vercel
vercel logs

# Fazer novo deploy
git push origin main
# Vercel auto-deploya em 30s
```

### Troubleshooting

**❌ "Cannot find module"**
```bash
npm install
npm run dev
```

**❌ "Port 3001 in use"**
```bash
# Alterar porta
PORT=3002 npm run dev
```

**❌ "CORS error"**
- Verificar se URL do Lovable está em CORS_ORIGIN no .env

**❌ "neighborhoods undefined"**
- Verificar se `delivery-neighborhoods.json` está na pasta

**❌ "GET / returns 404"**
- Normal! API não tem rota raiz. Use `/health` ou `/api/v1/...`

---

## 🎉 Sucesso!

Quando você ver:
- ✅ `npm run dev` rodando em porta 3001
- ✅ `curl http://localhost:3001/health` retorna JSON
- ✅ Vercel mostra "Ready" em verde
- ✅ Lovable carregar bairros dinamicamente
- ✅ Checkout calcular taxas

**PRONTO! 🎊 API está VIVA EM PRODUÇÃO**

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| Não carrega bairros | Verificar CORS_ORIGIN no Vercel |
| Erro ao calcular | Ver logs no Vercel Dashboard |
| API lenta | Normal (serverless cold start) |
| Quer escalar | Adicionar PostgreSQL ($15/mês) |

---

**Tempo total: ~30 minutos ⏱️**

**Custo: R$ 0 🎉**

**Risco: ZERO ✅**

Qualquer dúvida, vê `DEPLOY-RECOMMENDATION.md`

