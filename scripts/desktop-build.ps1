$ErrorActionPreference = "Stop"

function Invoke-NpmScript {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptName
  )

  & npm.cmd run $ScriptName
  if ($LASTEXITCODE -ne 0) {
    throw "npm run $ScriptName failed with exit code $LASTEXITCODE"
  }
}

function Invoke-NpmScriptWithRetry {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptName,
    [int]$MaxAttempts = 2,
    [int]$RetryDelaySeconds = 15
  )

  for ($Attempt = 1; $Attempt -le $MaxAttempts; $Attempt++) {
    try {
      Invoke-NpmScript -ScriptName $ScriptName
      return
    }
    catch {
      if ($Attempt -eq $MaxAttempts) {
        throw
      }

      Write-Host "Retrying $ScriptName after a short cooldown..."
      Start-Sleep -Seconds $RetryDelaySeconds
    }
  }
}

Invoke-NpmScriptWithRetry -ScriptName "desktop:build:msi"
Start-Sleep -Seconds 15
Invoke-NpmScriptWithRetry -ScriptName "desktop:build:nsis"
