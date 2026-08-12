# Configure les variables Vercel (production) depuis .env, puis déploie.
# Usage: .\scripts\vercel-set-env.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Test-Path .env)) { throw "Fichier .env manquant" }

Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  if ($_ -match '^([^=]+)="?(.*?)"?\s*$') {
    Set-Item -Path "env:$($Matches[1])" -Value $Matches[2]
  }
}

$authSecret = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
$siteUrl = "https://kishabuzz.vercel.app"

$pairs = [ordered]@{
  DATABASE_URL           = $env:DATABASE_URL
  DIRECT_URL             = $env:DIRECT_URL
  AUTH_SECRET            = $authSecret
  AUTH_TRUST_HOST        = "true"
  ADMIN_EMAIL            = $env:ADMIN_EMAIL
  ADMIN_PASSWORD         = $env:ADMIN_PASSWORD
  AUTH_URL               = $siteUrl
  NEXT_PUBLIC_SITE_URL   = $siteUrl
}

foreach ($k in $pairs.Keys) {
  Write-Host "Ajout $k (production)..."
  $pairs[$k] | npx vercel env add $k production --force
}

Write-Host "Deploy production..."
npx vercel --prod --yes
