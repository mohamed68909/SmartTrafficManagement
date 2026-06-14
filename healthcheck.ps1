try {
    $r = Invoke-WebRequest -Uri 'http://smarttrafficmanagemet.runasp.net/swagger/index.html' -UseBasicParsing -TimeoutSec 90
    Write-Host "Swagger Status: $($r.StatusCode)"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
