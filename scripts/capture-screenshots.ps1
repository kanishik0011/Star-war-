param(
  [string]$BaseUrl = "http://localhost:5173",
  [string]$ApiUrl = "http://localhost:5000",
  [string]$BrowserPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "docs\screenshots"
$profileDir = Join-Path $root ".tmp-edge-profile"
$port = 9222
$seq = 0

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
New-Item -ItemType Directory -Force -Path $profileDir | Out-Null

$browserArgs = @(
  "--headless=new",
  "--remote-debugging-port=$port",
  "--remote-debugging-address=127.0.0.1",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=`"$profileDir`"",
  "about:blank"
) -join " "

$browser = Start-Process -FilePath $BrowserPath -ArgumentList $browserArgs -PassThru -WindowStyle Hidden

function Get-DebuggerUrl {
  for ($i = 0; $i -lt 40; $i++) {
    try {
      $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list" -TimeoutSec 1
      $page = $targets | Where-Object { $_.type -eq "page" } | Select-Object -First 1
      if ($page.webSocketDebuggerUrl) {
        return $page.webSocketDebuggerUrl
      }
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }
  throw "Could not connect to browser DevTools."
}

function Receive-CdpMessage($socket) {
  $buffer = [byte[]]::new(1048576)
  $segment = [ArraySegment[byte]]::new($buffer)
  $builder = New-Object System.Text.StringBuilder

  do {
    $result = $socket.ReceiveAsync($segment, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    if ($result.Count -gt 0) {
      [void]$builder.Append([Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
    }
  } while (-not $result.EndOfMessage)

  $builder.ToString() | ConvertFrom-Json
}

function Invoke-Cdp($socket, [string]$method, $params = @{}) {
  $script:seq += 1
  $payload = @{ id = $script:seq; method = $method; params = $params } | ConvertTo-Json -Depth 12 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
  $socket.SendAsync(
    [ArraySegment[byte]]::new($bytes),
    [Net.WebSockets.WebSocketMessageType]::Text,
    $true,
    [Threading.CancellationToken]::None
  ).GetAwaiter().GetResult()

  while ($true) {
    $message = Receive-CdpMessage $socket
    if ($message.id -eq $script:seq) {
      if ($message.error) {
        throw ($message.error | ConvertTo-Json -Depth 8)
      }
      return $message.result
    }
  }
}

function Wait-ForExpression($socket, [string]$expression, [int]$timeoutMs = 30000) {
  $deadline = (Get-Date).AddMilliseconds($timeoutMs)
  while ((Get-Date) -lt $deadline) {
    $result = Invoke-Cdp $socket "Runtime.evaluate" @{
      expression = $expression
      returnByValue = $true
    }
    if ($result.result.value -eq $true) {
      return
    }
    Start-Sleep -Milliseconds 500
  }
  throw "Timed out waiting for: $expression"
}

function Set-Viewport($socket, [int]$width, [int]$height, [bool]$mobile = $false) {
  Invoke-Cdp $socket "Emulation.setDeviceMetricsOverride" @{
    width = $width
    height = $height
    deviceScaleFactor = 1
    mobile = $mobile
  } | Out-Null
}

function Capture-Screenshot($socket, [string]$fileName) {
  $capture = Invoke-Cdp $socket "Page.captureScreenshot" @{
    format = "png"
    captureBeyondViewport = $false
  }
  [IO.File]::WriteAllBytes((Join-Path $outDir $fileName), [Convert]::FromBase64String($capture.data))
}

try {
  $socket = [Net.WebSockets.ClientWebSocket]::new()
  $socket.ConnectAsync([Uri](Get-DebuggerUrl), [Threading.CancellationToken]::None).GetAwaiter().GetResult()

  Invoke-Cdp $socket "Page.enable" | Out-Null
  Invoke-Cdp $socket "Runtime.enable" | Out-Null

  Set-Viewport $socket 1440 1000 $false
  Invoke-Cdp $socket "Page.navigate" @{ url = "$BaseUrl/login" } | Out-Null
  Wait-ForExpression $socket "document.readyState === 'complete'"
  Invoke-Cdp $socket "Runtime.evaluate" @{
    expression = @"
      (async () => {
        const response = await fetch('$ApiUrl/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@starwars.dev',
            password: 'Falcon123!'
          })
        });
        if (!response.ok) {
          throw new Error('Login failed: ' + response.status);
        }
        window.location.href = '$BaseUrl/';
        return true;
      })()
"@
    returnByValue = $true
    awaitPromise = $true
  } | Out-Null
  Wait-ForExpression $socket "location.pathname === '/' && document.body.innerText.includes('Luke Skywalker')" 45000
  Start-Sleep -Seconds 2
  Capture-Screenshot $socket "desktop-home.png"

  Invoke-Cdp $socket "Runtime.evaluate" @{
    expression = "Array.from(document.querySelectorAll('button')).find((button) => button.innerText.includes('View details'))?.click(); true;"
    returnByValue = $true
  } | Out-Null
  Wait-ForExpression $socket "Boolean(document.querySelector('[role=""dialog""]')) && document.body.innerText.includes('Homeworld')" 45000
  Start-Sleep -Seconds 1
  Capture-Screenshot $socket "desktop-modal.png"

  Set-Viewport $socket 390 900 $true
  Invoke-Cdp $socket "Page.navigate" @{ url = "$BaseUrl/" } | Out-Null
  Wait-ForExpression $socket "location.pathname === '/' && document.body.innerText.includes('Luke Skywalker')" 45000
  Start-Sleep -Seconds 2
  Capture-Screenshot $socket "mobile-home.png"

  Invoke-Cdp $socket "Runtime.evaluate" @{
    expression = "Array.from(document.querySelectorAll('button')).find((button) => button.innerText.includes('View details'))?.click(); true;"
    returnByValue = $true
  } | Out-Null
  Wait-ForExpression $socket "Boolean(document.querySelector('[role=""dialog""]')) && document.body.innerText.includes('Homeworld')" 45000
  Start-Sleep -Seconds 1
  Capture-Screenshot $socket "mobile-modal.png"

  $socket.Dispose()
} finally {
  if ($browser -and -not $browser.HasExited) {
    Stop-Process -Id $browser.Id -Force
  }
}
