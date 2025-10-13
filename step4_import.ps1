# PASSO 4: IMPORTAR DADOS NO BANCO DESTINO
Write-Host "PASSO 4: Importando dados no banco destino..." -ForegroundColor Cyan

$DESTINATION_DB_URL = 'postgresql://postgres:Turina93@!@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres'

if (-not (Test-Path "data_treinamento.sql")) {
    Write-Host "[ERRO] Arquivo data_treinamento.sql nao encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\step3_process.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Executando import..." -ForegroundColor Yellow

# Usar argumentos separados
$cmd = "psql"
$psqlArgs = @(
    $DESTINATION_DB_URL,
    "-f", 
    "data_treinamento.sql",
    "-v",
    "ON_ERROR_STOP=0",
    "-q"
)

& $cmd $psqlArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Dados importados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "[AVISO] Importacao concluida com exit code: $LASTEXITCODE" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Execute a verificacao: .\step5_verify.ps1" -ForegroundColor Green