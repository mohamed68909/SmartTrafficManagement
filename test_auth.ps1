
# =====================================================
# Auth Endpoints Test Script - SmartTrafficManagement
# Tests all endpoints under /api/auth
# =====================================================

$BASE_URL = "http://localhost:5164"
$PASS     = $false
$FAIL     = $false

# ── helpers ──────────────────────────────────────────
function Write-Header($title) {
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor DarkCyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════" -ForegroundColor DarkCyan
}

function Invoke-Test {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Body,
        [hashtable]$Headers,
        [int[]]$ExpectedCodes = @(200,201)
    )

    $h = @{ "Content-Type" = "application/json" }
    if ($Headers) { $Headers.GetEnumerator() | ForEach-Object { $h[$_.Key] = $_.Value } }

    $jsonBody = if ($Body) { $Body | ConvertTo-Json -Depth 5 } else { $null }

    try {
        $params = @{
            Method             = $Method
            Uri                = $Url
            Headers            = $h
            ErrorAction        = "Stop"
        }
        if ($jsonBody) { $params["Body"] = $jsonBody }

        $response = Invoke-WebRequest @params
        $status   = $response.StatusCode
        $content  = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue

        if ($status -in $ExpectedCodes) {
            Write-Host "  [PASS] $Name  →  $status" -ForegroundColor Green
            return $content
        } else {
            Write-Host "  [FAIL] $Name  →  $status  (expected $($ExpectedCodes -join '/'))" -ForegroundColor Red
            Write-Host "         Body: $($response.Content)" -ForegroundColor DarkRed
            return $content
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $body       = ""
        try { $body = $_.ErrorDetails.Message } catch {}

        # treat 400/401/409 as expected for negative tests
        if ($statusCode -in $ExpectedCodes) {
            Write-Host "  [PASS] $Name  →  $statusCode" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $Name  →  $statusCode / $($_.Exception.Message)" -ForegroundColor Red
            if ($body) { Write-Host "         Body: $body" -ForegroundColor DarkRed }
        }
        return $null
    }
}

# ── wait for API to be ready ──────────────────────────
Write-Host ""
Write-Host "⏳  Waiting for API to start..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        Invoke-WebRequest -Uri "$BASE_URL/swagger/v1/swagger.json" -ErrorAction Stop | Out-Null
        $ready = $true
        break
    } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) {
    Write-Host "❌  API did not start in time. Make sure 'dotnet run' is running on port 5164." -ForegroundColor Red
    exit 1
}
Write-Host "✅  API is up!" -ForegroundColor Green

# ── generate a unique test user ───────────────────────
$ts    = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "testuser$ts@mail.com"
$pass  = "Test@12345"
$accessToken  = ""
$refreshToken = ""

# ═════════════════════════════════════════════════════
Write-Header "1. REGISTER (new user)"
# ═════════════════════════════════════════════════════
$reg = Invoke-Test -Name "Register new user" -Method POST -Url "$BASE_URL/api/auth/register" `
    -Body @{ email=$email; password=$pass; firstName="Test"; lastName="User"; phoneNumber="01012345678" } `
    -ExpectedCodes @(200,201)

if ($reg -and $reg.data -and $reg.data.accessToken) {
    $accessToken  = $reg.data.accessToken
    $refreshToken = $reg.data.refreshToken
    Write-Host "         → Token obtained from register" -ForegroundColor DarkGray
}

# Duplicate register → 409
Invoke-Test -Name "Register duplicate (expect 409)" -Method POST -Url "$BASE_URL/api/auth/register" `
    -Body @{ email=$email; password=$pass; firstName="Test"; lastName="User"; phoneNumber="01012345678" } `
    -ExpectedCodes @(409)

# Invalid role → 400
Invoke-Test -Name "Register invalid role (expect 400)" -Method POST -Url "$BASE_URL/api/auth/register" `
    -Body @{ email="other$ts@mail.com"; password=$pass; firstName="X"; lastName="Y"; phoneNumber="01000000000"; requestedRole="SuperAdmin" } `
    -ExpectedCodes @(400)

# Register as Seller
$sellerEmail = "seller$ts@mail.com"
$sellerReg = Invoke-Test -Name "Register as Seller" -Method POST -Url "$BASE_URL/api/auth/register" `
    -Body @{ email=$sellerEmail; password=$pass; firstName="Seller"; lastName="Test"; phoneNumber="01099999999"; requestedRole="Seller" } `
    -ExpectedCodes @(200,201)

