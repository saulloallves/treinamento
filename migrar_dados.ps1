# SCRIPT 3: SUBIR DADOS E APLICAR PERMISSÕES (SEM REDEFINIÇÃO DE SENHA)
$ErrorActionPreference = "Stop"

# ===================================================================
# CONFIGURAÇÃO - Verifique se estas variáveis estão corretas
# ===================================================================
$ORIGEM  = "postgresql://postgres:OrM4B4ywp1tgbg6B@db.tctkacgbhqvkqovctrzf.supabase.co:5432/postgres"
$DESTINO = "postgresql://postgres:usg42RbUUYw1H4xI@db.wpuwsocezhlqlqxifpyk.supabase.co:5432/postgres"
$TARGET_SCHEMA = "treinamento"
$WORK_DIR = "C:\tmp\migracao_postgres"
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin'
# ===================================================================

# --- LÓGICA DO SCRIPT (NÃO EDITAR ABAIXO) ---
$PSQL_PATH = Join-Path $PG_BIN_PATH 'psql.exe'
if (-not (Test-Path $PSQL_PATH)) {
  Write-Host "Binário 'psql.exe' não encontrado. Verifique a variável `$PG_BIN_PATH." -ForegroundColor Red
  exit 1
}

# Nomes dos arquivos de entrada
$dumpAuthUsersData = Join-Path $WORK_DIR "dump_origem_auth_users_data.sql"
$dmpPublicConv = Join-Path $WORK_DIR "dump_formatado_para_treinamento.sql"

if ((-not (Test-Path $dumpAuthUsersData)) -or (-not (Test-Path $dmpPublicConv))) {
  Write-Host "ERRO: Arquivos de dump não encontrados. Execute os scripts 01 e 02 primeiro." -ForegroundColor Red
  exit 1
}

Write-Host "PASSO 3: Subir dados e configurar permissões para o DESTINO" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------------"
Write-Host "Destino: $($DESTINO.Split('@')[1])" -ForegroundColor Yellow
Write-Host ""
Write-Host "ATENÇÃO! Esta ação irá:" -ForegroundColor Red
Write-Host "1. (ASSUMIDO) Que você já limpou a tabela 'auth.users' no destino." -ForegroundColor Yellow
Write-Host "2. APAGAR COMPLETAMENTE o schema '$TARGET_SCHEMA' do destino." -ForegroundColor Red
Write-Host "3. Importar os usuários da origem para 'auth.users'." -ForegroundColor Red
Write-Host "4. (PULADO) A redefinição de senha foi desativada." -ForegroundColor Yellow
Write-Host "5. Importar os dados da aplicação para o schema '$TARGET_SCHEMA'." -ForegroundColor Red
Write-Host "6. APLICAR PERMISSÕES da API (anon, authenticated) ao schema '$TARGET_SCHEMA'." -ForegroundColor Red

$confirm = Read-Host "`nConfirmar e iniciar a restauração completa? (s/N)"
if ($confirm -notin @("s","S")) { exit 0 }

# A ETAPA DA EXTENSÃO pgcrypto FOI REMOVIDA POIS NÃO É MAIS NECESSÁRIA PARA ESTE SCRIPT

# =====================================================================================
# ETAPA 1: Restaurar os dados de 'auth.users'
# =====================================================================================
Write-Host "`n[ETAPA 1/3] Restaurando dados da tabela 'auth.users'..." -ForegroundColor Cyan
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -f "$dumpAuthUsersData"
if ($LASTEXITCODE -ne 0) { throw "Falha ao restaurar dados de 'auth.users'." }
Write-Host "   OK - Dados de 'auth.users' restaurados." -ForegroundColor Green

# =====================================================================================
# ETAPA 2: Redefinir todas as senhas (DESATIVADA)
# =====================================================================================
<#
Write-Host "[ETAPA 2/4] Redefinindo a senha de TODOS os usuários..." -ForegroundColor Cyan
$sqlUpdatePasswords = "UPDATE auth.users SET password = crypt('NOVA_SENHA', gen_salt('bf'));"
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -c $sqlUpdatePasswords
if ($LASTEXITCODE -ne 0) { throw "Falha ao redefinir senhas." }
Write-Host "   OK - Senhas redefinidas." -ForegroundColor Green
#>
Write-Host "[ETAPA 2/3] Pulando redefinição de senha conforme solicitado." -ForegroundColor Yellow
Write-Host "   - Lembrete: usuários precisarão usar a função 'Esqueci minha senha'." -ForegroundColor Yellow

# =====================================================================================
# ETAPA 3: Restaurar os dados da aplicação ('public' -> 'treinamento')
# =====================================================================================
Write-Host "[ETAPA 3/3] Restaurando dados da aplicação para o schema '$TARGET_SCHEMA'..." -ForegroundColor Cyan
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -f "$dmpPublicConv"
if ($LASTEXITCODE -ne 0) { throw "Falha ao restaurar dados de '$TARGET_SCHEMA'." }
Write-Host "   OK - Dados da aplicação restaurados." -ForegroundColor Green

# =====================================================================================
# ETAPA 4: Conceder Permissões para a API (GRANTs)
# =====================================================================================
Write-Host "[ETAPA 4/4] Concedendo permissões da API ao schema '$TARGET_SCHEMA'..." -ForegroundColor Cyan

# Permite que os papéis da API "vejam" o schema.
$sqlGrantUsage = "GRANT USAGE ON SCHEMA $TARGET_SCHEMA TO anon, authenticated;"
Write-Host "   - Concedendo USAGE ON SCHEMA..."
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -c $sqlGrantUsage

# Permissões para usuários LOGADOS
$sqlGrantTablesAuth = "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA $TARGET_SCHEMA TO authenticated;"
Write-Host "   - Concedendo permissões em tabelas para o papel 'authenticated'..."
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -c $sqlGrantTablesAuth

# Permissões para usuários NÃO LOGADOS
$sqlGrantTablesAnon = "GRANT SELECT ON ALL TABLES IN SCHEMA $TARGET_SCHEMA TO anon;"
Write-Host "   - Concedendo permissões em tabelas para o papel 'anon' (apenas leitura)..."
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -c $sqlGrantTablesAnon

# Permissões para SEQUÊNCIAS (IDs automáticos)
$sqlGrantSequencesAuth = "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA $TARGET_SCHEMA TO authenticated;"
Write-Host "   - Concedendo permissões em sequências para o papel 'authenticated'..."
& $PSQL_PATH -v ON_ERROR_STOP=1 -d "$DESTINO" -c $sqlGrantSequencesAuth

Write-Host "   OK - Permissões da API aplicadas com sucesso." -ForegroundColor Green

# =====================================================================================
# ETAPA FINAL: Verificação
# =====================================================================================
Write-Host "`nVerificando contagem de usuários e tabelas..." -ForegroundColor Cyan
& $PSQL_PATH -d "$DESTINO" -c "SELECT (SELECT COUNT(*) FROM auth.users) AS total_usuarios, (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA') AS tabelas_treinamento;"

Write-Host "`nPROCESSO DE MIGRAÇÃO COMPLETO." -ForegroundColor Magenta
Write-Host "`nLEMBRETE IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Não se esqueça de expor o schema '$TARGET_SCHEMA' na API do Supabase!" -ForegroundColor Yellow
Write-Host "Caminho no Dashboard: API Docs > Settings > Exposed schemas > Adicione '$TARGET_SCHEMA' e salve." -ForegroundColor Yellow