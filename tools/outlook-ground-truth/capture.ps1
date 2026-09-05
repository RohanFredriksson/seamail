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

param(
    [int]$ViewportWidth = 640,
    [int]$ViewportHeight = 900
)

if ($ViewportWidth -le 0 -or $ViewportHeight -le 0) {
    throw "Viewport width and height must be positive integers."
}

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
using System.Text;
using System.Runtime.InteropServices;
public class NativeMethods {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

    public static IntPtr FindWindowContaining(string className, string titlePart) {
        IntPtr result = IntPtr.Zero;
        EnumWindows((hWnd, lParam) => {
            var actualClass = new StringBuilder(256);
            var actualTitle = new StringBuilder(512);
            GetClassName(hWnd, actualClass, actualClass.Capacity);
            GetWindowText(hWnd, actualTitle, actualTitle.Capacity);
            if (actualClass.ToString().Equals(className, StringComparison.OrdinalIgnoreCase) &&
                actualTitle.ToString().IndexOf(titlePart, StringComparison.OrdinalIgnoreCase) >= 0) {
                result = hWnd;
                return false;
            }
            return true;
        }, IntPtr.Zero);
        return result;
    }
}
"@

$outlook = New-Object -ComObject Outlook.Application

# Captures the native Outlook body window. PrintWindow renders the target
# window surface without reading pixels from the composited desktop, so other
# applications and desktop notifications cannot cover the result.
function Capture-Window {
    param([string]$OutFile, [IntPtr]$Hwnd, [int]$Width, [int]$Height)

    if ($Hwnd -eq [IntPtr]::Zero -or $Width -le 0 -or $Height -le 0) {
        throw "Cannot capture an invalid body window or empty region (${Width}x${Height})."
    }
    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $hdc = $graphics.GetHdc()
    try {
        $rendered = [NativeMethods]::PrintWindow($Hwnd, $hdc, 0x00000002)  # PW_RENDERFULLCONTENT
    } finally {
        $graphics.ReleaseHdc($hdc)
        $graphics.Dispose()
    }
    if (-not $rendered) {
        $bitmap.Dispose()
        throw "PrintWindow could not render the Outlook message body. No capture was written."
    }
    $bitmap.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

# Finds the message body editor inside the Inspector window via UI
# Automation and returns its on-screen bounding rectangle, so the capture
# excludes the ribbon, To/Cc/Subject headers, and everything outside the
# Inspector (desktop, taskbar, other windows).
function Get-BodyTarget {
    param([IntPtr]$Hwnd)

    if ($Hwnd -eq [IntPtr]::Zero) { return $null }
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($Hwnd)
    if ($null -eq $root) { return $null }
    $condition = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
        [System.Windows.Automation.ControlType]::Document)
    $documents = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
    $candidate = $null
    $candidateArea = 0
    foreach ($document in $documents) {
        $rectangle = $document.Current.BoundingRectangle
        $area = $rectangle.Width * $rectangle.Height
        $nativeWindowHandle = $document.Current.NativeWindowHandle
        if ($rectangle.Width -gt 0 -and $rectangle.Height -gt 0 -and
            $nativeWindowHandle -ne 0 -and $area -gt $candidateArea) {
            $candidate = [pscustomobject]@{
                Bounds = $rectangle
                Hwnd = [IntPtr]$nativeWindowHandle
            }
            $candidateArea = $area
        }
    }
    return $candidate
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

    $hwnd = [IntPtr]::Zero
    for ($attempt = 0; $attempt -lt 12 -and $hwnd -eq [IntPtr]::Zero; $attempt++) {
        $hwnd = [NativeMethods]::FindWindow("rctrl_renwnd32", "$slug - Message (HTML)")
        if ($hwnd -eq [IntPtr]::Zero) {
            $hwnd = [NativeMethods]::FindWindowContaining("rctrl_renwnd32", $slug)
        }
        if ($hwnd -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 250 }
    }
    if ($hwnd -ne [IntPtr]::Zero) {
        [NativeMethods]::ShowWindow($hwnd, 9) | Out-Null  # SW_RESTORE
        # The Inspector includes Outlook chrome around the body. These offsets
        # establish a repeatable starting size; the body bounds below remain
        # authoritative and are validated before capture.
        $windowWidth = $ViewportWidth + 48
        $windowHeight = $ViewportHeight + 240
        [NativeMethods]::SetWindowPos($hwnd, [IntPtr]::Zero, 0, 0, $windowWidth, $windowHeight, 0x0044) | Out-Null
        [NativeMethods]::SetForegroundWindow($hwnd) | Out-Null
    }
    Start-Sleep -Milliseconds 1500  # let the window paint before capturing

    $target = Get-BodyTarget -Hwnd $hwnd
    if ($hwnd -eq [IntPtr]::Zero) {
        throw "Could not locate the Outlook Inspector for $slug. No capture was written."
    }
    if ($null -eq $target -or $target.Bounds.Width -lt $ViewportWidth -or $target.Bounds.Height -lt $ViewportHeight) {
        $measured = if ($null -eq $target) { "none" } else { "$($target.Bounds.Width)x$($target.Bounds.Height)" }
        throw "Could not locate a native Outlook body window for $slug, or it is smaller than the requested viewport ${ViewportWidth}x${ViewportHeight} (measured $measured). No capture was written."
    }

    Capture-Window -OutFile $outFile -Hwnd $target.Hwnd -Width $ViewportWidth -Height $ViewportHeight
    $metadata = [ordered]@{
        fixture = $slug
        captureMode = "outlook-body-native-window"
        captureApi = "PrintWindow(PW_RENDERFULLCONTENT)"
        requestedViewport = [ordered]@{ width = $ViewportWidth; height = $ViewportHeight }
        detectedBodyWindowHandle = $target.Hwnd.ToInt64()
        detectedBodyBounds = [ordered]@{ x = $target.Bounds.X; y = $target.Bounds.Y; width = $target.Bounds.Width; height = $target.Bounds.Height }
        monitor = [System.Windows.Forms.Screen]::PrimaryScreen.DeviceName
        monitorBounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    }
    $metadata | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 -Path (Join-Path $capturesDir "$slug.json")

    $mail.Close(1)  # olDiscard
}

Write-Host "Done. Ground-truth screenshots written to $capturesDir"
Write-Host "Compare these against outlook-classic@v1 renders for the matching fixture."
