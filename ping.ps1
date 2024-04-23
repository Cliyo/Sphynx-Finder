$networkInterfaces = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }

foreach ($interface in $networkInterfaces) {
    Write-Host "Interface: $($interface.Name)"

    $ipv4 = $interface | Get-NetIPAddress -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress
    Write-Host "IPv4: $ipv4"

    $subnet = $ipv4 -replace '\.\d+$', ''

    $pingResults = @()
    for ($i = 1; $i -le 254; $i++) {
        $target = "$subnet.$i"
        $pingTask = Test-Connection -ComputerName $target -Count 1 -AsJob -ErrorAction SilentlyContinue
        $pingResults += $pingTask
    }

    $pingResults | Wait-Job | ForEach-Object {
        $result = Receive-Job -Job $_ -ErrorAction SilentlyContinue
        if ($result) {
            Write-Host "Dispositivo encontrado: $($result.Address)"
        }
    }
}
