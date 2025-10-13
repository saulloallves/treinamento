# PASSO 2: EXPORTAR DADOS DO BANCO ORIGEM
Write-Host "PASSO 2: Exportando dados do banco origem..." -ForegroundColor Cyan

$SOURCE_DB_URL = "postgresql://postgres:OrM4B4ywp1tgbg6B@db.tctkacgbhqvkqovctrzf.supabase.co:5432/postgres"

Write-Host "Executando pg_dump..." -ForegroundColor Yellow

# Usar argumentos separados para evitar problemas
$cmd = "pg_dump"
$pgArgs = @(
    $SOURCE_DB_URL,
    "--data-only",
    "--no-owner", 
    "--no-privileges",
    "--rows-per-insert=1000",
    "--column-inserts",
    "--inserts",
    "--exclude-schema=pg_catalog",
    "--exclude-schema=information_schema", 
    "--exclude-schema=pg_toast",
    "--exclude-schema=realtime",
    "--exclude-schema=auth",
    "--exclude-schema=storage",
    "--exclude-schema=graphql_public",
    "--exclude-schema=graphql",
    "--exclude-schema=extensions",
    "--exclude-schema=vault",
    "--exclude-schema=cron",
    "--exclude-schema=net",
    "--exclude-schema=supabase_migrations",
    "-f",
    "data_only.sql"
)

& $cmd $pgArgs

if ($LASTEXITCODE -eq 0 -and (Test-Path "data_only.sql")) {
    $fileSize = [math]::Round((Get-Item "data_only.sql").Length / 1KB, 1)
    Write-Host "[OK] Dados exportados com sucesso! ($fileSize KB)" -ForegroundColor Green
    Write-Host "Execute o proximo passo: .\step3_process.ps1" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Erro na exportacao dos dados!" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red 
    Read-Host "Pressione Enter para sair"
    exit 1
}