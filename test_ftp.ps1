$ftpHost = "site64208.siteasp.net"
$user = "site64208"
$pass = "8Jz@!k9Ys3P_"

$request = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
$request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
$request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)

try {
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    Write-Host "Connection Successful. Files on root:"
    while ($line = $reader.ReadLine()) {
        Write-Host $line
    }
    $reader.Close()
    $response.Close()
} catch {
    Write-Host "Connection Failed: $($_.Exception.Message)"
}