# Register as Provider
$providerEmail = "provider$ts@mail.com"
Invoke-Test -Name "Register as Provider" -Method POST -Url "$BASE_URL/api/auth/register" `
    -Body @{ email=$providerEmail; password=$pass; firstName="Provider"; lastName="Test"; phoneNumber="01088888888"; requestedRole="Provider" } `
    -ExpectedCodes @(200,201)

# Mobile register (forced Client role)
Invoke-Test -Name "Register mobile (forced Client)" -Method POST -Url "$BASE_URL/api/auth/register" `
    -Body @{ email="mobile$ts@mail.com"; password=$pass; firstName="Mobile"; lastName="User"; phoneNumber="01077777777"; requestedRole="Admin" } `
    -Headers @{ "X-Platform" = "mobile" } `
    -ExpectedCodes @(200,201)

# ═════════════════════════════════════════════════════
Write-Header "2. LOGIN"
# ═════════════════════════════════════════════════════
$login = Invoke-Test -Name "Login valid credentials" -Method POST -Url "$BASE_URL/api/auth/login" `
    -Body @{ email=$email; password=$pass } `
    -ExpectedCodes @(200)

if ($login -and $login.data -and $login.data.accessToken) {
    $accessToken  = $login.data.accessToken
    $refreshToken = $login.data.refreshToken
    Write-Host "         → Access Token: $($accessToken.Substring(0,40))..." -ForegroundColor DarkGray
    Write-Host "         → Role: $($login.data.user.role)" -ForegroundColor DarkGray
}

# Wrong password → 401
Invoke-Test -Name "Login wrong password (expect 401)" -Method POST -Url "$BASE_URL/api/auth/login" `
    -Body @{ email=$email; password="WrongPass!" } `
    -ExpectedCodes @(401)

# Non-existent user → 401
Invoke-Test -Name "Login nonexistent user (expect 401)" -Method POST -Url "$BASE_URL/api/auth/login" `
    -Body @{ email="nobody@nowhere.com"; password="Any@1234" } `
    -ExpectedCodes @(401)

# Admin login
$adminLogin = Invoke-Test -Name "Login admin (admin@test.com)" -Method POST -Url "$BASE_URL/api/auth/login" `
    -Body @{ email="admin@test.com"; password="Admin@123" } `
    -ExpectedCodes @(200)

if ($adminLogin -and $adminLogin.data -and $adminLogin.data.user -and $adminLogin.data.user.role) {
    Write-Host "         → Admin Role: $($adminLogin.data.user.role)" -ForegroundColor DarkGray
}

# ═════════════════════════════════════════════════════
Write-Header "3. GET PROFILE (/me & /profile)"
# ═════════════════════════════════════════════════════
if ($accessToken) {
    Invoke-Test -Name "GET /api/auth/me" -Method GET -Url "$BASE_URL/api/auth/me" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -ExpectedCodes @(200)

    Invoke-Test -Name "GET /api/auth/profile" -Method GET -Url "$BASE_URL/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -ExpectedCodes @(200)

    Invoke-Test -Name "GET /api/auth/me (no token - expect 401)" -Method GET -Url "$BASE_URL/api/auth/me" `
        -ExpectedCodes @(401)
} else {
    Write-Host "  [SKIP] No token available for profile tests" -ForegroundColor Yellow
}

# ═════════════════════════════════════════════════════
Write-Header "4. UPDATE PROFILE"
# ═════════════════════════════════════════════════════
if ($accessToken) {
    Invoke-Test -Name "PUT /api/auth/profile" -Method PUT -Url "$BASE_URL/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ firstName="Updated"; lastName="Name"; phoneNumber="01055555555"; address="123 Test St"; profilePicture=$null } `
        -ExpectedCodes @(200)

    Invoke-Test -Name "PUT /api/auth/profile/update" -Method PUT -Url "$BASE_URL/api/auth/profile/update" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ firstName="Updated2"; lastName="Name2"; phoneNumber="01055555556"; address="456 Ave"; profilePicture=$null } `
        -ExpectedCodes @(200)
}

# ═════════════════════════════════════════════════════
Write-Header "5. CHANGE PASSWORD"
# ═════════════════════════════════════════════════════
if ($accessToken) {
    Invoke-Test -Name "PATCH /api/auth/change-password" -Method PATCH -Url "$BASE_URL/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ currentPassword=$pass; newPassword="NewPass@9999" } `
        -ExpectedCodes @(200)

    # Change back to original
    Invoke-Test -Name "PATCH change-password (restore)" -Method PATCH -Url "$BASE_URL/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ currentPassword="NewPass@9999"; newPassword=$pass } `
        -ExpectedCodes @(200)

    # Wrong current password → 400
    Invoke-Test -Name "PATCH change-password wrong current (expect 400)" -Method PATCH -Url "$BASE_URL/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ currentPassword="WrongOld@1"; newPassword="Any@9999" } `
        -ExpectedCodes @(400)
}

