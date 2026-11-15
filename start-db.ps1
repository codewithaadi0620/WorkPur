$pgData = "d:\Freelance MarketPlace\postgres_data"
$pgBin = "C:\Program Files\PostgreSQL\18\bin"

# Check if port 5433 is already open
$tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 5433 -WarningAction SilentlyContinue
if ($tcp.TcpTestSucceeded) {
    Write-Output "PostgreSQL is already running on port 5433."
    exit 0
}

Write-Output "Starting PostgreSQL server on port 5433..."
& "$pgBin\pg_ctl.exe" -D $pgData -o "-p 5433" -l "$pgData\server.log" start
Start-Sleep -Seconds 2
Write-Output "PostgreSQL server started successfully."
