$ErrorActionPreference = "Stop"

Set-Location "F:\momentext-legal-ai"

$stdout = Join-Path (Get-Location) ".codex-dev.log"
$stderr = Join-Path (Get-Location) ".codex-dev.err.log"

if (Test-Path $stdout) {
    Remove-Item -LiteralPath $stdout -Force
}

if (Test-Path $stderr) {
    Remove-Item -LiteralPath $stderr -Force
}

& npm.cmd run dev 1> $stdout 2> $stderr
