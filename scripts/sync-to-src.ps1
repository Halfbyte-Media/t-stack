# T-Stack Sync: project root → src/
# Copies framework files from the active dogfood environment back to the distributable template.
# State files are NEVER copied into src/.

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$frameworkFiles = @(
    @{ Src = ".github/agents"; Dst = "src/.github/agents"; IsDir = $true }
    @{ Src = ".tstack/.version"; Dst = "src/.tstack/.version"; IsDir = $false }
    @{ Src = ".tstack/README.md"; Dst = "src/.tstack/README.md"; IsDir = $false }
    @{ Src = ".tstack/team.md"; Dst = "src/.tstack/team.md"; IsDir = $false }
    @{ Src = ".tstack/sprints/README.md"; Dst = "src/.tstack/sprints/README.md"; IsDir = $false }
    @{ Src = ".gitignore"; Dst = "src/.gitignore"; IsDir = $false }
    @{ Src = ".github/skills"; Dst = "src/.github/skills"; IsDir = $true }
    @{ Src = "migrations"; Dst = "src/migrations"; IsDir = $true }
)

# State files that must NEVER exist in src/.tstack/
$stateFiles = @(
    "src/.tstack/project.md"
    "src/.tstack/decisions.md"
    "src/.tstack/routing.md"
    "src/.tstack/sprint-index.md"
    "src/.tstack/.migrated"
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

    # Enforce: no state files in src/
    Write-Host "`nChecking for stale state files in src/..."
    foreach ($stateFile in $stateFiles) {
        if (Test-Path $stateFile) {
            if ($DryRun) { Write-Host "[DRY RUN] Would remove stale: $stateFile" }
            else {
                Remove-Item $stateFile -Force
                Write-Host "  Removed stale state file: $stateFile"
            }
        }
    }

    Write-Host "`nSync complete (root -> src)."
}
finally {
    Pop-Location
}
