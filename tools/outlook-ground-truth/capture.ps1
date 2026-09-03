#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Renders each fixture in fixtures/ using real Outlook desktop (via COM
  automation) and saves a screenshot of the reading window to captures/.

.DESCRIPTION
  Manual, local-only tool. Must be run on Windows with Outlook desktop
  installed and configured (a profile must exist; this does not send mail,
  it only displays a MailItem window to render it). Not part of Seamail's
  CLI or CI - see README.md in this directory for why.

.NOTES
  Requires: Windows, Outlook desktop, PowerShell 5.1+ (or pwsh with COM
  interop support - COM automation is Windows-only regardless of PowerShell
  edition).
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$fixturesDir = Join-Path $scriptDir "fixtures"
$capturesDir = Join-Path $scriptDir "captures"

if (-not (Test-Path $fixturesDir)) {
    throw "No fixtures/ directory found. Run generate-fixtures.mjs first."
}
New-Item -ItemType Directory -Force -Path $capturesDir | Out-Null

$outlook = New-Object -ComObject Outlook.Application

# Captures the full primary screen. Manually maximize/position the Outlook
# compose window on that screen before running (or extend this to P/Invoke
# GetWindowRect on $mail's window handle for a tighter crop).
function Capture-Screen {
    param([string]$OutFile)

    Start-Sleep -Milliseconds 1500  # let the window paint before capturing
    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
    $bitmap.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

Get-ChildItem -Path $fixturesDir -Filter "*.html" | ForEach-Object {
    $slug = $_.BaseName
    $html = Get-Content -Raw -Path $_.FullName
    $outFile = Join-Path $capturesDir "$slug.png"

    Write-Host "Rendering $slug..."
    $mail = $outlook.CreateItem(0)  # olMailItem
    $mail.Subject = $slug
    $mail.HTMLBody = $html
    $mail.Display($false)

    Capture-Screen -OutFile $outFile

    $mail.Close(1)  # olDiscard
}

Write-Host "Done. Ground-truth screenshots written to $capturesDir"
Write-Host "Compare these against outlook-classic@v1 renders for the matching fixture."
