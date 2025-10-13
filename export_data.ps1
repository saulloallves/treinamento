# Script PowerShell para exportar dados do banco origem usando pg_dump
# Configure a variável $SOURCE_DB_URL com a string de conexão do banco origem

# Exemplo de SOURCE_DB_URL para Supabase:
# $SOURCE_DB_URL = "postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"

# DEFINA SUA URL AQUI:
$SOURCE_DB_URL = "postgresql://postgres:OrM4B4ywp1tgbg6B@db.tctkacgbhqvkqovctrzf.supabase.co:5432/postgres"

# Verificar se a variável foi definida
if ($SOURCE_DB_URL -eq "postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres") {
    Write-Host "ERRO: Você precisa definir a variável SOURCE_DB_URL com sua string de conexão real!" -ForegroundColor Red
    Write-Host "Edite o arquivo export_data.ps1 e substitua pela sua URL de conexão." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exemplo para Supabase:" -ForegroundColor Cyan
    Write-Host '$SOURCE_DB_URL = "postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"' -ForegroundColor Green
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "Exportando dados do banco de origem..." -ForegroundColor Cyan
Write-Host "Conectando em: $SOURCE_DB_URL" -ForegroundColor Yellow
Write-Host ""

# Executar pg_dump
& pg_dump $SOURCE_DB_URL `
  --data-only `
  --no-owner `
  --no-privileges `
  --rows-per-insert=1000 `
  --column-inserts `
  --inserts `
  --exclude-schema=pg_catalog `
  --exclude-schema=information_schema `
  --exclude-schema=pg_toast `
  --exclude-schema=realtime `
  --exclude-schema=auth `
  --exclude-schema=storage `
  --exclude-schema=graphql_public `
  --exclude-schema=graphql `
  --exclude-schema=extensions `
  --exclude-schema=vault `
  --exclude-schema=cron `
  --exclude-schema=net `
  --exclude-schema=supabase_migrations `
  -f data_only.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Exportação concluída com sucesso!" -ForegroundColor Green
    Write-Host "✓ Arquivo gerado: data_only.sql" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Erro durante a exportação!" -ForegroundColor Red
    Write-Host "Verifique a string de conexão e tente novamente." -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Pressione Enter para continuar"