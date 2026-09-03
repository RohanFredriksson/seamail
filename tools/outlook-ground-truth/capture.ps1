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

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class NativeMethods {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$outlook = New-Object -ComObject Outlook.Application

# Full-screen fallback, used only if the message body control can't be
# located via UI Automation (see Get-BodyBounds below).
function Capture-Screen {
    param([string]$OutFile)

    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    Capture-Region -OutFile $OutFile -Left $bounds.X -Top $bounds.Y -Width $bounds.Width -Height $bounds.Height
}

function Capture-Region {
    param([string]$OutFile, [int]$Left, [int]$Top, [int]$Width, [int]$Height)

    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($Left, $Top, 0, 0, (New-Object System.Drawing.Size $Width, $Height))
    $bitmap.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

# Finds the message body editor inside the Inspector window via UI
# Automation and returns its on-screen bounding rectangle, so the capture
# excludes the ribbon, To/Cc/Subject headers, and everything outside the
# Inspector (desktop, taskbar, other windows).
function Get-BodyBounds {
    param([IntPtr]$Hwnd)

    if ($Hwnd -eq [IntPtr]::Zero) { return $null }
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($Hwnd)
    if ($null -eq $root) { return $null }
    $condition = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
        [System.Windows.Automation.ControlType]::Document)
    $body = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condition)
    if ($null -eq $body) { return $null }
    return $body.Current.BoundingRectangle
}

Get-ChildItem -Path $fixturesDir -Filter "*.html" | ForEach-Object {
    $slug = $_.BaseName
    # generate-fixtures.mjs writes UTF-8 without a BOM; Get-Content without
    # -Encoding falls back to the system default (ANSI) codepage on Windows
    # PowerShell 5.1 for BOM-less files, mangling non-ASCII text (mojibake)
    # before it ever reaches Outlook.
    $html = Get-Content -Raw -Encoding UTF8 -Path $_.FullName
    $outFile = Join-Path $capturesDir "$slug.png"

    Write-Host "Rendering $slug..."
    $mail = $outlook.CreateItem(0)  # olMailItem
    $mail.Subject = $slug
    $mail.HTMLBody = $html
    $mail.Display($false)

    $hwnd = [NativeMethods]::FindWindow("rctrl_renwnd32", "$slug - Message (HTML)")
    if ($hwnd -ne [IntPtr]::Zero) {
        [NativeMethods]::ShowWindow($hwnd, 3) | Out-Null  # SW_MAXIMIZE
        [NativeMethods]::SetForegroundWindow($hwnd) | Out-Null
    }
    Start-Sleep -Milliseconds 1500  # let the window paint before capturing

    $bounds = Get-BodyBounds -Hwnd $hwnd
    if ($null -ne $bounds -and $bounds.Width -gt 0 -and $bounds.Height -gt 0) {
        Capture-Region -OutFile $outFile -Left $bounds.X -Top $bounds.Y -Width $bounds.Width -Height $bounds.Height
    } else {
        Write-Warning "Could not locate message body control for $slug; falling back to full-screen capture."
        Capture-Screen -OutFile $outFile
    }

    $mail.Close(1)  # olDiscard
}

Write-Host "Done. Ground-truth screenshots written to $capturesDir"
Write-Host "Compare these against outlook-classic@v1 renders for the matching fixture."
