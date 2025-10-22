# ===================================================================================
# SCRIPT 2: FORMATAÇÃO E PREPARAÇÃO DOS DADOS PARA IMPORTAÇÃO
# Objetivo: Ler os arquivos brutos, renomear o schema e tratar conflitos de 'auth.users'.
# ===================================================================================

# Força o encoding UTF-8 no console e no pipeline.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom

# --- CONFIGURAÇÕES ---
$DESTINO_DB_URL = "postgresql://postgres:T25zFGcE0kw05B64@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres"
$SOURCE_APP_SCHEMA = "public"
$TARGET_APP_SCHEMA = "moderacao_instagram"

# --- CAMINHOS DAS FERRAMENTAS POSTGRESQL ---
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin' # Verifique sua versão!
$PSQL_PATH = Join-Path $PG_BIN_PATH 'psql.exe'

# --- DIRETÓRIOS DE TRABALHO ---
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase"
$DESTINO_DIR = Join-Path $WORK_DIR "formatados"

# Cria a pasta de destino se não existir
if (!(Test-Path -Path $DESTINO_DIR)) {
    New-Item -ItemType Directory -Path $DESTINO_DIR | Out-Null
}
Write-Host "Arquivos formatados serão salvos em: $DESTINO_DIR"

# ===================================================================================
# FUNÇÕES AUXILIARES
# ===================================================================================

# --- Função: Grava conteúdo em um arquivo UTF-8 sem BOM ---
function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$false)][string[]]$Content
    )
    # Garante que o conteúdo não seja nulo ou vazio para evitar erros
    if ($null -eq $Content) {
        $Content = @()
    }
    [System.IO.File]::WriteAllLines($Path, $Content, $utf8NoBom)
}

# --- Função: Busca todos os e-mails existentes no banco de destino ---
function Get-ExistingEmailsInDest {
    param(
        [Parameter(Mandatory=$true)][string]$PsqlPath,
        [Parameter(Mandatory=$true)][string]$DbUrl
    )
    Write-Host "Buscando e-mails existentes no banco de destino para checagem de conflitos..."
    try {
        $arguments = @(
            "-d", $DbUrl,
            "--tuples-only",
            "-c", "SELECT email FROM auth.users"
        )
        $output = & $PsqlPath $arguments 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "O comando psql falhou. Saída de erro: $output"
        }

        # Usa um HashSet para performance otimizada na busca (Contains)
        $emailSet = New-Object System.Collections.Generic.HashSet[string]
        $output | ForEach-Object { $trimmedEmail = $_.Trim(); if (-not [string]::IsNullOrEmpty($trimmedEmail)) { [void]$emailSet.Add($trimmedEmail) } }
        
        Write-Host "  - Encontrados $($emailSet.Count) e-mails no destino."
        return $emailSet
    } catch {
        $errorMessage = $_.Exception.Message
        throw "Não foi possível conectar ao banco de destino para buscar e-mails. Detalhes: $errorMessage"
    }
}

# ===================================================================================
# LÓGICA PRINCIPAL DE PROCESSAMENTO
# ===================================================================================

Write-Host "`n--- INICIANDO FORMATAÇÃO E PREPARAÇÃO DOS ARQUIVOS SQL ---"

# Busca os e-mails existentes no destino UMA VEZ
$existingEmails = Get-ExistingEmailsInDest -PsqlPath $PSQL_PATH -DbUrl $DESTINO_DB_URL

# Processa todos os arquivos SQL gerados pelo script 1
$arquivosSQL = Get-ChildItem -Path $WORK_DIR -Filter *.sql
$conflictCounter = 1

