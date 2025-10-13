# PASSO 3: PROCESSAR DADOS PARA SCHEMA TREINAMENTO
Write-Host "PASSO 3: Processando dados para schema treinamento..." -ForegroundColor Cyan

if (-not (Test-Path "data_only.sql")) {
    Write-Host "[ERRO] Arquivo data_only.sql nao encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\step2_export.ps1" -ForegroundColor Yellow
    exit 1
}

# Lista de tabelas a migrar
$tablesToMigrate = @(
    'admin_users', 'attendance', 'automated_lesson_dispatches', 'certificates', 
    'class_audit_logs', 'classes', 'collaboration_approvals', 'course_position_access',
    'courses', 'enrollments', 'job_positions', 'kanban_columns', 'lessons', 
    'lesson_sessions', 'live_participants', 'modules', 'password_sync_queue',
    'professor_permissions', 'professor_turma_permissions', 'profiles', 'quiz',
    'quiz_responses', 'recorded_lessons', 'student_classes', 'student_progress',
    'sync_audit_log', 'system_settings', 'tests', 'test_questions', 
    'test_question_options', 'test_responses', 'test_submissions',
    'transformation_kanban', 'turmas', 'unidades', 'users', 'whatsapp_dispatches'
)

Write-Host "Lendo arquivo data_only.sql..." -ForegroundColor Yellow

# Processar arquivo SQL
$sqlContent = Get-Content "data_only.sql" -Raw
$lines = $sqlContent -split "`n"
$processedLines = @()
$insertCount = 0

Write-Host "Processando $($lines.Count) linhas..." -ForegroundColor Yellow

foreach ($line in $lines) {
    $processedLine = $line
    
    # Processar INSERTs
    foreach ($table in $tablesToMigrate) {
        if ($line -match "INSERT INTO (public\.)?$table") {
            $processedLine = $processedLine -replace "INSERT INTO (public\.)?$table", "INSERT INTO treinamento.$table"
            $insertCount++
            break
        }
    }
    
    $processedLines += $processedLine
}

# Salvar arquivo processado
Write-Host "Salvando arquivo processado..." -ForegroundColor Yellow
$processedContent = $processedLines -join "`n"
$processedContent | Out-File -FilePath "data_treinamento.sql" -Encoding UTF8

Write-Host "[OK] Dados processados: $insertCount comandos INSERT ajustados" -ForegroundColor Green

if (Test-Path "data_treinamento.sql") {
    $processedSize = [math]::Round((Get-Item "data_treinamento.sql").Length / 1KB, 1)
    Write-Host "[OK] Arquivo data_treinamento.sql criado ($processedSize KB)" -ForegroundColor Green
    Write-Host "Execute o proximo passo: .\step4_import.ps1" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Falha ao criar arquivo processado!" -ForegroundColor Red
    exit 1
}