$ErrorActionPreference = 'Stop'

$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir 'backend'

$apiOutLog = Join-Path $env:TEMP 'backend-api.out.log'
$apiErrLog = Join-Path $env:TEMP 'backend-api.err.log'
$prismaOutLog = Join-Path $env:TEMP 'prisma-5556.out.log'
$prismaErrLog = Join-Path $env:TEMP 'prisma-5556.err.log'
$expoOutLog = Join-Path $env:TEMP 'expo-metro.out.log'
$expoErrLog = Join-Path $env:TEMP 'expo-metro.err.log'

function Test-PortListening {
  param([int]$Port)

  return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-BackgroundPowerShell {
  param(
    [string]$WorkingDirectory,
    [string]$Command,
    [string]$OutLog,
    [string]$ErrLog
  )

  return Start-Process powershell \
    -WorkingDirectory $WorkingDirectory \
    -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $Command) \
    -RedirectStandardOutput $OutLog \
    -RedirectStandardError $ErrLog \
    -PassThru
}

function Wait-Until {
  param(
    [scriptblock]$Condition,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (& $Condition) {
      return $true
    }
    Start-Sleep -Milliseconds 500
  }

  return $false
}

Write-Host "[1/6] Starting PostgreSQL..."
if (Get-Command docker -ErrorAction SilentlyContinue) {
  # Запускаем Docker Desktop если не запущен
  $dockerReady = $false
  try { docker info | Out-Null; $dockerReady = $true } catch { }

  if (-not $dockerReady) {
    $dockerDesktopExe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path $dockerDesktopExe) {
      Write-Host '  Docker Desktop not running. Starting it...'
      Start-Process $dockerDesktopExe
      Write-Host '  Waiting for Docker daemon (up to 60s)...'
      $dockerReady = Wait-Until -TimeoutSeconds 60 -Condition {
        try { docker info 2>$null | Out-Null; return $true } catch { return $false }
      }
    }
  }

  if ($dockerReady) {
    Push-Location $backendDir
    try {
      docker compose up -d postgres | Out-Null
      docker compose stop backend | Out-Null
    } finally {
      Pop-Location
    }

    # Применяем миграции и обновляем Prisma client
    Write-Host '  Applying migrations and generating Prisma client...'
    Push-Location $backendDir
    try {
      npx prisma migrate deploy 2>&1 | Out-Null
      npx prisma generate 2>&1 | Out-Null
    } finally {
      Pop-Location
    }
  } else {
    Write-Host '  Docker did not start in time. Continuing without Postgres.'
  }
} else {
  Write-Host "Docker not found. Skipping docker compose startup."
}

Write-Host "[2/6] Starting backend API on localhost:3000..."
if (-not (Test-PortListening -Port 3000)) {
  Remove-Item $apiOutLog, $apiErrLog -ErrorAction SilentlyContinue
  Start-BackgroundPowerShell \
    -WorkingDirectory $backendDir \
    -Command 'node src/index.js' \
    -OutLog $apiOutLog \
    -ErrLog $apiErrLog | Out-Null
}

$apiReady = Wait-Until -TimeoutSeconds 30 -Condition {
  try {
    $health = Invoke-RestMethod -Uri 'http://localhost:3000/health' -Method Get -TimeoutSec 3
    return $health.success -eq $true
  } catch {
    return $false
  }
}

Write-Host "[3/6] Starting Prisma Studio on localhost:5556..."
if (-not (Test-PortListening -Port 5556)) {
  Remove-Item $prismaOutLog, $prismaErrLog -ErrorAction SilentlyContinue
  Start-BackgroundPowerShell \
    -WorkingDirectory $backendDir \
    -Command 'npx prisma studio --port 5556 --browser none' \
    -OutLog $prismaOutLog \
    -ErrLog $prismaErrLog | Out-Null
}

$prismaReady = Wait-Until -TimeoutSeconds 30 -Condition {
  try {
    $response = Invoke-WebRequest -Uri 'http://localhost:5556' -Method Get -UseBasicParsing -TimeoutSec 3
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

Write-Host "[4/6] Starting Metro for development build on localhost:8081..."
if (-not (Test-PortListening -Port 8081)) {
  Remove-Item $expoOutLog, $expoErrLog -ErrorAction SilentlyContinue
  Start-BackgroundPowerShell \
    -WorkingDirectory $rootDir \
    -Command 'npx expo start --dev-client --host localhost --clear' \
    -OutLog $expoOutLog \
    -ErrLog $expoErrLog | Out-Null
}

$metroReady = Wait-Until -TimeoutSeconds 45 -Condition {
  Test-PortListening -Port 8081
}

Write-Host "[5/6] Applying adb reverse for emulator/device..."
if (Get-Command adb -ErrorAction SilentlyContinue) {
  try {
    $adbDevices = adb devices
    if ($adbDevices -match 'device$') {
      adb reverse tcp:8081 tcp:8081 | Out-Null
      adb reverse tcp:3000 tcp:3000 | Out-Null
      Write-Host 'adb reverse tcp:8081 + tcp:3000 applied.'
    } else {
      Write-Host 'No connected adb device found. Skipping adb reverse.'
    }
  } catch {
    Write-Host "adb reverse failed: $($_.Exception.Message)"
  }
} else {
  Write-Host 'adb not found. Skipping adb reverse.'
}

Write-Host "[6/6] Done."

Write-Host ''
Write-Host 'Status:'
Write-Host "- Backend API   : $(if ($apiReady) { 'OK http://localhost:3000/health' } else { 'FAILED (check backend log)' })"
Write-Host "- Prisma Studio : $(if ($prismaReady) { 'OK http://localhost:5556' } else { 'FAILED' })"
Write-Host "- Metro         : $(if ($metroReady) { 'OK http://localhost:8081' } else { 'FAILED' })"
Write-Host ''
Write-Host 'Logs:'
Write-Host "- Backend : $apiOutLog"
Write-Host "- Prisma  : $prismaOutLog"
Write-Host "- Expo    : $expoOutLog"
Write-Host ''
Write-Host 'Use this command next time:'
Write-Host 'npm run dev:local'
