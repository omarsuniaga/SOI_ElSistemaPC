param(
  [string]$ProjectRef = 'zmhmdvmyeyswunurcyow',
  [string]$CredentialSecret = '',
  [switch]$SkipDbPush,
  [switch]$SkipSecret,
  [switch]$SkipDeploy
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$env:HOME = $repoRoot
$env:USERPROFILE = $repoRoot
$env:SUPABASE_DISABLE_TELEMETRY = '1'

function Run-Step([string]$Label, [scriptblock]$Action) {
  Write-Host "`n==> $Label" -ForegroundColor Cyan
  & $Action
}

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  throw 'Supabase CLI no está instalado o no está disponible en PATH.'
}

Run-Step 'Validando Supabase CLI' {
  supabase --version
}

$requiresRemoteAuth = (-not $SkipDbPush) -or (-not $SkipSecret) -or (-not $SkipDeploy)
if ($requiresRemoteAuth -and -not $env:SUPABASE_ACCESS_TOKEN) {
  throw 'Falta SUPABASE_ACCESS_TOKEN. Define el token antes de ejecutar este script.'
}

if (-not $SkipDbPush) {
  Run-Step 'Aplicando migraciones remotas' {
    supabase db push --project-ref $ProjectRef
  }
}

if (-not $SkipSecret) {
  if (-not $CredentialSecret) {
    if ($env:MAESTRO_CREDENTIALS_SECRET) {
      $CredentialSecret = $env:MAESTRO_CREDENTIALS_SECRET
    }
    else {
      $secure = Read-Host 'Escribe MAESTRO_CREDENTIALS_SECRET' -AsSecureString
      $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
      try {
        $CredentialSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
      }
      finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
      }
    }
  }

  if (-not $CredentialSecret) {
    throw 'MAESTRO_CREDENTIALS_SECRET no puede estar vacío.'
  }

  Run-Step 'Configurando secret de credenciales' {
    supabase secrets set "MAESTRO_CREDENTIALS_SECRET=$CredentialSecret" --project-ref $ProjectRef
  }
}

if (-not $SkipDeploy) {
  Run-Step 'Desplegando Edge Function maestro-credentials' {
    supabase functions deploy maestro-credentials --project-ref $ProjectRef
  }
}

if ($requiresRemoteAuth) {
  Write-Host "`nListo. Verifica desde ADM > Maestros > Perfil del Maestro." -ForegroundColor Green
  Write-Host 'Si quieres revisar logs remotos:' -ForegroundColor Yellow
  Write-Host "  supabase functions logs maestro-credentials --project-ref $ProjectRef" -ForegroundColor Yellow
}
else {
  Write-Host "`nScript validado. No se ejecutaron operaciones remotas." -ForegroundColor Green
}
