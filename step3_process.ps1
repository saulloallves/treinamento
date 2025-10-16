param(
    [string]$WorkDir = (Join-Path $env:TEMP "migracao_supabase")
)

Write-Host "PASSO 3: Processando e corrigindo o arquivo de schema SQL..."

$sourceSchemaFile = Join-Path $WorkDir "arquivo_2_schema_app.sql"
$patchedSchemaFile = Join-Path $WorkDir "arquivo_2_schema_app_patched.sql"

if (-not (Test-Path $sourceSchemaFile)) {
    Write-Host "ERRO: O arquivo de schema de origem '$sourceSchemaFile' não foi encontrado." -ForegroundColor Red
    exit 1
}

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content -Path $sourceSchemaFile -Raw

# Correção 1: Renomear a coluna 'unit_id' para 'unit_code' na tabela 'users'
# Esta é uma correção crucial para alinhar com o schema de destino.
$sqlContent = $sqlContent -replace '(?i)unit_id uuid', 'unit_code text'

# Adicione aqui outras transformações de schema que sejam necessárias.
# Exemplo:
# $sqlContent = $sqlContent -replace 'CREATE TABLE public.minha_tabela_antiga', 'CREATE TABLE public.minha_tabela_nova'

# Salvar o arquivo SQL corrigido
Set-Content -Path $patchedSchemaFile -Value $sqlContent -Encoding UTF8

Write-Host "✅ Arquivo de schema corrigido e salvo em: $patchedSchemaFile" -ForegroundColor Green
Write-Host "As seguintes correções foram aplicadas:"
Write-Host "- Coluna 'unit_id' na tabela 'users' foi renomeada para 'unit_code' e seu tipo alterado para 'text'."