foreach ($arquivo in $arquivosSQL) {
    $origemPath = $arquivo.FullName
    $destinoPath = Join-Path $DESTINO_DIR $arquivo.Name
    
    Write-Host "`n→ Processando: $($arquivo.Name)"

    $conteudo = Get-Content $origemPath -Raw

    # Pula o arquivo se estiver vazio ou contiver apenas espaços em branco
    if ([string]::IsNullOrWhiteSpace($conteudo)) {
        Write-Host "  - Arquivo '$($arquivo.Name)' está vazio. Pulando." -ForegroundColor Gray
        continue # Pula para o próximo arquivo no loop
    }

    # --- LÓGICA DE TRANSFORMAÇÃO ---
    
    # 1. Lógica específica para o arquivo de dados de auth.users
    if ($arquivo.Name -eq "dados_auth_users.sql") {
        Write-Host "  - Aplicando regra especial de conflito para 'auth.users'..."
        $novasLinhas = [System.Collections.Generic.List[string]]::new()
        $linhas = $conteudo -split [System.Environment]::NewLine

        $colunas = $null
        $idIndex = -1
        $emailIndex = -1

        foreach ($linha in $linhas) {
            if ($linha -match 'INSERT INTO public."auth.users" \((.*?)\) VALUES') {
                if ($colunas -eq $null) {
                    $colunas = $Matches[1].Split(',').Trim()
                    $idIndex = [array]::IndexOf($colunas, '"id"')
                    $emailIndex = [array]::IndexOf($colunas, '"email"')
                }
                
                # Extrai os valores da linha de INSERT
                $valuesString = ($linha -split 'VALUES \(')[1].TrimEnd(');')
                # Lida com valores que podem conter vírgulas dentro de aspas (ex: JSON)
                $values = $valuesString | ConvertFrom-Csv -Delimiter ',' -Header (1..100) | ForEach-Object { $_.psobject.properties.value }
                
                if ($idIndex -eq -1 -or $emailIndex -eq -1) {
                    throw "Não foi possível encontrar as colunas 'id' ou 'email' no INSERT de auth.users."
                }
                
                $originalEmail = $values[$emailIndex].Trim(" '")
                
                # VERIFICA O CONFLITO
                if ($existingEmails.Contains($originalEmail)) {
                    $originalId = $values[$idIndex].Trim(" '")
                    $newEmail = "migrated-$originalId@sistema.com"
                    Write-Host "    - Conflito detectado para o e-mail: $originalEmail" -ForegroundColor Yellow
                    Write-Host "    - Mapeando para novo e-mail: $newEmail" -ForegroundColor Yellow
                    
                    # Substitui o e-mail na lista de valores
                    $values[$emailIndex] = "'$newEmail'"
                    
                    # Reconstrói a linha de INSERT
                    $novaLinha = "INSERT INTO public.""auth.users"" ($($colunas -join ', ')) VALUES ($($values -join ', '));"
                    $novasLinhas.Add($novaLinha)
                } else {
                    $novasLinhas.Add($linha) # Adiciona a linha original se não houver conflito
                }
            } else {
                $novasLinhas.Add($linha) # Adiciona linhas que não são de INSERT (comentários, etc.)
            }
        }
        $conteudo = $novasLinhas -join [System.Environment]::NewLine
    }

    # 2. Lógica geral para todos os arquivos (substituição de schema)
    # Garante que qualquer referência ao schema de origem seja trocada pelo de destino.
    $conteudo = $conteudo -replace "$SOURCE_APP_SCHEMA\.", "$TARGET_APP_SCHEMA."
    
    # Limpeza adicional para o arquivo de schema
    if ($arquivo.Name -eq "schema_app.sql") {
        Write-Host "  - Limpando e ajustando arquivo de schema..."
        # Remove comandos que podem causar conflitos se o schema/tipos já existirem
        $conteudo = $conteudo -replace "(?m)^CREATE SCHEMA .*;", "CREATE SCHEMA IF NOT EXISTS $TARGET_APP_SCHEMA;"
        $conteudo = $conteudo -replace "(?sm)^CREATE TYPE .*? AS ENUM .*?;\s*", ""
        $conteudo = $conteudo -replace "(?i)CREATE FUNCTION", "CREATE OR REPLACE FUNCTION"
        $conteudo = $conteudo -replace "(?i)CREATE TABLE", "CREATE TABLE IF NOT EXISTS"
        $conteudo = $conteudo -replace "(?i)CREATE INDEX", "CREATE INDEX IF NOT EXISTS"
        $conteudo = $conteudo -replace "(?i)CREATE UNIQUE INDEX", "CREATE UNIQUE INDEX IF NOT EXISTS"
        $conteudo = $conteudo -replace "(?i)CREATE TRIGGER", "CREATE OR REPLACE TRIGGER"
        # Lida com nomes de políticas com e sem aspas
        $conteudo = $conteudo -replace '(?i)CREATE POLICY ("[^"]+"|\w+) ON ([^ ]+)', 'DROP POLICY IF EXISTS $1 ON $2; CREATE POLICY $1 ON $2'
        
        # Remove outros comandos que podem causar conflitos
        $conteudo = $conteudo -replace "(?sm)^ALTER TABLE .*? ADD CONSTRAINT .*?;\s*", ""
        $conteudo = $conteudo -replace "(?m)^ALTER TABLE .*? ENABLE ROW LEVEL SECURITY;\s*", ""
        $conteudo = $conteudo -replace "(?m)^COMMENT ON .*?;\s*", ""
        $conteudo = $conteudo -replace "(?m)^ALTER SCHEMA .* OWNER TO .*;", ""
        $conteudo = $conteudo -replace "SET search_path = public, pg_catalog;", "SET search_path = $TARGET_APP_SCHEMA, public;"
    }
    
    # 3. Adiciona cabeçalho e salva
    $conteudoFinal = "SET client_encoding = 'UTF8';" + [System.Environment]::NewLine + $conteudo
    Write-Utf8NoBom -Path $destinoPath -Content $conteudoFinal.Split([System.Environment]::NewLine)
    Write-Host "  ✅ Arquivo formatado salvo em: $destinoPath" -ForegroundColor Green
}

Write-Host "`n🎯 Todos os arquivos foram processados e estão prontos para importação na pasta '$DESTINO_DIR'." -ForegroundColor Yellow