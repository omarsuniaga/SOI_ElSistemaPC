#Requires -Version 5.1
<#
.SYNOPSIS
    Busca y corrige texto "mojibake" (UTF-8 mal reinterpretado como Windows-1252)
    en archivos de código fuente, de forma recursiva y autónoma.

.DESCRIPTION
    El mojibake mas comun en proyectos web ocurre cuando texto UTF-8 correcto
    (letras acentuadas, ñ, ¿, ¡, comillas tipograficas...) fue leido/guardado
    en algun punto como si fuera Windows-1252, y ese resultado incorrecto se
    volvio a guardar como UTF-8. Eso produce secuencias como "Ã©" en vez de
    "é", "Ã±" en vez de "ñ", "â€™" en vez de "'".

    Este script NO usa una tabla de reemplazos fija (que siempre queda
    incompleta). En su lugar aplica la operacion inversa EXACTA de la
    corrupcion, caracter por caracter:

      1. Detecta corridas de caracteres dentro del rango que Windows-1252
         usa para 0x80-0xFF (construido dinamicamente via .NET, no a mano
         - cubre tildes, ñ, ¿, ¡, comillas tipograficas, guiones largos, etc).
      2. Re-codifica esa corrida como Windows-1252 -> recupera los bytes
         originales.
      3. Decodifica esos bytes como UTF-8 en modo ESTRICTO (lanza excepcion
         si la secuencia no es UTF-8 valida).
      4. Si falla el paso 3, no se toca nada. Un byte suelto o una
         coincidencia casual casi nunca reconstruye una secuencia UTF-8
         valida y completa, asi que los falsos positivos son practicamente
         imposibles - solo corrige cuando la reconstruccion es matematicamente
         consistente.

    Por diseño es CONSERVADOR: prefiere no tocar un caso dudoso antes que
    arriesgar corromper texto bueno.

.PARAMETER Path
    Directorio raiz desde donde empezar el recorrido. Por defecto, el
    directorio actual.

.PARAMETER Extensions
    Extensiones de archivo a revisar (sin el punto tambien funciona).
    Por defecto: js, jsx, ts, tsx, css, scss, html, htm, json, md, vue, svelte

.PARAMETER ExcludeDirs
    Nombres de carpeta a NO recorrer (comparacion exacta, no rutas).
    Por defecto: node_modules, .git, dist, build, .next, coverage, .cache, out

.PARAMETER LogPath
    Ruta del archivo CSV de log. Por defecto: mojibake-log-<timestamp>.csv
    en el directorio actual.

.PARAMETER Backup
    Si se indica, antes de modificar un archivo crea una copia junto a el
    con extension .bak (ademas de lo que ya te protege git).

.PARAMETER WhatIf
    Modo simulacro: reporta y loguea lo que CORREGIRIA, pero no escribe
    ningun archivo. Muy recomendado para la primera corrida.

.EXAMPLE
    # Simulacro primero, para revisar el log antes de tocar nada de verdad
    .\Repair-Mojibake.ps1 -Path C:\ruta\al\proyecto -WhatIf

.EXAMPLE
    # Corrida real (con el arbol de trabajo de git limpio, para poder
    # revisar con `git diff` y revertir con `git checkout .` si algo no
    # te convence)
    .\Repair-Mojibake.ps1 -Path C:\ruta\al\proyecto

.EXAMPLE
    # Solo un subconjunto de extensiones, con backup .bak por archivo
    .\Repair-Mojibake.ps1 -Path . -Extensions js,ts,tsx -Backup

.NOTES
    - Los archivos se vuelven a guardar como UTF-8 SIN BOM (el estandar en
      proyectos JS/TS/CSS/HTML modernos). Si el archivo ya estaba sin BOM,
      no cambia nada mas alla del texto corregido.
    - Corre sobre el arbol de trabajo de un repo git limpio. El script no
      reemplaza a git como red de seguridad: te deja revisar el diff.
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter(Position = 0)]
    [string]$Path = (Get-Location).Path,

    [string[]]$Extensions = @('js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'htm', 'json', 'md', 'vue', 'svelte'),

    [string[]]$ExcludeDirs = @('node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache', 'out'),

    [string]$LogPath,

    [switch]$Backup,

    [long]$MaxFileSizeBytes = 15MB
)

# ============================================================================
# 0. Preparacion
# ============================================================================

$ErrorActionPreference = 'Stop'

$resolvedPath = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
if (-not $resolvedPath) {
    Write-Error "No existe el directorio: $Path"
    exit 1
}
$rootPath = $resolvedPath.Path

$normalizedExtensions = $Extensions | ForEach-Object {
    $e = $_.Trim().ToLowerInvariant()
    if (-not $e.StartsWith('.')) { $e = ".$e" }
    $e
}

