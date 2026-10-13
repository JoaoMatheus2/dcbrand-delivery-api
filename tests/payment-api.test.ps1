# ============================================================================
# DC BRAND PAYMENT API - TESTES POWERSHELL
# ============================================================================

# Base URL (mudar conforme necessário)
$BASE_URL = "https://dcbrand-delivery-api-hl25.vercel.app"
# Para local: $BASE_URL = "http://localhost:3002"

# ============================================================================
# 1. HEALTH CHECK - Verificar se API de pagamento está online
# ============================================================================

Write-Host "📋 TESTE 1: Health Check" -ForegroundColor Cyan
Write-Host "GET /api/v1/payments/health" -ForegroundColor Yellow

$response = curl -Uri "$BASE_URL/api/v1/payments/health" -UseBasicParsing
Write-Host $response.Content
Write-Host ""

# Esperado:
# {"status":"ok","timestamp":"2026-10-13T...","mercado_pago":"connected"}

# ============================================================================
# 2. CRIAR PREFERÊNCIA - Moto Boy + PIX
# ============================================================================

Write-Host "💳 TESTE 2: Criar Preferência (Pagamento Moto Boy)" -ForegroundColor Cyan
Write-Host "POST /api/v1/payments/create-preference" -ForegroundColor Yellow

$payload = @{
    order_id = "order-motoboy-001"
    customer_name = "João Silva"
    customer_email = "joao@dcbrand.com"
    customer_phone = "85987654321"
    items = @(
        @{
            name = "Produtos DC Brand"
            quantity = 1
            price = 500.00
            picture_url = "https://dcbrand.lovable.app/logo.png"
        }
    )
    subtotal = 500.00
    delivery_fee = 14.00
    card_tax = 0
    total = 514.00
} | ConvertTo-Json

$response = curl -Uri "$BASE_URL/api/v1/payments/create-preference" `
    -Method POST `
    -Headers @{'Content-Type' = 'application/json'} `
    -Body $payload `
    -UseBasicParsing

Write-Host $response.Content
Write-Host ""

# Esperado:
# {
#   "success": true,
#   "data": {
#     "preference_id": "123456789",
#     "checkout_url": "https://checkout.mercadopago.com/v2/...",
#     "sandbox_checkout_url": "https://sandbox.mercadopago.com/checkout/v2/...",
#     "total": 514.00,
#     "order_id": "order-motoboy-001"
#   }
# }

# ============================================================================
# 3. CRIAR PREFERÊNCIA - SuperFrete + Cartão com taxa
# ============================================================================

Write-Host "💳 TESTE 3: Criar Preferência (Pagamento Cartão + SuperFrete)" -ForegroundColor Cyan
Write-Host "POST /api/v1/payments/create-preference" -ForegroundColor Yellow

$payload = @{
    order_id = "order-superfrete-001"
    customer_name = "Maria Santos"
    customer_email = "maria@dcbrand.com"
    customer_phone = "85988887777"
    items = @(
        @{
            name = "Produtos DC Brand"
            quantity = 1
            price = 500.00
        }
    )
    subtotal = 500.00
    delivery_fee = 30.00
    card_tax = 16.10
    total = 546.10
} | ConvertTo-Json

$response = curl -Uri "$BASE_URL/api/v1/payments/create-preference" `
    -Method POST `
    -Headers @{'Content-Type' = 'application/json'} `
    -Body $payload `
    -UseBasicParsing

Write-Host $response.Content
Write-Host ""

# ============================================================================
# 4. CONSULTAR STATUS DE PAGAMENTO
# ============================================================================

# Pegue o preference_id do teste anterior
$preference_id = "123456789"  # Substituir pelo ID retornado

Write-Host "🔍 TESTE 4: Consultar Status" -ForegroundColor Cyan
Write-Host "GET /api/v1/payments/status/$preference_id" -ForegroundColor Yellow

$response = curl -Uri "$BASE_URL/api/v1/payments/status/$preference_id" -UseBasicParsing
Write-Host $response.Content
Write-Host ""

# Esperado:
# {
#   "success": true,
#   "data": {
#     "preference_id": "123456789",
#     "status": "pending",
#     "total": 514.00,
#     "paid_amount": 0,
#     "external_reference": "order-motoboy-001"
#   }
# }

# ============================================================================
# CARTÕES DE TESTE (Sandbox)
# ============================================================================

Write-Host "🧪 CARTÕES DE TESTE (Mercado Pago Sandbox)" -ForegroundColor Green
Write-Host ""
Write-Host "✅ APROVADO:" -ForegroundColor Green
Write-Host "  Número: 4111111111111111"
Write-Host "  Expiração: 12/25"
Write-Host "  CVV: 123"
Write-Host ""

Write-Host "❌ REJEITADO:" -ForegroundColor Red
Write-Host "  Número: 5555555555554444"
Write-Host "  Expiração: 12/25"
Write-Host "  CVV: 123"
Write-Host ""

Write-Host "⏳ PENDENTE:" -ForegroundColor Yellow
Write-Host "  Número: 4002992278666662"
Write-Host "  Expiração: 12/25"
Write-Host "  CVV: 123"
Write-Host ""

# ============================================================================
# FLOW COMPLETO SUGERIDO
# ============================================================================

Write-Host "🚀 FLOW COMPLETO:" -ForegroundColor Magenta
Write-Host "1. Teste Health Check"
Write-Host "2. Crie uma preferência (TESTE 2 ou TESTE 3)"
Write-Host "3. Copie o sandbox_checkout_url"
Write-Host "4. Abra em navegador: https://sandbox.mercadopago.com/checkout/v2/..."
Write-Host "5. Use cartão de teste (4111111111111111)"
Write-Host "6. Preencha dados e confirme"
Write-Host "7. Webhook deve ser notificado"
Write-Host "8. Pedido deve ser criado no banco"
Write-Host ""

Write-Host "✅ Pronto para testar!" -ForegroundColor Green
