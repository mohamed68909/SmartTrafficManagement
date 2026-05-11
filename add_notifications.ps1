$connString = "Server=db51601.public.databaseasp.net; Database=db51601; User Id=db51601; Password=4a%Yk-N9Co6_; Encrypt=True; TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
try {
    $conn.Open()
    Write-Host "Connected to database."
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "
        INSERT INTO Notifications (Id, UserId, Title, Message, IsRead, CreatedAt, CreatedOnUtc, IsDeleted)
        SELECT NEWID(), Id, 'System Update', 'New features are available! Check the services tab for fuel delivery and tire changes.', 0, GETUTCDATE(), GETUTCDATE(), 0
        FROM AspNetUsers
    "
    $inserted1 = $cmd.ExecuteNonQuery()
    Write-Host "Inserted $inserted1 notifications (System Update)."

    $cmd.CommandText = "
        INSERT INTO Notifications (Id, UserId, Title, Message, IsRead, CreatedAt, CreatedOnUtc, IsDeleted)
        SELECT NEWID(), Id, 'Vehicle Checkup Reminder', 'It''s a good time to check your tire pressure and fluids. Book a service if needed.', 0, GETUTCDATE(), GETUTCDATE(), 0
        FROM AspNetUsers
    "
    $inserted2 = $cmd.ExecuteNonQuery()
    Write-Host "Inserted $inserted2 notifications (Maintenance)."

    $cmd.CommandText = "
        INSERT INTO Notifications (Id, UserId, Title, Message, IsRead, CreatedAt, CreatedOnUtc, IsDeleted)
        SELECT NEWID(), Id, 'Emergency Ready', 'SOS feature is active and fully functional. We are here if you need us.', 0, GETUTCDATE(), GETUTCDATE(), 0
        FROM AspNetUsers
    "
    $inserted3 = $cmd.ExecuteNonQuery()
    Write-Host "Inserted $inserted3 notifications (SOS)."

} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    if ($conn.State -eq 'Open') { $conn.Close() }
}
