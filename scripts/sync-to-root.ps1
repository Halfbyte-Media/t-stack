# T-Stack Sync: src/ → project root
# Copies framework files from the distributable template to the active dogfood environment.
# State files (.tstack/project.md, decisions.md, routing.md, sprint-index.md) are NEVER touched.

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$frameworkFiles = @(
    @{ Src = "src/.github/agents"; Dst = ".github/agents"; IsDir = $true }
    @{ Src = "src/.tstack/.version"; Dst = ".tstack/.version"; IsDir = $false }
    @{ Src = "src/.tstack/README.md"; Dst = ".tstack/README.md"; IsDir = $false }
    @{ Src = "src/.tstack/team.md"; Dst = ".tstack/team.md"; IsDir = $false }
    @{ Src = "src/.tstack/sprints/README.md"; Dst = ".tstack/sprints/README.md"; IsDir = $false }
    @{ Src = "src/.gitignore"; Dst = ".gitignore"; IsDir = $false }
    @{ Src = "src/.github/skills"; Dst = ".github/skills"; IsDir = $true }
    @{ Src = "src/migrations"; Dst = "migrations"; IsDir = $true }
)

$root = Split-Path -Parent $PSScriptRoot

Push-Location $root
try {
    foreach ($entry in $frameworkFiles) {
        $src = $entry.Src
        $dst = $entry.Dst

        if (-not (Test-Path $src)) {
            Write-Warning "Source not found: $src — skipping"
            continue
        }

        if ($entry.IsDir) {
            $files = Get-ChildItem -Path $src -File -Recurse
            foreach ($file in $files) {
                $relativePath = $file.FullName.Substring((Resolve-Path $src).Path.Length + 1)
                $dstFile = Join-Path $dst $relativePath
                $dstDir = Split-Path $dstFile -Parent
                if (-not (Test-Path $dstDir)) {
                    if ($DryRun) { Write-Host "[DRY RUN] mkdir $dstDir" }
                    else { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
                }
                if ($DryRun) { Write-Host "[DRY RUN] $src/$relativePath -> $dstFile" }
                else {
                    Copy-Item -Path $file.FullName -Destination $dstFile -Force
                    Write-Host "  $src/$relativePath -> $dstFile"
                }
            }
        }
        else {
            $dstDir = Split-Path $dst -Parent
            if ($dstDir -and -not (Test-Path $dstDir)) {
                if ($DryRun) { Write-Host "[DRY RUN] mkdir $dstDir" }
                else { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
            }
            if ($DryRun) { Write-Host "[DRY RUN] $src -> $dst" }
            else {
                Copy-Item -Path $src -Destination $dst -Force
                Write-Host "  $src -> $dst"
            }
        }
    }
    Write-Host "`nSync complete (src -> root)."
}
finally {
    Pop-Location
}
