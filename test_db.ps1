try {
    $conn = New-Object System.Data.SqlClient.SqlConnection
    $conn.ConnectionString = "Server=db49949.public.databaseasp.net; Database=db49949; User Id=db49949; Password=Hf6@=5RyY%n3; Encrypt=True; TrustServerCertificate=True; Connect Timeout=15;"
    $conn.Open()
    Write-Host "DB49949: CONNECTED OK"
    $conn.Close()
}
catch {
    Write-Host "DB49949: FAILED - $($_.Exception.Message.Substring(0, [Math]::Min(200, $_.Exception.Message.Length)))"
}

try {
    $conn2 = New-Object System.Data.SqlClient.SqlConnection
    $conn2.ConnectionString = "Server=db48481.public.databaseasp.net; Database=db48481; User Id=db48481; Password=9Kd=?7NseJ!8; Encrypt=False; MultipleActiveResultSets=True; Connect Timeout=15;"
    $conn2.Open()
    Write-Host "DB48481: CONNECTED OK"
    $conn2.Close()
}
catch {
    Write-Host "DB48481: FAILED - $($_.Exception.Message.Substring(0, [Math]::Min(200, $_.Exception.Message.Length)))"
}
