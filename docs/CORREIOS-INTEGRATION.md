# Integração Correios - Guia Rápido

## 📋 Setup

### 1. Contato Correios
- Email: comercial@correios.com.br
- Telefone: 3003-0100
- Solicite: "Integração API e-Commerce"

### 2. Dados que você vai receber
- Usuário (CNPJ)
- Senha
- Número do contrato
- Acesso ao sandbox

### 3. Configurar .env
```bash
CORREIOS_USER=seu_usuario
CORREIOS_PASSWORD=sua_senha
CORREIOS_CONTRACT=seu_contrato
CORREIOS_CEP_ORIGEM=50010020
```

## 🔌 Endpoints Correios

```bash
# PAC (mais barato)
service: "04014"  # ~10 dias

# SEDEX (rápido)
service: "40010"  # 1-2 dias

# SEDEX 10
service: "40045"  # até 10 dígitos
```

## 🧪 Testar

```bash
# Sandbox (antes de produção)
CORREIOS_BASE_URL=https://api-sandbox.correios.com.br/api

# Testes com CEPs:
# Recife: 50010-020
# São Paulo: 01310-100
# Brasília: 70000-000
```

## ⚙️ Ativar Integração Real

No arquivo `delivery-api.js`, procure por `calculateCorreiosFrete` e substitua a mock por:

```javascript
const response = await axios.post(
  `${CORREIOS_API.BASE_URL}/v1/pricing/price`,
  {
    cepDestino: cepDestino,
    vlrMaoPropria: totalValue,
    psObjeto: weightKg * 1000,
    codServico: service,
    usuario: process.env.CORREIOS_USER,
    senha: process.env.CORREIOS_PASSWORD,
    contratoPK: process.env.CORREIOS_CONTRACT
  }
);
```

## 📊 Custos Estimados

- PAC: R$ 25-50 (+ peso)
- SEDEX: R$ 40-80 (+ peso)
- Valor declarado: +1% (acima R$ 100)

**Refs:** https://www.correios.com.br/business/

