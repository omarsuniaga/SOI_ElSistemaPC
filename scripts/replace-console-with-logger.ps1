param(
  [string]$Root = "src/portal-maestros"
)

$ErrorActionPreference = "Stop"
$LoggerImport = "import { logger } from '../../shared/utils/logger.js'"

$files = Get-ChildItem -Path $Root -Recurse -Filter "*.js" -File | Where-Object {
  $_.FullName -notmatch '\\node_modules\\'
}

$totalFiles = 0
$totalReplacements = 0

$replacements = @{
  'console.log('   = 'logger.info('
  'console.warn('  = 'logger.warn('
  'console.error(' = 'logger.error('
  'console.debug(' = 'logger.debug('
}

# regex to detect import lines
$importRegex = [regex] '^import\s+.+?\s+from\s+[''"][^''"]+[''"]\s*;?\s*$'

foreach ($file in $files) {
  # Read raw bytes as UTF-8
  $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
  # Detect BOM and skip if present
  $offset = 0
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $offset = 3 }
  $content = [System.Text.Encoding]::UTF8.GetString($bytes, $offset, $bytes.Length - $offset)
  $original = $content

  # Check if any console calls exist
  $hasConsole = $false
  foreach ($pattern in $replacements.Keys) {
    if ($content.Contains($pattern)) { $hasConsole = $true; break }
  }
  if (-not $hasConsole) { continue }

  $fileReplacements = 0
  foreach ($kv in $replacements.GetEnumerator()) {
    $escaped = [regex]::Escape($kv.Key)
    # count occurrences before replacement
    $before = $content
    $content = $content -replace $escaped, $kv.Value
    if ($content -ne $before) {
      $count = [regex]::Matches($before, $escaped).Count
      $fileReplacements += $count
    }
  }

  if ($fileReplacements -eq 0) { continue }

  # Add import if not already present
  if (-not $content.Contains($LoggerImport)) {
    $lines = $content -split "`n"
    $lastImportIdx = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($importRegex.IsMatch($lines[$i].Trim())) {
        $lastImportIdx = $i
      }
    }

    if ($lastImportIdx -ge 0) {
      # Insert after last import, preserving any blank line after it
      $insertAt = $lastImportIdx + 1
      if ($insertAt -lt $lines.Count -and $lines[$insertAt].Trim() -eq '') { $insertAt++ }
      $lines = $lines[0..$lastImportIdx] + @($LoggerImport, '') + $lines[($lastImportIdx+1)..($lines.Count-1)]
      $content = $lines -join "`n"
    } else {
      # No imports — add after header comment or at top
      $content = $LoggerImport + "`n" + $content
    }
  }

  if ($content -ne $original) {
    # Write back as UTF-8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    $totalFiles++
    $totalReplacements += $fileReplacements
    Write-Output "[OK] $fileReplacements in $($file.Name)"
  }
}

Write-Output "`n=== Summary ==="
Write-Output "Files modified: $totalFiles"
Write-Output "Total replacements: $totalReplacements"
