$baseUrl = 'https://smarttrafficmanagement.runasp.net/api'
$token = ""

Write-Host ""
Write-Host "=== Test 1: Login (HTTPS) ===" 
$body = '{"email":"driver@test.com","password":"Driver@123"}'
try {
    $loginResp = Invoke-WebRequest -Uri "$baseUrl/Auth/login" -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.accessToken
    $user = $loginData.data.user
    Write-Host "  OK: Login 200 - $($user.firstName) $($user.lastName)"
}
catch {
    Write-Host "  FAIL: Login"
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host ""
Write-Host "=== Test 2: Get Profile ==="
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/Auth/profile" -Headers $headers -UseBasicParsing
    $d = ($r.Content | ConvertFrom-Json).data
    Write-Host "  OK: Profile 200 - $($d.firstName) $($d.lastName) | Email: $($d.email)"
}
catch {
    Write-Host "  FAIL: Profile - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test 3: Get Garage (Vehicles) ==="
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/garage" -Headers $headers -UseBasicParsing
    $d = ($r.Content | ConvertFrom-Json)
    Write-Host "  OK: Garage 200 - $($d.data.Count) vehicle(s)"
    $d.data | ForEach-Object { Write-Host "    - $($_.make) $($_.model) $($_.year) [$($_.plateNumber)]" }
}
catch {
    Write-Host "  FAIL: Garage - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test 4: Get Products (Store) ==="
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/store/products" -UseBasicParsing
    $d = ($r.Content | ConvertFrom-Json)
    Write-Host "  OK: Products 200 - $($d.data.items.Count) product(s)"
    $d.data.items | Select-Object -First 3 | ForEach-Object { Write-Host "    - $($_.name) ($($_.price))" }
}
catch {
    Write-Host "  FAIL: Products - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test 5: Get My Orders ==="
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/orders/my" -Headers $headers -UseBasicParsing
    $d = ($r.Content | ConvertFrom-Json)
    Write-Host "  OK: Orders 200 - $($d.data.Count) order(s)"
}
catch {
    Write-Host "  FAIL: Orders - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test 6: Get Payment Cards ==="
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/payments/cards" -Headers $headers -UseBasicParsing
    $d = ($r.Content | ConvertFrom-Json)
    Write-Host "  OK: Cards 200 - $($d.data.Count) card(s)"
}
catch {
    Write-Host "  FAIL: Cards - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test 7: Stripe Config ==="
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/payments/stripe/config" -UseBasicParsing
    $d = ($r.Content | ConvertFrom-Json)
    $pk = $d.data.publishableKey
    if ($pk -and $pk.Length -gt 10) {
        Write-Host "  OK: Stripe Config 200 - pk: $($pk.Substring(0,20))..."
    }
    else {
        Write-Host "  WARN: Stripe PublishableKey is empty!"
    }
}
catch {
    Write-Host "  FAIL: Stripe Config - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== ALL TESTS DONE ==="
