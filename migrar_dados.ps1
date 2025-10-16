# ===================================================================================
# SCRIPT DE MIGRAÇÃO SUPABASE - EXPORTAÇÃO E PROCESSAMENTO
# ===================================================================================
# Este script executa os Passos 1, 2 e 3 do processo de migração:
# 1. Exporta dados de autenticação e armazenamento do banco de dados de ORIGEM.
# 2. Exporta o schema da aplicação (ex: 'public') do banco de dados de ORIGEM.
# 3. Processa o arquivo de schema SQL para aplicar correções necessárias.
# ===================================================================================

# --- Configuração ---
$ORIGEM_DB_URL   = "postgresql://postgres:4D5FmdQ9cTgM54PS@db.zqexpclhdrbnevxheiax.supabase.co:5432/postgres"
$DESTINO_DB_URL  = "postgresql://postgres:usg42RbUUYw1H4xI@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres"
$SOURCE_APP_SCHEMA = "public"
$TARGET_APP_SCHEMA = "public" # Mantenha como public se o destino for public
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase"
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin' # Verifique seu caminho

# --- Validação ---
$PSQL_PATH = Join-Path $PG_BIN_PATH 'psql.exe'
$PG_DUMP_PATH = Join-Path $PG_BIN_PATH 'pg_dump.exe'

if (-not (Test-Path $PG_DUMP_PATH)) {
    Write-Host "ERRO: pg_dump.exe não encontrado em '$PG_DUMP_PATH'. Verifique a variável PG_BIN_PATH." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $PSQL_PATH)) {
    Write-Host "ERRO: psql.exe não encontrado em '$PSQL_PATH'. Verifique a variável PG_BIN_PATH." -ForegroundColor Red
    exit 1
}

# --- Início ---
Write-Host "Iniciando processo de migração..."
if (-not (Test-Path $WORK_DIR)) {
    New-Item -ItemType Directory -Force -Path $WORK_DIR | Out-Null
    Write-Host "Diretório de trabalho criado em: $WORK_DIR"
}

# ===================================================================================
# PASSO 1: EXPORTAR DADOS DE AUTENTICAÇÃO E ARMAZENAMENTO (DA ORIGEM)
# ===================================================================================
Write-Host "`n--- PASSO 1: Exportando dados de autenticação e armazenamento... ---"
$tablesToDump = @(
    "auth.users",
    "storage.buckets",
    "storage.objects"
)
foreach ($tbl in $tablesToDump) {
    $file = Join-Path $WORK_DIR ("arquivo_1_dados_" + $tbl.Replace('.', '_') + ".sql")
    Write-Host "Exportando tabela '$tbl' para '$file'..."
    & $PG_DUMP_PATH --data-only --column-inserts --no-owner --no-privileges --table=$tbl --dbname=$ORIGEM_DB_URL > $file
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO ao exportar '$tbl'." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dados de autenticação e armazenamento exportados com sucesso." -ForegroundColor Green

# ===================================================================================
# PASSO 2: EXPORTAR SCHEMA DA APLICAÇÃO (DA ORIGEM)
# ===================================================================================
Write-Host "`n--- PASSO 2: Exportando o schema '$SOURCE_APP_SCHEMA' da aplicação... ---"
$dmpFileSchema = Join-Path $WORK_DIR "arquivo_2_schema_app.sql"
& $PG_DUMP_PATH --schema=$SOURCE_APP_SCHEMA --no-owner --no-privileges --format=plain --create --clean --if-exists --dbname=$ORIGEM_DB_URL > $dmpFileSchema
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao exportar o schema '$SOURCE_APP_SCHEMA'." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema da aplicação exportado com sucesso para: $dmpFileSchema" -ForegroundColor Green

# ===================================================================================
# PASSO 3: PROCESSAR E CORRIGIR O SCHEMA EXPORTADO
# ===================================================================================
Write-Host "`n--- PASSO 3: Processando e corrigindo o arquivo de schema... ---"
$processorScript = Join-Path $PSScriptRoot "step3_process.ps1"
if (-not (Test-Path $processorScript)) {
    Write-Host "ERRO: O script 'step3_process.ps1' não foi encontrado no mesmo diretório." -ForegroundColor Red
    exit 1
}

# Executa o script de processamento, passando o diretório de trabalho
& $processorScript -WorkDir $WORK_DIR
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO durante o processamento do schema." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Processo de exportação e preparação concluído com sucesso!" -ForegroundColor Cyan
Write-Host "O próximo passo é executar o script 'subir_dados.ps1' para importar os dados para o banco de destino."