if (-not $LogPath) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $LogPath = Join-Path $rootPath "mojibake-log-$timestamp.csv"
}

# ============================================================================
# 1. Construir dinamicamente el conjunto de caracteres "sospechosos"
#    (todo lo que Windows-1252 mapea en el rango de bytes 0x80-0xFF).
#    No se hace a mano para no dejar huecos - cubre tildes, ñ, ¿, ¡,
#    comillas tipograficas, guiones largos/en, elipsis, etc.
# ============================================================================

$cp1252 = [System.Text.Encoding]::GetEncoding(1252)
$strictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)  # sin BOM, lanza excepcion si es invalido
$writeUtf8NoBom = New-Object System.Text.UTF8Encoding($false)

$suspiciousCodepoints = New-Object System.Collections.Generic.List[int]
for ($b = 0x80; $b -le 0xFF; $b++) {
    $chars = $cp1252.GetChars(@([byte]$b))
    if ($chars.Length -eq 1) {
        [void]$suspiciousCodepoints.Add([int][char]$chars[0])
    }
}
$suspiciousCodepoints = $suspiciousCodepoints | Sort-Object -Unique

$classBody = ($suspiciousCodepoints | ForEach-Object { '\u{0:X4}' -f $_ }) -join ''
$mojibakePattern = "[$classBody]+"
$mojibakeRegex = New-Object System.Text.RegularExpressions.Regex($mojibakePattern)

# ============================================================================
# 2. Funcion nucleo: intenta "deshacer" una corrida sospechosa.
#    Devuelve $null si NO es mojibake reconstruible (no se toca).
# ============================================================================

function Repair-MojibakeRun {
    param([string]$Run)

    try {
        $bytes = $cp1252.GetBytes($Run)
        $decoded = $strictUtf8.GetString($bytes)
    }
    catch {
        return $null
    }

    if ($decoded -eq $Run) { return $null }
    if ($decoded -match '[\u0000-\u0008\u000B\u000C\u000E-\u001F]') { return $null }  # control chars raros: descartar
    return $decoded
}

# ============================================================================
# 3. Recorrido recursivo manual (para poder podar node_modules etc. ANTES
#    de entrar, en vez de enumerar todo y filtrar despues).
# ============================================================================

function Get-TargetFiles {
    param([string]$RootDir, [string[]]$Exts, [string[]]$Excluded)

    $stack = New-Object System.Collections.Generic.Stack[string]
    $stack.Push($RootDir)

    while ($stack.Count -gt 0) {
        $dir = $stack.Pop()
        $entries = $null
        try {
            $entries = Get-ChildItem -LiteralPath $dir -Force -ErrorAction Stop
        }
        catch {
            Write-Warning "No se pudo leer el directorio: $dir ($($_.Exception.Message))"
            continue
        }

        foreach ($entry in $entries) {
            if ($entry.PSIsContainer) {
                if ($Excluded -contains $entry.Name) { continue }
                $stack.Push($entry.FullName)
            }
            elseif ($Exts -contains $entry.Extension.ToLowerInvariant()) {
                Write-Output $entry
            }
        }
    }
}

# ============================================================================
# 4. Recorrido principal
# ============================================================================

Write-Host ''
Write-Host '=== Repair-Mojibake ===' -ForegroundColor Cyan
Write-Host "Directorio:   $rootPath"
Write-Host "Extensiones:  $($normalizedExtensions -join ', ')"
Write-Host "Excluidos:    $($ExcludeDirs -join ', ')"
Write-Host "Log:          $LogPath"
if ($WhatIfPreference) {
    Write-Host "Modo:         SIMULACRO (-WhatIf) - no se va a escribir ningun archivo" -ForegroundColor Yellow
}
else {
    Write-Host "Modo:         CORRECCION REAL - se van a sobrescribir archivos" -ForegroundColor Yellow
    Write-Host "              (corre esto con el arbol de git limpio para poder revisar" -ForegroundColor DarkYellow
    Write-Host "               con 'git diff' y revertir con 'git checkout .' si hace falta)" -ForegroundColor DarkYellow
}
Write-Host ''

$logEntries = New-Object System.Collections.Generic.List[PSCustomObject]
$filesScanned = 0
$filesWithIssues = 0
$totalFixes = 0
$sw = [System.Diagnostics.Stopwatch]::StartNew()

$targetFiles = Get-TargetFiles -RootDir $rootPath -Exts $normalizedExtensions -Excluded $ExcludeDirs

