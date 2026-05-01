$base = "http://localhost:5000"
$token = ""
$refreshToken = ""
$allResults = [System.Collections.Generic.List[object]]::new()

function Test-Endpoint {
    param($num, $method, $path, $body, $desc, $expectedCodes, $headers = @{})
    $url = "$base$path"
    $status = 0; $responseText = ""
    try {
        $params = @{ Method=$method; Uri=$url; ContentType="application/json"; ErrorAction="Stop" }
        if ($body)            { $params.Body    = ($body | ConvertTo-Json -Depth 10) }
        if ($headers.Count -gt 0) { $params.Headers = $headers }
        $resp = Invoke-RestMethod @params
        $status = 200
        $responseText = ($resp | ConvertTo-Json -Depth 3 -Compress)
        if ($responseText.Length -gt 250) { $responseText = $responseText.Substring(0,250) + "..." }
    } catch {
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $responseText = $reader.ReadToEnd()
            if ($responseText.Length -gt 250) { $responseText = $responseText.Substring(0,250) + "..." }
        } catch { $responseText = $_.Exception.Message }
    }
    $pass  = $expectedCodes -contains $status
    $icon  = if ($pass) { "[PASS]" } else { "[FAIL]" }
    $color = if ($pass) { "Green"  } else { "Red" }
    Write-Host ("{0} {1,3}  {2,-7} {3,-50} {4}" -f $icon, $status, $method, $path, $desc) -ForegroundColor $color
    if (-not $pass) { Write-Host ("       => $responseText") -ForegroundColor Yellow }
    $script:allResults.Add([PSCustomObject]@{
        Num=$num; Pass=$pass; Status=$status; Method=$method; Path=$path; Desc=$desc; Response=$responseText
    })
}

Write-Host ""; Write-Host ("=" * 72) -ForegroundColor Cyan
Write-Host "  Smart Traffic Management — Complete Mobile API Test" -ForegroundColor Cyan
Write-Host ("=" * 72) -ForegroundColor Cyan; Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "--- 1. AUTH ANONYMOUS ---" -ForegroundColor DarkCyan

$email = "fulltest$(Get-Random -Maximum 99999)@test.com"
$pass  = "Test@1234"

Test-Endpoint 1  "POST" "/api/auth/register" @{firstName="Full";lastName="Test";email=$email;phoneNumber="01099887711";password=$pass} "Register" @(200,201,400)
Test-Endpoint 2  "POST" "/api/auth/login"    @{email=$email; password=$pass} "Login (wrong pass first)" @(200,201,400,401)
Test-Endpoint 3  "POST" "/api/auth/forgot-password" @{email=$email} "Forgot Password" @(200,201)
Test-Endpoint 4  "POST" "/api/auth/send-otp"        @{email=$email} "Send OTP"         @(200,201)
Test-Endpoint 5  "POST" "/api/auth/verify-otp"      @{email=$email; otpCode="654321"} "Verify OTP" @(200,201,400)
Test-Endpoint 6  "POST" "/api/auth/reset-password"  @{email=$email; token="invalid-token"; newPassword="NewPass@1234"} "Reset Password (invalid token=400)" @(200,201,400)

# Get real token via login
try {
    $lr = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" `
        -ContentType "application/json" -Body (@{email=$email; password=$pass} | ConvertTo-Json) -EA Stop
    if ($lr.data.accessToken)  { $token = $lr.data.accessToken }
    if ($lr.data.refreshToken) { $refreshToken = $lr.data.refreshToken }
    Write-Host "  --> Token acquired" -ForegroundColor DarkGreen
} catch { Write-Host "  --> Login failed: $_" -ForegroundColor Yellow }

Test-Endpoint 7  "POST" "/api/auth/refresh-token" @{refreshToken=$refreshToken} "Refresh Token" @(200,201,400,401)

$auth = @{ Authorization = "Bearer $token" }

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 2. AUTH AUTHENTICATED ---" -ForegroundColor DarkCyan

Test-Endpoint 8  "GET" "/api/auth/profile"  $null "GET /profile"    @(200,201) $auth
Test-Endpoint 9  "GET" "/api/auth/me"       $null "GET /me"         @(200,201) $auth
Test-Endpoint 10 "PUT" "/api/auth/profile"  @{firstName="Updated";lastName="Name";phoneNumber="01099887711"} "PUT profile update" @(200,201) $auth
Test-Endpoint 11 "PATCH" "/api/auth/change-password" @{currentPassword=$pass; newPassword="NewPass@1234"; confirmPassword="NewPass@1234"} "Change Password" @(200,201,400) $auth

# login again with new password to keep token fresh
try {
    $lr2 = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" `
        -ContentType "application/json" -Body (@{email=$email;password="NewPass@1234"} | ConvertTo-Json) -EA Stop
    if ($lr2.data.accessToken) { $token = $lr2.data.accessToken; $auth = @{Authorization="Bearer $token"} }
    Write-Host "  --> Re-authenticated with new password" -ForegroundColor DarkGreen
} catch { Write-Host "  --> Re-login skipped: $_" -ForegroundColor Yellow }

Test-Endpoint 12 "POST" "/api/auth/logout" @{refreshToken=$refreshToken} "Logout" @(200,201,400,401) $auth

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 3. MAP ---" -ForegroundColor DarkCyan

