$ftpHost = "site68169.siteasp.net"
$user = "site68169"
$pass = "bX-9#3AxwY!7"

$request = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
$request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
$request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)

try {
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    while ($line = $reader.ReadLine()) {
        Write-Host $line
    }
    $reader.Close()
    $response.Close()
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
}
