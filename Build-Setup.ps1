$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('WfpSetup-' + [Guid]::NewGuid().ToString('N'))
$zipPath = Join-Path $tempRoot 'WfpSite.zip'
$sourcePath = Join-Path $tempRoot 'Setup.cs'
$outputPath = Join-Path $projectRoot 'WFP-Setup.exe'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $compiler)) { $compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe' }
if (-not (Test-Path $compiler)) { throw 'The .NET Framework C# compiler was not found.' }

New-Item -ItemType Directory -Path $tempRoot | Out-Null
try {
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $projectRoot -Force | Where-Object {
            $_.Name -notin @('.git', 'Build-Setup.ps1', 'WFP-Setup.exe', 'WFP-Site.zip')
        } | ForEach-Object {
            $item = $_
            if ($item.PSIsContainer) {
                Get-ChildItem -LiteralPath $item.FullName -File -Recurse | ForEach-Object {
                    $relative = $_.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
                    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative) | Out-Null
                }
            } else {
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $item.FullName, $item.Name) | Out-Null
            }
        }
    } finally { $archive.Dispose() }

    @'
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;

internal static class WfpSetup {
    [STAThread]
    private static void Main() {
        string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Wobulenzi Financial Partners");
        try {
            Directory.CreateDirectory(appDir);
            using (Stream input = Assembly.GetExecutingAssembly().GetManifestResourceStream("WfpSite.zip"))
            using (ZipArchive archive = new ZipArchive(input, ZipArchiveMode.Read)) {
                foreach (ZipArchiveEntry entry in archive.Entries) {
                    string destination = Path.GetFullPath(Path.Combine(appDir, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));
                    if (!destination.StartsWith(Path.GetFullPath(appDir) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                        throw new InvalidDataException("Invalid package path.");
                    if (entry.FullName.EndsWith("/", StringComparison.Ordinal)) { Directory.CreateDirectory(destination); continue; }
                    Directory.CreateDirectory(Path.GetDirectoryName(destination));
                    entry.ExtractToFile(destination, true);
                }
            }
            string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            object shell = Activator.CreateInstance(shellType);
            object shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { Path.Combine(desktop, "Wobulenzi Financial Partners.lnk") });
            Type shortcutType = shortcut.GetType();
            shortcutType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "explorer.exe") });
            shortcutType.InvokeMember("Arguments", BindingFlags.SetProperty, null, shortcut, new object[] { "\"" + Path.Combine(appDir, "index.html") + "\"" });
            shortcutType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { appDir });
            shortcutType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { "Wobulenzi Financial Partners" });
            shortcutType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
            Marshal.FinalReleaseComObject(shortcut);
            Marshal.FinalReleaseComObject(shell);
            Process.Start(new ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "explorer.exe"), "\"" + Path.Combine(appDir, "index.html") + "\"") { UseShellExecute = true });
            MessageBox.Show("Wobulenzi Financial Partners was installed. A shortcut is on your desktop.\n\nThe records in this installation are stored in this computer's browser.", "Installation complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
        } catch (Exception ex) {
            MessageBox.Show("Setup could not finish:\n\n" + ex.Message, "WFP Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Environment.ExitCode = 1;
        }
    }
}
'@ | Set-Content -LiteralPath $sourcePath -Encoding UTF8

    $arguments = @('/nologo', '/target:winexe', '/optimize+', '/reference:System.Windows.Forms.dll', '/reference:System.IO.Compression.dll', '/reference:System.IO.Compression.FileSystem.dll', "/resource:$zipPath,WfpSite.zip", "/out:$outputPath", $sourcePath)
    $argumentLine = ($arguments | ForEach-Object { '"' + $_.Replace('"', '\"') + '"' }) -join ' '
    $process = Start-Process -FilePath $compiler -ArgumentList $argumentLine -Wait -PassThru -NoNewWindow
    if ($process.ExitCode -ne 0) { throw "C# compilation failed with exit code $($process.ExitCode)." }
    Write-Host "Created $outputPath"
} finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
