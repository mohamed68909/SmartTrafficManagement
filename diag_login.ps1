try {
    $body = '{"email":"driver@test.com","password":"Driver@123"}'
    $r = Invoke-WebRequest -Uri 'https://smarttrafficmanagement.runasp.net/api/Auth/login' -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 120
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content.Substring(0, [Math]::Min(500, $r.Content.Length)))"
}
catch {
    Write-Host "HTTP Status: $($_.Exception.Response.StatusCode.value__)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errBody"
    }
    catch {
        Write-Host "Could not read error body: $($_.Exception.Message)"
    }
}
