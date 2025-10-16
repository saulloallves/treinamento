# ===================================================================================
# SCRIPT 3: IMPORTAÇÃO DOS DADOS FORMATADOS PARA O DESTINO
# Objetivo: Orquestrar a importação em fases (Prólogo, Estrutura, Dados, Lógica, Epílogo).
# ===================================================================================

# Força o encoding UTF-8 no console.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom

# --- CONFIGURAÇÕES ---
$DESTINO_DB_URL  = "postgresql://postgres:usg42RbUUYw1H4xI@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres"

# --- CAMINHOS DAS FERRAMENTAS POSTGRESQL ---
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin' # Verifique sua versão!
$PSQL_PATH = Join-Path $PG_BIN_PATH 'psql.exe'

# --- DIRETÓRIOS DE TRABALHO ---
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase"
$FORMATADOS_DIR = Join-Path $WORK_DIR "formatados" # Pasta onde o script 2 salva os arquivos

# Validação dos caminhos
if (-not (Test-Path $PSQL_PATH)) { Write-Host "psql.exe não encontrado em '$PSQL_PATH'." -ForegroundColor Red; exit 1 }
if (-not (Test-Path $FORMATADOS_DIR)) { Write-Host "O diretório de arquivos formatados '$FORMATADOS_DIR' não foi encontrado. Execute o script 'formatar_dados.ps1' primeiro." -ForegroundColor Red; exit 1 }

# ===================================================================================
# FUNÇÃO AUXILIAR PARA EXECUTAR SQL
# ===================================================================================
function Execute-SqlFile {
    param(
        [Parameter(Mandatory=$true)][string]$FilePath,
        [Parameter(Mandatory=$true)][string]$StepName,
        [Parameter(Mandatory=$false)][bool]$StopOnError = $true
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "AVISO: Arquivo para a etapa '$StepName' não encontrado: $FilePath. Pulando." -ForegroundColor Yellow
        return
    }

    Write-Host "`n-> Executando Etapa: $StepName..." -ForegroundColor Cyan
    
    $onErrorAction = if ($StopOnError) { "1" } else { "0" }
    
    & $PSQL_PATH --set=ECHO=queries --set=ON_ERROR_STOP=$onErrorAction --dbname "$DESTINO_DB_URL" --file "$FilePath"
    
    if ($LASTEXITCODE -ne 0) {
        if ($StopOnError) {
            Write-Host "ERRO: Falha crítica na etapa '$StepName'. A importação foi interrompida. Verifique os erros acima." -ForegroundColor Red
            exit 1
        } else {
            Write-Host "AVISO: A etapa '$StepName' encontrou erros, mas a execução continuará." -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Etapa '$StepName' concluída com sucesso." -ForegroundColor Green
    }
}

# ===================================================================================
# ORQUESTRAÇÃO DA IMPORTAÇÃO EM FASES
# ===================================================================================
Write-Host "--- INICIANDO PROCESSO DE IMPORTAÇÃO PARA O BANCO DE DESTINO ---"
Write-Host "Destino: $($DESTINO_DB_URL.Split('@')[-1])"


# --- ORDEM DE EXECUÇÃO (atualizada para a nova estrutura formatada) ---
$arquivosPorFase = @(
    @{ Name = "Prólogo"; Path = "00_prologo_migracao.sql"; StopOnError = $true }
    @{ Name = "Estrutura e Lógica (Schema Principal)"; Path = "schema_app.sql"; StopOnError = $true }
    @{ Name = "Truncate e Reset"; Path = "01_truncate_e_reset.sql"; StopOnError = $true }
    # A fase de dados será tratada separadamente abaixo
    @{ Name = "Epílogo"; Path = "99_epilogo_migracao.sql"; StopOnError = $true }
)


# Executa as fases sequenciais
foreach ($fase in $arquivosPorFase) {
    $filePath = Join-Path $FORMATADOS_DIR $fase.Path
    Execute-SqlFile -FilePath $filePath -StepName $fase.Name -StopOnError $fase.StopOnError
}

# --- FASE DE IMPORTAÇÃO DE DADOS ---
Write-Host "`n-> Executando Etapa: Importação de Dados..." -ForegroundColor Cyan
$dataFiles = Get-ChildItem -Path $FORMATADOS_DIR -Filter "dados_*.sql" | Sort-Object Name

if ($dataFiles.Count -eq 0) {
    Write-Host "Nenhum arquivo de dados (dados_*.sql) encontrado em '$FORMATADOS_DIR'." -ForegroundColor Yellow
} else {
    $confirm = Read-Host "Foram encontrados $($dataFiles.Count) arquivos de dados. Confirmar e iniciar a restauração? (s/N)"
    if ($confirm -notin @("s", "S")) { 
        Write-Host "Importação de dados cancelada pelo usuário." -ForegroundColor Yellow
        exit 0 
    }

    foreach ($file in $dataFiles) {
        # Para dados, não paramos em erro para permitir a continuação em caso de conflitos de chave primária (se a tabela não foi truncada)
        Execute-SqlFile -FilePath $file.FullName -StepName "Dados - $($file.Name)" -StopOnError $false
    }
}

Write-Host "`n🎉 PROCESSO DE IMPORTAÇÃO CONCLUÍDO!" -ForegroundColor Cyan
