$b="http://localhost:5000"; $ok=0; $fail=0; $R=@()
function T($n,$m,$u,$body,$d,$ec,$h=@{}) {
    $url="$b$u"; $st=0; $txt=""
    try {
        $p=@{Method=$m;Uri=$url;ContentType="application/json";ErrorAction="Stop"}
        if($body){$p.Body=($body|ConvertTo-Json -Depth 5)}
        if($h.Count){$p.Headers=$h}
        $r=Invoke-RestMethod @p; $st=200
        $txt=($r|ConvertTo-Json -Compress -Depth 3); if($txt.Length -gt 150){$txt=$txt.Substring(0,150)+"..."}
    } catch {
        if($_.Exception.Response){$st=[int]$_.Exception.Response.StatusCode}
        try{$stream=$_.Exception.Response.GetResponseStream();$rd=[IO.StreamReader]::new($stream);$txt=$rd.ReadToEnd();if($txt.Length -gt 150){$txt=$txt.Substring(0,150)+"..."}}catch{}
    }
    $p2=$ec -contains $st; $ico=if($p2){"[OK]"}else{"[!!]"}; $c=if($p2){"Green"}else{"Red"}
    Write-Host ("  {0} {1,3} {2,-5} {3,-40} {4}" -f $ico,$st,$m,$u,$d) -ForegroundColor $c
    if(-not $p2){Write-Host ("         $txt") -ForegroundColor Yellow}
    $script:R+=[PSCustomObject]@{N=$n;P=$p2;S=$st;M=$m;U=$u;D=$d}
    if($p2){$script:ok++}else{$script:fail++}
}

function Get-Tok($em, $pw) {
    try {
        $lr=Invoke-RestMethod -Method POST -Uri "$b/api/auth/login" -ContentType "application/json" -Body (@{email=$em;password=$pw}|ConvertTo-Json) -EA Stop
        return $lr.data.accessToken
    } catch { Write-Host "    Login failed for $em" -ForegroundColor Yellow; return $null }
}

Write-Host ""; Write-Host "=== SMART TRAFFIC BACKEND - FULL SYSTEM TEST ===" -ForegroundColor Cyan; Write-Host ""

# 1. Admin
Write-Host "--- ADMIN ---" -ForegroundColor DarkCyan
$adminTok = Get-Tok "admin@test.com" "Admin@123"
if ($adminTok) {
    $ah = @{Authorization="Bearer $adminTok"}
    T 1 "GET" "/api/admin/dashboard/summary" $null "Admin Dashboard" @(200) $ah
    T 2 "GET" "/api/admin/users" $null "Admin Users List" @(200) $ah
    T 3 "GET" "/api/admin/providers" $null "Admin Providers List" @(200) $ah
    T 4 "GET" "/api/admin/tickets/recent" $null "Admin Recent Tickets" @(200) $ah
    T 5 "GET" "/api/admin/approvals" $null "Admin Approvals List" @(200) $ah
    T 6 "GET" "/api/admin/system-status" $null "Admin System Status" @(200) $ah
}

# 2. Provider
Write-Host "`n--- PROVIDER ---" -ForegroundColor DarkCyan
$provTok = Get-Tok "provider@test.com" "Provider@123"
if ($provTok) {
    $ph = @{Authorization="Bearer $provTok"}
    T 7 "GET" "/api/provider/dashboard" $null "Provider Dashboard" @(200) $ph
    T 8 "GET" "/api/provider/jobs/available" $null "Provider Available Jobs" @(200) $ph
    T 9 "GET" "/api/provider/earnings" $null "Provider Earnings" @(200) $ph
    T 10 "GET" "/api/provider/schedule" $null "Provider Schedule" @(200) $ph
}

# 3. Seller
Write-Host "`n--- SELLER ---" -ForegroundColor DarkCyan
$sellTok = Get-Tok "seller@test.com" "Seller@123"
if ($sellTok) {
    $sh = @{Authorization="Bearer $sellTok"}
    T 11 "GET" "/api/seller/dashboard" $null "Seller Dashboard" @(200) $sh
    T 12 "GET" "/api/seller/products" $null "Seller Products List" @(200) $sh
    T 13 "GET" "/api/seller/orders" $null "Seller Orders List" @(200) $sh
    T 14 "GET" "/api/seller/analytics" $null "Seller Analytics" @(200) $sh
    T 15 "GET" "/api/seller/store" $null "Seller Store Info" @(200) $sh
}

# 4. CS Agent
Write-Host "`n--- CS AGENT ---" -ForegroundColor DarkCyan
$csTok = Get-Tok "cs@test.com" "CSAgent@123"
if ($csTok) {
    $ch = @{Authorization="Bearer $csTok"}
    T 16 "GET" "/api/cs/drivers/search" $null "CS Driver Search" @(200,400) $ch
    T 17 "POST" "/api/cs/agent/status" @{isActive=$true} "CS Agent Status" @(200) $ch
}

# 5. Client (Cart & Orders)
Write-Host "`n--- CLIENT (CART & ORDERS) ---" -ForegroundColor DarkCyan
$clientEmail = "client$(Get-Random -Max 999)@test.com"
Invoke-RestMethod -Method POST -Uri "$b/api/auth/register" -ContentType "application/json" -Body (@{firstName="Test";lastName="Client";email=$clientEmail;phoneNumber="01011111111";password="Test@1234"}|ConvertTo-Json) -EA SilentlyContinue | Out-Null
$cliTok = Get-Tok $clientEmail "Test@1234"
if ($cliTok) {
    $clih = @{Authorization="Bearer $cliTok"}
    T 18 "GET" "/api/cart" $null "Get Empty Cart" @(200) $clih
    
    # Try getting a product to add to cart
    $products = Invoke-RestMethod -Method GET -Uri "$b/api/store/products?pageSize=1" -EA SilentlyContinue
    if ($products -and $products.data -and $products.data.Count -gt 0) {
        $pid = $products.data[0].id
        T 19 "POST" "/api/cart/items" @{productId=$pid; quantity=1} "Add item to Cart" @(200,201) $clih
    } else {
        Write-Host "    [SKIP] POST /api/cart/items (No products available)" -ForegroundColor DarkGray
    }
    
    T 20 "GET" "/api/orders/my" $null "Get My Orders" @(200) $clih
}

# 6. Global Access (Sensors, Weather, etc.)
Write-Host "`n--- SYSTEM & OPEN ENDPOINTS ---" -ForegroundColor DarkCyan
T 21 "GET" "/api/admin/sensors" $null "Sensors List (Admin Only)" @(401,403)
if ($adminTok) {
    T 22 "GET" "/api/admin/sensors" $null "Sensors List (Admin)" @(200) @{Authorization="Bearer $adminTok"}
}
T 23 "GET" "/api/weather?lat=30.044&lng=31.235" $null "Weather Current" @(200,503) $clih
T 24 "GET" "/api/garage" $null "User Garage" @(200) $clih

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host ("  PASSED: $ok    FAILED: $fail    TOTAL: $($ok+$fail)") -ForegroundColor $(if($fail -eq 0){"Green"}else{"Yellow"})
Write-Host "=======================================================" -ForegroundColor Cyan
if($fail -gt 0){
    Write-Host "FAILURES:" -ForegroundColor Red
    $R | Where-Object {-not $_.P} | ForEach-Object { Write-Host ("  [$($_.S)] $($_.M) $($_.U)") -ForegroundColor Red }
}
