param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("push", "status")]
  [string]$Command
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env.local"

if (-not (Test-Path -LiteralPath $envPath)) {
  throw ".env.local was not found. Create it from .env.local.example and fill local Supabase values."
}

Get-Content -LiteralPath $envPath | ForEach-Object {
  $line = $_.Trim()

  if (-not $line -or $line.StartsWith("#")) {
    return
  }

  $equalsIndex = $line.IndexOf("=")
  if ($equalsIndex -lt 1) {
    return
  }

  $name = $line.Substring(0, $equalsIndex).Trim()
  $value = $line.Substring($equalsIndex + 1).Trim()

  if (
    $value.Length -ge 2 -and
    (($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'")))
  ) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$required = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_PASSWORD"
)

$missing = $required | Where-Object {
  -not [Environment]::GetEnvironmentVariable($_, "Process")
}

if ($missing.Count -gt 0) {
  throw "Missing required local env var(s): $($missing -join ', ')"
}

switch ($Command) {
  "push" {
    & npx.cmd supabase db push
    exit $LASTEXITCODE
  }
  "status" {
    & npx.cmd supabase status
    exit $LASTEXITCODE
  }
}
