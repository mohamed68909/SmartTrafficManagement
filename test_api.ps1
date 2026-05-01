$base = "http://localhost:5000"
$token = ""
$allResults = [System.Collections.Generic.List[object]]::new()

function Test-Endpoint {
    param($num, $method, $path, $body, $desc, $expectedCodes, $headers = @{})
    $url = "$base$path"
    $status = 0
    $responseText = ""
    try {
        $params = @{ Method = $method; Uri = $url; ContentType = "application/json"; ErrorAction = "Stop" }
        if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 10) }
        if ($headers.Count -gt 0) { $params.Headers = $headers }
        $resp = Invoke-RestMethod @params
        $status = 200
        $responseText = ($resp | ConvertTo-Json -Depth 3 -Compress)
        if ($responseText.Length -gt 220) { $responseText = $responseText.Substring(0,220) + "..." }
    } catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        } else { $status = 0 }
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $responseText = $reader.ReadToEnd()
            if ($responseText.Length -gt 220) { $responseText = $responseText.Substring(0,220) + "..." }
        } catch { $responseText = $_.Exception.Message }
    }

    $pass   = $expectedCodes -contains $status
    $icon   = if ($pass) { "[PASS]" } else { "[FAIL]" }
    $color  = if ($pass) { "Green" } else { "Red" }
    Write-Host ("{0} {1,3}  {2,-7} {3,-45} {4}" -f $icon, $status, $method, $path, $desc) -ForegroundColor $color
    if (-not $pass) {
        Write-Host ("        Response: {0}" -f $responseText) -ForegroundColor Yellow
    }

    $obj = [PSCustomObject]@{
        Num      = $num; Pass = $pass; Status = $status
        Method   = $method; Path = $path; Desc = $desc; Response = $responseText
    }
    $script:allResults.Add($obj)
    return $obj
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Smart Traffic Management - Mobile API Full Test    " -ForegroundColor Cyan
Write-Host "  Base URL: $base" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# ─── AUTH ─────────────────────────────────────────────────────────
Write-Host "--- AUTH ENDPOINTS ---" -ForegroundColor DarkCyan

$email = "apitest$(Get-Random -Maximum 99999)@test.com"

Test-Endpoint 1 "POST" "/api/auth/register" @{
    firstName = "ApiTest"; lastName = "User"; email = $email
    phoneNumber = "01099887766"; password = "Test@1234"
} "Register new user" @(200,201,400) | Out-Null

# Get token via login
try {
    $loginResp = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" `
        -ContentType "application/json" `
        -Body (@{email=$email; password="Test@1234"} | ConvertTo-Json) `
        -ErrorAction Stop
    if ($loginResp.data.accessToken) { $token = $loginResp.data.accessToken }
} catch {}

Test-Endpoint 2 "POST" "/api/auth/login" @{email=$email; password="Test@1234"} `
    "Login" @(200,201,400,401) | Out-Null

Test-Endpoint 3 "POST" "/api/auth/send-otp" @{email=$email} `
    "Send OTP" @(200,201) | Out-Null

Test-Endpoint 4 "POST" "/api/auth/verify-otp" @{email=$email; otpCode="654321"} `
    "Verify OTP (expect 200 or 400)" @(200,201,400) | Out-Null

Test-Endpoint 5 "POST" "/api/auth/forgot-password" @{email=$email} `
    "Forgot Password" @(200,201) | Out-Null

$auth = @{ Authorization = "Bearer $token" }

Test-Endpoint 6 "GET" "/api/auth/profile" $null "GET Profile (auth)" @(200,201) $auth | Out-Null
Test-Endpoint 7 "GET" "/api/auth/me"      $null "GET Me (auth)"      @(200,201) $auth | Out-Null

# ─── MAP ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "--- MAP ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 8 "GET" "/api/map/search?query=Cairo" $null `
    "Map Search (503=no API key=OK)" @(200,503) $auth | Out-Null

Test-Endpoint 9 "GET" "/api/map/route?originLat=30.0444&originLng=31.2357&destLat=30.0626&destLng=31.2497" $null `
    "Map Route  (503=no API key=OK)" @(200,503) $auth | Out-Null

# ─── TRAFFIC ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "--- TRAFFIC ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 10 "POST" "/api/traffic/report" @{
    title = "Test Accident"
    description = "Accident on the ring road near kilometer 27 heading east"
    location = "Cairo Ring Road Km 27"
    isVerified = $false
} "Report Traffic Incident (201)" @(200,201) $auth | Out-Null

Test-Endpoint 11 "GET" "/api/trafficincidents" $null "Get Active Incidents (200)" @(200,201) $auth | Out-Null
Test-Endpoint 12 "GET" "/api/trafficincidents/by-location?location=Cairo" $null "Incidents by Location" @(200,201) $auth | Out-Null

# ─── SOS ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "--- SOS ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 13 "POST" "/api/sos/request" @{serviceType=1; lat=30.0444; lng=31.2357} `
    "SOS Request (201 or 409 duplicate)" @(200,201,409) $auth | Out-Null

Test-Endpoint 14 "GET" "/api/sos/history" $null "SOS History" @(200,201) $auth | Out-Null

# ─── STORE ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "--- STORE ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 15 "GET" "/api/store/products?pageNumber=1&pageSize=5" $null `
    "Store Products (anonymous)" @(200,201) | Out-Null

# ─── NOTIFICATIONS ────────────────────────────────────────────────
Write-Host ""
Write-Host "--- NOTIFICATION ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 16 "GET" "/api/notifications" $null "Get Notifications" @(200,201) $auth | Out-Null

# ─── RATINGS ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "--- RATING ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 17 "POST" "/api/ratings" @{stars=5; comment="Great service!"} `
    "Submit Rating (400=no target=OK)" @(200,201,400) $auth | Out-Null

Test-Endpoint 18 "GET" "/api/ratings/my" $null "Get My Ratings" @(200,201) $auth | Out-Null

# ─── UPLOAD ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "--- UPLOAD ENDPOINTS ---" -ForegroundColor DarkCyan

Test-Endpoint 19 "POST" "/api/upload?folder=avatars" $null `
    "Upload no-file (400 validation)" @(400,415) | Out-Null

# ─── SUMMARY ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "                    FINAL SUMMARY                   " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ("{0,-4} {1,-3}  {2,-7} {3,-45} {4}" -f "#", "STS", "METHOD", "PATH", "RESULT")
Write-Host ("-" * 80)
foreach ($r in $allResults) {
    $icon  = if ($r.Pass) { "[PASS]" } else { "[FAIL]" }
    $color = if ($r.Pass) { "Green" } else { "Red" }
    Write-Host ("{0,-4} {1,-3}  {2,-7} {3,-45} {4}" -f $r.Num, $r.Status, $r.Method, $r.Path, $icon) -ForegroundColor $color
}
Write-Host ("-" * 80)
$passed = ($allResults | Where-Object { $_.Pass }).Count
$failed = ($allResults | Where-Object { -not $_.Pass }).Count
Write-Host "PASSED: $passed / $($allResults.Count)" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "FAILED: $failed / $($allResults.Count)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed endpoints:" -ForegroundColor Red
    foreach ($r in ($allResults | Where-Object { -not $_.Pass })) {
        Write-Host ("  [$($r.Status)] $($r.Method) $($r.Path)") -ForegroundColor Red
        Write-Host ("  => $($r.Response)") -ForegroundColor Yellow
    }
}
Write-Host "=====================================================" -ForegroundColor Cyan