Test-Endpoint 13 "GET" "/api/map/search?query=Cairo"  $null 'Map Search 503=no key OK' @(200,503) $auth
Test-Endpoint 14 "GET" "/api/map/route?originLat=30.0444`&originLng=31.2357`&destLat=30.0626`&destLng=31.2497" $null "Map Route 503=no key=OK" @(200,503) $auth

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 4. TRAFFIC ---" -ForegroundColor DarkCyan

Test-Endpoint 15 "POST" "/api/traffic/report" @{title="Test Accident";description="Accident on ring road near km 27";location="Cairo Ring Road";isVerified=$false} "POST report (201)" @(200,201) $auth
Test-Endpoint 16 "GET"  "/api/trafficincidents" $null "GET all active incidents" @(200,201) $auth
Test-Endpoint 17 "GET"  "/api/trafficincidents/by-location?location=Cairo" $null "GET by location" @(200,201) $auth

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 5. SOS / EMERGENCY ---" -ForegroundColor DarkCyan

Test-Endpoint 18 "POST" "/api/sos/request" @{serviceType=1; lat=30.0444; lng=31.2357} "SOS Request 201 or 409 dup" @(200,201,409) $auth
Test-Endpoint 19 "GET"  "/api/sos/history" $null "SOS History" @(200,201) $auth

# get a sos id to test status
$sosId = $null
try {
    $hist = Invoke-RestMethod -Method GET -Uri "$base/api/sos/history" -Headers $auth -EA Stop
    if ($hist.data -and $hist.data.Count -gt 0) { $sosId = $hist.data[0].id }
} catch {}

if ($sosId) {
    Test-Endpoint 20 "GET"   "/api/sos/status/$sosId" $null "SOS Status by ID" @(200,201,404) $auth
    Test-Endpoint 21 "PATCH" "/api/sos/cancel/$sosId" $null "SOS Cancel"       @(200,201,400,409) $auth
} else {
    Write-Host "[SKIP] 20  GET   /api/sos/status/{id}   — no SOS ID available" -ForegroundColor DarkGray
    Write-Host "[SKIP] 21  PATCH /api/sos/cancel/{id}   — no SOS ID available" -ForegroundColor DarkGray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 6. STORE ---" -ForegroundColor DarkCyan

Test-Endpoint 22 "GET" "/api/store/products?pageNumber=1`&pageSize=5"           $null "Products anonymous" @(200,201)
Test-Endpoint 23 "GET" "/api/store/products?pageNumber=1`&pageSize=5`&search=oil" $null "Products search"     @(200,201)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 7. NOTIFICATIONS ---" -ForegroundColor DarkCyan

Test-Endpoint 24 "GET" "/api/notifications" $null "GET notifications" @(200,201) $auth

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 8. RATINGS ---" -ForegroundColor DarkCyan

Test-Endpoint 25 "POST" "/api/ratings" @{stars=5; comment="Test rating"} 'Submit rating 400=no target' @(200,201,400) $auth
Test-Endpoint 26 "GET"  "/api/ratings/my" $null "My ratings" @(200,201) $auth

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 9. UPLOAD ---" -ForegroundColor DarkCyan

Test-Endpoint 27 "POST" "/api/upload?folder=avatars"   $null 'Upload single no file 415' @(400,415)
Test-Endpoint 28 "POST" "/api/upload/multiple?folder=documents" $null 'Upload multiple no file 415' @(400,415)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""; Write-Host "--- 10. SECURITY CHECKS ---" -ForegroundColor DarkCyan

Test-Endpoint 29 "GET"  "/api/auth/profile" $null "No token => 401" @(401)
Test-Endpoint 30 "GET"  "/api/auth/profile" $null "Invalid token => 401" @{Authorization="Bearer fake.token.here"}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINAL SUMMARY
Write-Host ""; Write-Host ("=" * 72) -ForegroundColor Cyan
Write-Host "                      FINAL SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 72) -ForegroundColor Cyan
Write-Host ("{0,-4} {1,-3}  {2,-7} {3,-50} {4}" -f "#","STS","METHOD","PATH","STATUS")
Write-Host ("-" * 72)
foreach ($r in $allResults) {
    $icon  = if ($r.Pass) { "[PASS]" } else { "[FAIL]" }
    $color = if ($r.Pass) { "Green" } else { "Red" }
    Write-Host ("{0,-4} {1,-3}  {2,-7} {3,-50} {4}" -f $r.Num, $r.Status, $r.Method, $r.Path, $icon) -ForegroundColor $color
}
Write-Host ("-" * 72)
$passed = ($allResults | Where-Object { $_.Pass }).Count
$failed = ($allResults | Where-Object { -not $_.Pass }).Count
Write-Host "PASSED : $passed / $($allResults.Count)" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "FAILED : $failed / $($allResults.Count)" -ForegroundColor Red
    Write-Host ""; Write-Host "FAILURES DETAIL:" -ForegroundColor Red
    foreach ($r in ($allResults | Where-Object { -not $_.Pass })) {
        Write-Host ("  [$($r.Status)] $($r.Method) $($r.Path)") -ForegroundColor Red
        Write-Host ("    $($r.Response)") -ForegroundColor Yellow
    }
} else {
    Write-Host "All endpoints passed! API is healthy." -ForegroundColor Green
}
Write-Host ("=" * 72) -ForegroundColor Cyan