foreach ($file in $targetFiles) {
    $filesScanned++

    if ($file.Length -gt $MaxFileSizeBytes) {
        Write-Warning "Se omite (excede $($MaxFileSizeBytes / 1MB) MB): $($file.FullName)"
        continue
    }

    $content = $null
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    }
    catch {
        Write-Warning "No se pudo leer: $($file.FullName) ($($_.Exception.Message))"
        continue
    }

    if ([string]::IsNullOrEmpty($content)) { continue }

    # IMPORTANTE: el scriptblock de abajo se invoca como delegado .NET
    # (System.Text.RegularExpressions.MatchEvaluator), no como un bloque
    # normal de PowerShell. .NET le da un scope de ESCRITURA aislado en
    # cada invocacion: toda variable que el scriptblock ASIGNE (++, =) sin
    # el prefijo "$script:" crea/modifica una copia local que se descarta
    # al terminar esa invocacion — la variable de afuera nunca se entera.
    # Sin "$script:" acá, $fileFixCount se queda siempre en 0, el gate de
    # "hay algo que escribir" nunca se activa, y el archivo no se toca en
    # disco aunque $newContent si haya quedado bien corregido en memoria.
    # Las LECTURAS de variables de afuera (ej. $content mas abajo) si
    # funcionan sin prefijo — el problema es especificamente la escritura.
    $script:fileFixCount = 0

    $newContent = $mojibakeRegex.Replace($content, {
        param($match)

        $original = $match.Value
        $fixed = Repair-MojibakeRun -Run $original
        if ($null -eq $fixed) {
            return $original
        }

        $script:fileFixCount++

        $lineNumber = 1 + ($content.Substring(0, $match.Index).ToCharArray() | Where-Object { $_ -eq "`n" }).Count

        $snippetOriginal = $original
        $snippetFixed = $fixed
        if ($snippetOriginal.Length -gt 120) { $snippetOriginal = $snippetOriginal.Substring(0, 117) + '...' }
        if ($snippetFixed.Length -gt 120) { $snippetFixed = $snippetFixed.Substring(0, 117) + '...' }

        $logEntries.Add([PSCustomObject]@{
            Fecha           = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
            Archivo         = $file.Name
            Directorio      = $file.DirectoryName
            Linea           = $lineNumber
            TextoOriginal   = $snippetOriginal
            TextoCorregido  = $snippetFixed
            Modo            = if ($WhatIfPreference) { 'SIMULACRO' } else { 'APLICADO' }
        })

        return $fixed
    })

    $fileFixCount = $script:fileFixCount

    if ($fileFixCount -gt 0) {
        $filesWithIssues++
        $totalFixes += $fileFixCount

        $accion = "corregir $fileFixCount ocurrencia(s) de mojibake en $($file.FullName)"
        if ($PSCmdlet.ShouldProcess($file.FullName, $accion)) {
            if ($Backup) {
                Copy-Item -LiteralPath $file.FullName -Destination "$($file.FullName).bak" -Force
            }
            [System.IO.File]::WriteAllText($file.FullName, $newContent, $writeUtf8NoBom)
            Write-Host "[OK]   $($file.FullName)  ($fileFixCount corregidas)" -ForegroundColor Green
        }
        else {
            Write-Host "[SKIP] $($file.FullName)  ($fileFixCount se hubieran corregido)" -ForegroundColor Yellow
        }
    }

    if ($filesScanned % 250 -eq 0) {
        Write-Host "... $filesScanned archivos revisados" -ForegroundColor DarkGray
    }
}

$sw.Stop()

# ============================================================================
# 5. Log final y resumen
# ============================================================================

if ($logEntries.Count -gt 0) {
    # -WhatIf:$false explicito: Export-Csv soporta ShouldProcess y por
    # default heredaria el -WhatIf del script entero, lo cual suprimiria
    # el log tambien en modo simulacro — justo el archivo que se necesita
    # revisar CUANDO es simulacro. El log nunca toca los archivos fuente,
    # asi que siempre debe escribirse.
    $logEntries | Export-Csv -LiteralPath $LogPath -NoTypeInformation -Encoding UTF8 -WhatIf:$false -Confirm:$false
}

Write-Host ''
Write-Host '=== Resumen ===' -ForegroundColor Cyan
Write-Host "Archivos revisados:        $filesScanned"
Write-Host "Archivos con mojibake:     $filesWithIssues"
Write-Host "Ocurrencias corregidas:    $totalFixes"
Write-Host "Tiempo:                    $([math]::Round($sw.Elapsed.TotalSeconds, 1)) s"
if ($logEntries.Count -gt 0) {
    Write-Host "Log detallado:             $LogPath"
}
else {
    Write-Host 'No se encontro mojibake reconstruible en ningun archivo.'
}
Write-Host ''
