# ===================================================================================
# SCRIPT 1: EXPORTAÇÃO DE DADOS E SCHEMA (NÃO DESTRUTIVO)
# Objetivo: Extrair dados e estrutura do banco de origem de forma segura.
# ===================================================================================

# Força o encoding UTF-8 no console e no pipeline para evitar problemas com caracteres.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom

# --- CONFIGURAÇÕES ---
$ORIGEM_DB_URL = "postgresql://postgres.fcajwhennqhbmuqfpqji:8eMDbjJdCdA3JOFE@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
$SOURCE_APP_SCHEMA = "public"

# --- CAMINHOS DAS FERRAMENTAS POSTGRESQL ---
# Adapte este caminho para a sua instalação do PostgreSQL.
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin' # Verifique sua versão!
$PG_DUMP_PATH = Join-Path $PG_BIN_PATH 'pg_dump.exe'
$PSQL_PATH = Join-Path $PG_BIN_PATH 'psql.exe'

# --- DIRETÓRIO DE TRABALHO (ONDE OS ARQUIVOS BRUTOS SERÃO SALVOS) ---
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase"
if (!(Test-Path $WORK_DIR)) {
    New-Item -ItemType Directory -Force -Path $WORK_DIR | Out-Null
}
# Limpa o diretório de execuções anteriores para garantir dados frescos
Get-ChildItem -Path $WORK_DIR -Recurse | Remove-Item -Force -Recurse
Write-Host "Diretório de trabalho limpo: $WORK_DIR"

# ===================================================================================
# ETAPA DE EXPORTAÇÃO (DUMP)
# ===================================================================================
Write-Host "--- INICIANDO EXPORTAÇÃO DO BANCO DE ORIGEM ---"

# --- LISTA DE TABELAS ADICIONAIS PARA EXPORTAR OS DADOS ---
# Adicione aqui tabelas de OUTROS schemas (ex: 'storage.objects') que você quer migrar.
# As tabelas do schema principal ('public') serão adicionadas automaticamente.
$additionalTablesToDump = @(
    "auth.users"
)

# --- LÓGICA PARA BUSCAR DINAMICAMENTE AS TABELAS DO SCHEMA 'PUBLIC' ---
Write-Host "Buscando tabelas do schema '$SOURCE_APP_SCHEMA' no banco de origem..."
$queryPublicTables = "SELECT '$SOURCE_APP_SCHEMA' || '.' || table_name FROM information_schema.tables WHERE table_schema = '$SOURCE_APP_SCHEMA' AND table_type = 'BASE TABLE';"
try {
    # Abordagem simplificada e com melhor log de erro
    $arguments = @(
        "-d", $ORIGEM_DB_URL,
        "--tuples-only",
        "-c", $queryPublicTables
    )
    $output = & $PSQL_PATH $arguments 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "O comando psql falhou. Saída de erro: $output"
    }

    $dynamicPublicTables = $output | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    Write-Host "  - Encontradas $($dynamicPublicTables.Count) tabelas no schema '$SOURCE_APP_SCHEMA'."
} catch {
    $errorMessage = $_.Exception.Message
    throw "Falha ao buscar a lista de tabelas do schema '$SOURCE_APP_SCHEMA'. Detalhes: $errorMessage"
}

# Combina a lista dinâmica com a lista de tabelas adicionais e remove duplicatas
$allTablesToDump = $dynamicPublicTables + $additionalTablesToDump | Select-Object -Unique

Write-Host "Total de tabelas para exportar dados: $($allTablesToDump.Count)."

# 1.1 DUMP APENAS DOS DADOS DAS TABELAS ESPECIFICADAS
Write-Host "Exportando dados das tabelas..."
foreach ($tbl in $allTablesToDump) {
    # Cria um nome de arquivo seguro substituindo '.' por '_'
    $fileName = "dados_" + $tbl.Replace('.', '_') + ".sql"
    $fileFullPath = Join-Path $WORK_DIR $fileName
    
    # O uso de --column-inserts é crucial para o script de formatação conseguir processar os dados.
    $command = "& `"$PG_DUMP_PATH`" --data-only --column-inserts --no-owner --table=`"$tbl`" --dbname=`"$ORIGEM_DB_URL`" | Out-File -FilePath `"$fileFullPath`" -Encoding utf8"
    
    try {
        Invoke-Expression $command
        Write-Host "  - Dados da tabela '$tbl' exportados para '$fileName'."
    } catch {
        throw "Falha no pg_dump da tabela $tbl. Verifique a URL e o caminho do pg_dump."
    }
}

# 1.2 DUMP APENAS DO SCHEMA (ESTRUTURA) DO SCHEMA 'PUBLIC'
Write-Host "Exportando a estrutura do schema '$SOURCE_APP_SCHEMA'..."
$dmpFileSchema = Join-Path $WORK_DIR "schema_app.sql"

# Flags seguras: --schema-only para pegar apenas a estrutura, sem --create ou --clean.
$commandSchema = "& `"$PG_DUMP_PATH`" --schema-only --no-owner --no-privileges --schema=`"$SOURCE_APP_SCHEMA`" --dbname=`"$ORIGEM_DB_URL`" | Out-File -FilePath `"$dmpFileSchema`" -Encoding utf8"

try {
    Invoke-Expression $commandSchema
    Write-Host "  - Estrutura do schema '$SOURCE_APP_SCHEMA' exportada para 'schema_app.sql'."
} catch {
    throw "Falha no pg_dump do schema $SOURCE_APP_SCHEMA. Verifique as configurações."
}

Write-Host "`nETAPA DE EXPORTAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "Os arquivos SQL brutos foram salvos em '$WORK_DIR'."
Write-Host "Execute o script 'formatar_dados.ps1' a seguir."
