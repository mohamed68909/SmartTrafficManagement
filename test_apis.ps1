$ProgressPreference = 'SilentlyContinue'
$baseUrl = "https://smarttrafficmanagement.runasp.net"

Write-Output "Authenticating as Admin..."
$loginBody = @{ email = "admin@test.com"; password = "Admin@123" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method Post -Body $loginBody -ContentType "application/json"

if (-not $loginRes.data.accessToken) {
    Write-Error "Failed to authenticate"
    exit
}
$token = $loginRes.data.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Output "Authenticating as Driver..."
$loginBodyDriver = @{ email = "driver@test.com"; password = "Driver@123" } | ConvertTo-Json
$loginResDriver = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method Post -Body $loginBodyDriver -ContentType "application/json"
$tokenDriver = $loginResDriver.data.accessToken
$headersDriver = @{ Authorization = "Bearer $tokenDriver" }

$endpoints = Get-Content "endpoints_report.txt" | Where-Object { $_ -match "^GET " } | ForEach-Object {
    $parts = $_ -split " "
    $parts[1]
}

"| Endpoint | Role | Status Code | Result |" | Out-File "api_test_results.md" -Encoding utf8
"|---|---|---|---|" | Out-File "api_test_results.md" -Encoding utf8 -Append

foreach ($ep in $endpoints) {
    if ($ep -match "{id}" -or $ep -match "{cartItemId}" -or $ep -match "{requestId}" -or $ep -match "{orderId}" -or $ep -match "{ticketId}") {
        "| GET $ep | Skipped | N/A | Requires ID |" | Out-File "api_test_results.md" -Encoding utf8 -Append
        continue
    }

    $useHeaders = $headers
    $role = "Admin"
    if ($ep -match "/my" -or $ep -match "/profile" -or $ep -match "/garage" -or $ep -match "/payments/" -or $ep -match "/TrafficIncidents" -or $ep -match "sos/history" -or $ep -match "Auth/me" -or $ep -match "map/") {
        $useHeaders = $headersDriver
        $role = "Driver"
    }

    Write-Output "Testing GET $ep ..."
    try {
        $res = Invoke-WebRequest -Uri "$baseUrl$ep" -Method Get -Headers $useHeaders -ErrorAction Stop -TimeoutSec 5
        $code = $res.StatusCode
        $status = "OK"
        "| GET $ep | $role | $code | $status |" | Out-File "api_test_results.md" -Encoding utf8 -Append
    } catch {
        $code = "Timeout/Error"
        if ($_.Exception.Response) {
            $code = $_.Exception.Response.StatusCode.value__
        }
        $status = "FAILED"
        if ($code -eq 403) { $status = "FORBIDDEN" }
        if ($code -eq 401) { $status = "UNAUTHORIZED" }
        if ($code -eq 500) { $status = "SERVER ERROR" }
        "| GET $ep | $role | $code | $status |" | Out-File "api_test_results.md" -Encoding utf8 -Append
    }
}
Write-Output "DONE!"
