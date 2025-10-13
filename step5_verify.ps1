# PASSO 5: VERIFICAR DADOS IMPORTADOS
Write-Host "PASSO 5: Verificando dados importados..." -ForegroundColor Cyan

$DESTINATION_DB_URL = 'postgresql://postgres:Turina93@!@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres'

$statsQuery = "SELECT t.table_name, COALESCE(s.n_tup_ins, 0) as records FROM information_schema.tables t LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name AND s.schemaname = 'treinamento' WHERE t.table_schema = 'treinamento' AND t.table_type = 'BASE TABLE' ORDER BY COALESCE(s.n_tup_ins, 0) DESC;"

Write-Host "Consultando registros por tabela..." -ForegroundColor Yellow

$cmd = "psql"
$psqlArgs = @($DESTINATION_DB_URL, "-c", $statsQuery)

& $cmd $psqlArgs

Write-Host ""
Write-Host "[SUCESSO] Verificacao concluida!" -ForegroundColor Green
Write-Host "Se houver registros nas tabelas acima, a migracao foi bem-sucedida!" -ForegroundColor Green

# Limpeza opcional
$cleanup = Read-Host "Deseja remover arquivos temporarios? (s/N)"
if ($cleanup -eq "s" -or $cleanup -eq "S") {
    if (Test-Path "data_only.sql") { Remove-Item "data_only.sql" -Force }
    if (Test-Path "data_treinamento.sql") { Remove-Item "data_treinamento.sql" -Force }
    Write-Host "[OK] Arquivos temporarios removidos" -ForegroundColor Green
}