# ClimbBeta - Diagnostico de Portas (Hotspot)
# Uso: .\test-ports.ps1

$hotspotIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -like "172.20.10.*" } |
    Select-Object -First 1).IPAddress

if (-not $hotspotIP) {
    Write-Host "AVISO: Hotspot nao detetado. Liga o Hotspot do telemovel e reconecta o portatil." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "IP do portatil no Hotspot: $hotspotIP" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "Backend API";  Port = 8080 },
    @{ Name = "PostgreSQL";   Port = 5432 },
    @{ Name = "MinIO API";    Port = 9000 },
    @{ Name = "MinIO Console";Port = 9001 }
)

foreach ($svc in $services) {
    $result = Test-NetConnection -ComputerName $hotspotIP -Port $svc.Port -WarningAction SilentlyContinue
    $status = if ($result.TcpTestSucceeded) { "OK" } else { "FALHOU" }
    $color  = if ($result.TcpTestSucceeded) { "Green" } else { "Red" }
    Write-Host ("  {0,-20} porta {1}  ->  {2}" -f $svc.Name, $svc.Port, $status) -ForegroundColor $color
}

Write-Host ""
Write-Host "Se alguma porta FALHOU:" -ForegroundColor Yellow
Write-Host "  Backend  -> Confirma que o Spring Boot esta a correr"
Write-Host "  5432/9000 -> Confirma que os containers Docker estao Up: docker compose ps"
Write-Host ""
