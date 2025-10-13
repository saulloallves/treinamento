# PASSO 1: CRIAR ESTRUTURA DAS TABELAS
Write-Host "PASSO 1: Criando estrutura das tabelas no banco destino..." -ForegroundColor Cyan

$DESTINATION_DB_URL = 'postgresql://postgres:Turina93@!@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres'

if (Test-Path "supabase\migrations\20251013000005_complete_self_contained_migration.sql") {
    Write-Host "Executando migration..." -ForegroundColor Yellow
    
    # Usar & com aspas para evitar problemas com caracteres especiais
    $cmd = "psql"
    $psqlArgs = @($DESTINATION_DB_URL, "-f", "supabase\migrations\20251013000005_complete_self_contained_migration.sql", "-q")
    
    & $cmd $psqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Estrutura criada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "[ERRO] Falha na criacao da estrutura!" -ForegroundColor Red
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
        Read-Host "Pressione Enter para continuar"
        exit 1
    }
} else {
    Write-Host "[ERRO] Arquivo de migration nao encontrado!" -ForegroundColor Red
    Write-Host "Procurando: supabase\migrations\20251013000005_complete_self_contained_migration.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "Estrutura das tabelas criada! Execute o proximo passo: .\step2_export.ps1" -ForegroundColor Green