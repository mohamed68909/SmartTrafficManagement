$baseUrl = 'https://smarttrafficmanagement.runasp.net/api'
$token = ""

Write-Host "--- STARTING COMPREHENSIVE PRODUCTION API TEST ---" -ForegroundColor Cyan

function Test-Endpoint($name, $method, $url, $body=$null, $headers=@{}) {
    Write-Host "Testing $name ($method $url)..." -NoNewline
    try {
        $p = @{ Method=$method; Uri="$baseUrl$url"; ContentType='application/json'; UseBasicParsing=$true; TimeoutSec=30 }
        if($body){ $p.Body = $body }
        if($headers.Count -gt 0){ $p.Headers = $headers }
        
        $r = Invoke-WebRequest @p
        Write-Host " [OK] ($($r.StatusCode))" -ForegroundColor Green
        return $r
    } catch {
        $st = if($_.Exception.Response){$_.Exception.Response.StatusCode}else{"Error"}
        Write-Host " [FAIL] ($st)" -ForegroundColor Red
        if ($_.Exception.Response) {
             $stream = $_.Exception.Response.GetResponseStream()
             $reader = New-Object System.IO.StreamReader($stream)
             Write-Host "  Error Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
        }
        return $null
    }
}

# 1. Login
$body = '{"email":"driver@test.com","password":"Driver@123"}'
$loginResp = Test-Endpoint "Login" "POST" "/Auth/login" $body
if ($loginResp) {
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.accessToken
    $headers = @{ Authorization = "Bearer $token" }
} else {
    Write-Host "CRITICAL: Login failed. Stopping tests." -ForegroundColor Red
    exit 1
}

# 2. Auth Profile
Test-Endpoint "Profile" "GET" "/Auth/profile" $null $headers

# 3. Garage (Vehicles)
$garageResp = Test-Endpoint "Garage List" "GET" "/garage" $null $headers
$vehicleId = ""
if ($garageResp) {
    $d = $garageResp.Content | ConvertFrom-Json
    if ($d.data.Count -gt 0) { $vehicleId = $d.data[0].id }
}

# 4. Sensors (New Tracker API)
if ($vehicleId) {
    Test-Endpoint "Sensors Data" "GET" "/sensors/vehicle-env?vehicleId=$vehicleId" $null $headers
} else {
    Write-Host "SKIPPED: Sensors (No vehicle found)" -ForegroundColor Yellow
}

# 5. SOS / Emergency
Test-Endpoint "SOS History" "GET" "/sos/history" $null $headers

# 6. Store & Products
Test-Endpoint "Store Products" "GET" "/store/products"

# 7. Weather
Test-Endpoint "Weather" "GET" "/weather?lat=30.04&lng=31.23" $null $headers

# 8. Maps
Test-Endpoint "Map Search" "GET" "/map/search?query=Cairo" $null $headers

Write-Host "--- TESTS COMPLETED ---" -ForegroundColor Cyan
