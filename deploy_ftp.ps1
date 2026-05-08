$ftpHost = "site64208.siteasp.net"
$user = "site64208"
$pass = "8Jz@!k9Ys3P_"
$localPath = "d:\Projects\project v\dddd\SmartTrafficManagement\publish_output"
$remotePath = "/wwwroot"

function Upload-Folder($localFolder, $remoteFolder) {
    $items = Get-ChildItem $localFolder
    foreach ($item in $items) {
        $remoteItem = "$remoteFolder/$($item.Name)"
        if ($item.PSIsContainer) {
            # Create directory if it doesn't exist
            Write-Host "Creating directory $remoteItem..."
            $request = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remoteItem")
            $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
            try { $request.GetResponse().Close() } catch { }
            
            # Recurse
            Upload-Folder $item.FullName $remoteItem
        } else {
            # Upload file
            Write-Host "Uploading $($item.Name) to $remoteItem..."
            $request = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remoteItem")
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
            $request.UseBinary = $true
            $request.KeepAlive = $false
            
            $fileBytes = [System.IO.File]::ReadAllBytes($item.FullName)
            $request.ContentLength = $fileBytes.Length
            
            try {
                $requestStream = $request.GetRequestStream()
                $requestStream.Write($fileBytes, 0, $fileBytes.Length)
                $requestStream.Close()
                $request.GetResponse().Close()
            } catch {
                Write-Host "Failed to upload $($item.Name): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "Starting deployment to $ftpHost..."
Upload-Folder $localPath $remotePath
Write-Host "Deployment Complete!" -ForegroundColor Green
