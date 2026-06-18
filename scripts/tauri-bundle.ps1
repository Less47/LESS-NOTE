param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("msi", "nsis")]
  [string]$BundleType
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$buildStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$env:CARGO_TARGET_DIR = (Join-Path $repoRoot ".desktop-targets\$BundleType-$buildStamp")
$tauriCli = Join-Path $repoRoot "node_modules\.bin\tauri.cmd"

Push-Location $repoRoot
try {
  & $tauriCli build -b $BundleType
  if ($LASTEXITCODE -ne 0) {
    throw "tauri build -b $BundleType failed with exit code $LASTEXITCODE"
  }

  Write-Host ""
  Write-Host "Desktop bundle output:"
  Write-Host (Join-Path $env:CARGO_TARGET_DIR "release\bundle\$BundleType")
}
finally {
  Pop-Location
}
