<#
Simple helper to start a second mongod on port 27018.
#>

param([string]$mongodPath = "")

if (-not $mongodPath) {
    $candidates = @(
        "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"
    )
    foreach ($p in $candidates) { if (Test-Path $p) { $mongodPath = $p; break } }
}

if (-not $mongodPath) {
    Write-Host "mongod.exe not found. Run with the full path as first argument."
    exit 1
}

$dbPath = "C:\data\db2"
if (-not (Test-Path $dbPath)) { New-Item -ItemType Directory -Path $dbPath -Force | Out-Null }

Write-Host "Starting mongod at $mongodPath (dbpath=$dbPath, port=27018)"
Start-Process -FilePath $mongodPath -ArgumentList '--dbpath', $dbPath, '--port', '27018' -WindowStyle Hidden
Write-Host "Start command issued. Verify with Task Manager or: netstat -an | Select-String ':27018'"
