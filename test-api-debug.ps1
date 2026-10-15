#!/usr/bin/env pwsh

# =========================================================
# 🧪 DC BRAND - API TEST SCRIPT COM DEBUG
# =========================================================

Write-Host "`n🚀 Iniciando testes da API DC Brand...`n" -ForegroundColor Cyan

$baseUrl = "https://dcbrand-delivery-api-hl25.vercel.app"

# =========================================================
# TESTE 1: Health Check
# =========================================================

Write-Host "📋 TESTE 1: Health Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Status: OK" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $healthResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# =========================================================
# TESTE 2: Deliveries - Listar Bairros
# =========================================================

Write-Host "`n📋 TESTE 2: Listar Bairros (Moto Boy)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

try {
    $neighborhoodsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/deliveries/neighborhoods" -Method GET
    Write-Host "✅ Bairros carregados: $($neighborhoodsResponse.Count)" -ForegroundColor Green
    Write-Host "Primeiros 3:" -ForegroundColor Cyan
    $neighborhoodsResponse | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - ID: $($_.id) | Nome: $($_.name) | Preço: R$ $($_.price)"
    }
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# =========================================================
# TESTE 3: Calcular Entrega Moto Boy
# =========================================================

Write-Host "`n📋 TESTE 3: Calcular Entrega (Moto Boy)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

try {
    $deliveryBody = @{
        type = "motoboy"
        neighborhood_id = 1
        total_value = 100
    } | ConvertTo-Json

    $deliveryResponse = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/deliveries/quote" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $deliveryBody

    Write-Host "✅ Entrega calculada!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $deliveryResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Body enviado:" -ForegroundColor Gray
    Write-Host $deliveryBody -ForegroundColor Gray
}

# =========================================================
# TESTE 4: Criar Preference (PAGAMENTO)
# =========================================================

Write-Host "`n📋 TESTE 4: Criar Preference (Mercado Pago)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

$paymentBody = @{
    order_id = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    customer_name = "João Teste"
    customer_email = "joao@teste.com"
    customer_phone = "(85) 98888-8888"
    items = @(@{
        name = "Produtos DC Brand"
        quantity = 1
        price = 100
    })
    subtotal = 100
    delivery_fee = 20
    card_tax = 0
    total = 120
} | ConvertTo-Json

Write-Host "📤 Enviando:" -ForegroundColor Cyan
$paymentBody | Write-Host

try {
    $paymentResponse = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/payments/create-preference" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $paymentBody `
        -ErrorAction Stop

    Write-Host "`n✅ Preference criada!" -ForegroundColor Green
    Write-Host "📥 Response completa:" -ForegroundColor Cyan
    $paymentResponse | ConvertTo-Json | Write-Host
    
    if ($paymentResponse.sandbox_checkout_url) {
        Write-Host "`n🔗 URL de Checkout:" -ForegroundColor Green
        Write-Host $paymentResponse.sandbox_checkout_url
        Write-Host "`n💡 Dica: Copie a URL acima e abra no navegador!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    # Tentar ler a resposta de erro
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "`n📌 Detalhes do erro:" -ForegroundColor Cyan
        Write-Host $errorBody
    } catch {}
}

# =========================================================
# TESTE 5: Health Check Payment
# =========================================================

Write-Host "`n📋 TESTE 5: Health Check - Pagamento" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

try {
    $paymentHealthResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/payments/health" -Method GET
    Write-Host "✅ Status Pagamento:" -ForegroundColor Green
    $paymentHealthResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# =========================================================
# RESUMO
# =========================================================

Write-Host "`n" -ForegroundColor Gray
Write-Host "═════════════════════════════════════════" -ForegroundColor Gray
Write-Host "🎯 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "═════════════════════════════════════════" -ForegroundColor Gray
Write-Host "
Se tudo passou com ✅:
  1. API está respondendo corretamente
  2. Mercado Pago está configurado
  3. Endpoints estão funcionando

Se algum falhou com ❌:
  1. Verifique internet
  2. Confira se Vercel está up (https://vercel.com/status)
  3. Verifique variáveis de ambiente em Vercel
  4. Veja logs em: https://vercel.com/dashboard/dcbrand-delivery-api

Próximo passo:
  → Cole o PROMPT-LOVABLE-CHECKOUT-MP-ONLY.md no Lovable
  → Teste o checkout completo
" -ForegroundColor Yellow

Write-Host "✅ Testes finalizados!" -ForegroundColor Green
