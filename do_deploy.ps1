$ftpHost = "site64208.siteasp.net"
$user = "site64208"
$pass = "8Jz@!k9Ys3P_"
$localPath = "d:\Projects\project v\dddd\SmartTrafficManagement\publish_output\app_offline.htm"
$remoteFile = "/wwwroot/app_offline.htm"

Write-Host "Uploading app_offline.htm..."
$request = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remoteFile")
$request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
$request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
$request.UseBinary = $true
$fileBytes = [System.IO.File]::ReadAllBytes($localPath)
$request.ContentLength = $fileBytes.Length
$requestStream = $request.GetRequestStream()
$requestStream.Write($fileBytes, 0, $fileBytes.Length)
$requestStream.Close()
$request.GetResponse().Close()

Write-Host "Waiting 5 seconds for IIS to shut down app domain..."
Start-Sleep -Seconds 5

Write-Host "Running deploy_ftp.ps1..."
.\deploy_ftp.ps1

Write-Host "Deleting app_offline.htm..."
$request = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remoteFile")
$request.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
$request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
try { $request.GetResponse().Close() } catch { Write-Host "Could not delete app_offline.htm: $_" }

Write-Host "Deployment completed!"