# ═════════════════════════════════════════════════════
Write-Header "6. REFRESH TOKEN"
# ═════════════════════════════════════════════════════
if ($refreshToken) {
    $refresh = Invoke-Test -Name "POST /api/auth/refresh-token" -Method POST -Url "$BASE_URL/api/auth/refresh-token" `
        -Body @{ refreshToken=$refreshToken } `
        -ExpectedCodes @(200)

    if ($refresh -and $refresh.data -and $refresh.data.refreshToken) {
        $refreshToken = $refresh.data.refreshToken
        $accessToken  = $refresh.data.accessToken
        Write-Host "         → New token obtained" -ForegroundColor DarkGray
    }

    # Invalid refresh token → 401
    Invoke-Test -Name "POST refresh-token invalid (expect 401)" -Method POST -Url "$BASE_URL/api/auth/refresh-token" `
        -Body @{ refreshToken="totally-fake-token" } `
        -ExpectedCodes @(401)
}

# ═════════════════════════════════════════════════════
Write-Header "7. FORGOT PASSWORD / SEND OTP"
# ═════════════════════════════════════════════════════
Invoke-Test -Name "POST /api/auth/forgot-password" -Method POST -Url "$BASE_URL/api/auth/forgot-password" `
    -Body @{ email=$email } `
    -ExpectedCodes @(200)

Invoke-Test -Name "POST /api/auth/send-otp" -Method POST -Url "$BASE_URL/api/auth/send-otp" `
    -Body @{ email=$email } `
    -ExpectedCodes @(200)

# Non-existent email → 200 (security: never reveal)
Invoke-Test -Name "POST forgot-password (non-existent email → 200)" -Method POST -Url "$BASE_URL/api/auth/forgot-password" `
    -Body @{ email="nobody@nowhere.com" } `
    -ExpectedCodes @(200)

# ═════════════════════════════════════════════════════
Write-Header "8. VERIFY OTP"
# ═════════════════════════════════════════════════════
# Valid 6-digit code (not 123456)
Invoke-Test -Name "POST /api/auth/verify-otp (valid code 654321)" -Method POST -Url "$BASE_URL/api/auth/verify-otp" `
    -Body @{ otpCode="654321" } `
    -ExpectedCodes @(200)

# Invalid code (123456 is rejected by design)
Invoke-Test -Name "POST verify-otp (code=123456 → 400)" -Method POST -Url "$BASE_URL/api/auth/verify-otp" `
    -Body @{ otpCode="123456" } `
    -ExpectedCodes @(400)

# 5-digit → 400
Invoke-Test -Name "POST verify-otp (5-digit → 400)" -Method POST -Url "$BASE_URL/api/auth/verify-otp" `
    -Body @{ otpCode="12345" } `
    -ExpectedCodes @(400)

# ═════════════════════════════════════════════════════
Write-Header "9. RESET PASSWORD"
# ═════════════════════════════════════════════════════
# Bad token → 400
Invoke-Test -Name "POST /api/auth/reset-password (bad token → 400)" -Method POST -Url "$BASE_URL/api/auth/reset-password" `
    -Body @{ email=$email; token="fake-token"; newPassword="Reset@9999" } `
    -ExpectedCodes @(400)

# ═════════════════════════════════════════════════════
Write-Header "10. LOGOUT"
# ═════════════════════════════════════════════════════
if ($refreshToken -and $accessToken) {
    Invoke-Test -Name "POST /api/auth/logout" -Method POST -Url "$BASE_URL/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ refreshToken=$refreshToken } `
        -ExpectedCodes @(200)

    # Logout again (token already revoked → still 200)
    Invoke-Test -Name "POST logout already revoked (→ 200)" -Method POST -Url "$BASE_URL/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -Body @{ refreshToken=$refreshToken } `
        -ExpectedCodes @(200)
}

# ═════════════════════════════════════════════════════
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor DarkCyan
Write-Host "  ✅  All Auth Endpoint Tests Completed!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor DarkCyan
Write-Host ""
