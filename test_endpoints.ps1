
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$BASE = "https://smarttrafficmanagemet.runasp.net/api"
$TOKEN = $null
$results = @()

function Req {
    param($method, $endpoint, $body = $null, $token = $null)
    $url = "$BASE$endpoint"
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        $wc = New-Object System.Net.WebClient
        $wc.Headers["Content-Type"] = "application/json"
        if ($token) { $wc.Headers["Authorization"] = "Bearer $token" }
        if ($method -eq "GET") {
            $resp = $wc.DownloadString($url)
            return @{ code = 200; body = $resp }
        } else {
            $bodyStr = if ($body) { $body | ConvertTo-Json } else { "{}" }
            $resp = $wc.UploadString($url, $method, $bodyStr)
            return @{ code = 200; body = $resp }
        }
    } catch [System.Net.WebException] {
        $code = [int]$_.Exception.Response.StatusCode
        return @{ code = $code; body = $_.Exception.Message }
    } catch {
        return @{ code = 0; body = $_.Exception.Message }
    }
}

function Run-Test {
    param($label, $method, $endpoint, $body = $null, $useToken = $false)
    $tok = if ($useToken) { $TOKEN } else { $null }
    $r = Req $method $endpoint $body $tok
    $status = if ($r.code -eq 200) { "200 OK    " } 
              elseif ($r.code -eq 401) { "401 UNAUTH" }
              elseif ($r.code -eq 404) { "404 NOTFND" }
              elseif ($r.code -eq 400) { "400 BADREQ" }
              elseif ($r.code -eq 500) { "500 ERROR " }
              else { "$($r.code)       " }
    $color = if ($r.code -eq 200) { "Green" } elseif ($r.code -in 401,404) { "Yellow" } else { "Red" }
    Write-Host ("  [{0}] {1,-8} {2}" -f $status, $method, $endpoint) -ForegroundColor $color
    return @{ label = $label; code = $r.code; method = $method; ep = $endpoint }
}

# ====== LOGIN ======
Write-Host "=== LOGIN ===" -ForegroundColor Cyan
$emails = @(
    @{email="admin@smart.com"; password="Admin@1234"},
    @{email="admin@admin.com"; password="Admin@1234"},
    @{email="test@test.com"; password="Test@1234"},
    @{email="user@smart.com"; password="User@1234"}
)
foreach ($cred in $emails) {
    $r = Req "POST" "/Auth/login" $cred
    if ($r.code -eq 200) {
        $parsed = $r.body | ConvertFrom-Json
        $TOKEN = $parsed.data.accessToken
        if (!$TOKEN) { $TOKEN = $parsed.data.token }
        Write-Host "  Logged in as $($cred.email) - Token OK" -ForegroundColor Green
        break
    } else {
        Write-Host "  Failed $($cred.email): $($r.code)" -ForegroundColor Yellow
    }
}

if (!$TOKEN) {
    Write-Host "  Trying Register..." -ForegroundColor Yellow
    $rand = Get-Random -Minimum 1000 -Maximum 99999
    $phoneRand = Get-Random -Minimum 1000000 -Maximum 9999999
    $regBody = @{ email = "apitest${rand}@smart.com"; password = "Test@12345"; fullName = "Tester"; phoneNumber = "+201${phoneRand}" }
    $r = Req "POST" "/Auth/register" $regBody
    if ($r.code -eq 200) {
        $parsed = $r.body | ConvertFrom-Json
        $TOKEN = $parsed.data.accessToken
        if (!$TOKEN) { $TOKEN = $parsed.data.token }
        Write-Host "  Registered OK - Token: $($TOKEN.Substring(0, [Math]::Min(30, $TOKEN.Length)))..." -ForegroundColor Green
    } else {
        Write-Host "  Register failed: $($r.code) - $($r.body)" -ForegroundColor Red
    }
}

if ($TOKEN) {
    Write-Host "  Token acquired successfully!" -ForegroundColor Green
} else {
    Write-Host "  NO TOKEN - protected endpoints will return 401" -ForegroundColor Red
}

# ====== TESTS ======
Write-Host ""
Write-Host "=== ENDPOINT TESTS ===" -ForegroundColor Cyan

Write-Host "[PUBLIC]" -ForegroundColor White
$results += Run-Test "Products"        "GET"  "/store/products"
$results += Run-Test "Categories"      "GET"  "/store/categories"
$results += Run-Test "Send OTP"        "POST" "/Auth/send-otp"        @{email="test@test.com"}
$results += Run-Test "Forgot Password" "POST" "/Auth/forgot-password" @{email="test@test.com"}

Write-Host "[AUTH]" -ForegroundColor White
$results += Run-Test "Profile"         "GET"  "/Auth/profile"         $null $true

Write-Host "[NOTIFICATIONS]" -ForegroundColor White
$results += Run-Test "Notifications"   "GET"  "/notifications"        $null $true

Write-Host "[GARAGE]" -ForegroundColor White
$results += Run-Test "Garage List"     "GET"  "/garage"               $null $true

Write-Host "[SOS]" -ForegroundColor White
$results += Run-Test "SOS History"     "GET"  "/sos/history"          $null $true

Write-Host "[TRAFFIC]" -ForegroundColor White
$results += Run-Test "Traffic Incidents"   "GET" "/trafficincidents"                      $null $true
$results += Run-Test "Traffic By Location" "GET" "/trafficincidents/by-location?location=Cairo" $null $true

Write-Host "[CART]" -ForegroundColor White
$results += Run-Test "Cart"       "GET" "/cart"       $null $true

Write-Host "[RATINGS]" -ForegroundColor White
$results += Run-Test "My Ratings" "GET" "/ratings/my" $null $true

Write-Host "[SUPPORT]" -ForegroundColor White
$results += Run-Test "My Tickets"  "GET" "/support/tickets/my" $null $true

Write-Host "[ORDERS]" -ForegroundColor White
$results += Run-Test "My Orders"   "GET" "/orders/my"          $null $true

Write-Host "[PAYMENTS]" -ForegroundColor White
$results += Run-Test "Cards"         "GET" "/payments/cards"        $null $true
$results += Run-Test "Stripe Config" "GET" "/payments/stripe/config" $null $true
$results += Run-Test "History"       "GET" "/payments/history"       $null $true

Write-Host "[DIAGNOSTICS]" -ForegroundColor White
$results += Run-Test "Diagnostics Start" "GET" "/diagnostics/start"  $null $true

Write-Host "[SENSORS]" -ForegroundColor White
$results += Run-Test "Vehicle Env" "GET" "/sensors/vehicle-env?vehicleId=00000000-0000-0000-0000-000000000000" $null $true

# ====== SUMMARY ======
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
$ok   = @($results | Where-Object { $_.code -eq 200 })
$fail = @($results | Where-Object { $_.code -ne 200 })

Write-Host "WORKING ($($ok.Count)):" -ForegroundColor Green
foreach ($r in $ok) { Write-Host "  - $($r.method) $($r.ep)" -ForegroundColor Green }

Write-Host "FAILING ($($fail.Count)):" -ForegroundColor Red
foreach ($r in $fail) { Write-Host "  - [$($r.code)] $($r.method) $($r.ep)" -ForegroundColor Red }

Write-Host ""
Write-Host "Total: $($ok.Count) OK / $($results.Count) Tested" -ForegroundColor Cyan
