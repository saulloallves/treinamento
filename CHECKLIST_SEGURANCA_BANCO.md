# 🔒 CHECKLIST DE SEGURANÇA DO BANCO DE DADOS SUPABASE

Este documento lista os itens críticos que precisam ser validados diretamente no Supabase para garantir a segurança do sistema.

---

## ✅ IMPLEMENTAÇÕES DE CÓDIGO CONCLUÍDAS

- ✅ **vite.config.ts**: Headers de segurança HTTP configurados
- ✅ **vite.config.ts**: Remoção automática de console.log em produção
- ✅ **vite.config.ts**: Code splitting para melhor performance
- ✅ **src/lib/logger.ts**: Sistema de logging centralizado com sanitização de dados sensíveis
- ✅ **package.json**: Scripts de auditoria de segurança adicionados
- ✅ **Build**: Validado e funcionando corretamente

---

## 🔴 CRÍTICO - VALIDAR NO SUPABASE IMEDIATAMENTE

### 1. Row Level Security (RLS)

**Status**: ⚠️ REQUER VALIDAÇÃO

**Ações Necessárias**:

```sql
-- ✅ VERIFICAR: Todas as tabelas devem ter RLS habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname IN ('treinamento', 'public')
  AND rowsecurity = false;

-- Se alguma tabela aparecer, executar:
ALTER TABLE schema_name.table_name ENABLE ROW LEVEL SECURITY;
```

**Tabelas Críticas que DEVEM ter RLS**:
- [ ] `treinamento.users` (dados pessoais dos usuários)
- [ ] `treinamento.admin_users` (administradores)
- [ ] `treinamento.professors` (professores)
- [ ] `treinamento.enrollments` (matrículas)
- [ ] `treinamento.test_submissions` (provas e respostas)
- [ ] `treinamento.test_responses` (respostas dos alunos)
- [ ] `treinamento.attendance` (presenças)
- [ ] `treinamento.certificates` (certificados)
- [ ] `public.unidades` (unidades/franquias)

**Validação**:
```sql
-- Ver políticas existentes de uma tabela
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

### 2. Políticas RLS Restritivas

**Status**: ⚠️ REQUER REVISÃO

**Princípio**: Negar por padrão, permitir explicitamente

**Exemplo de Política SEGURA**:
```sql
-- ❌ INSEGURO: Permite tudo
CREATE POLICY "Allow all" ON users FOR ALL USING (true);

-- ✅ SEGURO: Permite apenas o próprio usuário
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Verificar Políticas Problemáticas**:
```sql
-- Procurar políticas que usam USING (true)
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE qual = 'true';
```

---

### 3. Coluna `visible_password`

**Status**: 🔴 ALTO RISCO

**Problema**: Armazenamento de senhas em texto plano

**Ações**:

```sql
-- ✅ VERIFICAR se a coluna existe
SELECT column_name, table_name
FROM information_schema.columns
WHERE column_name LIKE '%password%'
  AND table_schema IN ('treinamento', 'public');
```

**Opção 1: REMOVER (Recomendado)**
```sql
-- Se não for absolutamente necessário, REMOVER
ALTER TABLE treinamento.users DROP COLUMN IF EXISTS visible_password;
ALTER TABLE treinamento.professors DROP COLUMN IF EXISTS visible_password;
```

**Opção 2: CRIPTOGRAFAR (Se necessário manter)**
```sql
-- Habilitar extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adicionar coluna criptografada
ALTER TABLE treinamento.users
ADD COLUMN encrypted_password TEXT;

-- Migrar dados (uma vez)
UPDATE treinamento.users
SET encrypted_password = encode(
  encrypt(visible_password::bytea, 'sua-chave-secreta', 'aes'),
  'base64'
)
WHERE visible_password IS NOT NULL;

-- Remover coluna antiga
ALTER TABLE treinamento.users DROP COLUMN visible_password;
```

---

### 4. Funções e Triggers de Sincronização

**Status**: ⚠️ REQUER VALIDAÇÃO

**Verificar**:
```sql
-- Listar triggers suspeitos
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('treinamento', 'public');
```

**Validar**:
- [ ] Triggers de sincronização de senha não estão expondo dados
- [ ] Funções RPC não permitem escalação de privilégios
- [ ] Triggers de auditoria estão funcionando

---

### 5. Dados Sensíveis sem Criptografia

**Status**: ⚠️ REQUER AÇÃO

**Campos que DEVEM ser criptografados**:

```sql
-- CPF
ALTER TABLE treinamento.users
ADD COLUMN encrypted_cpf TEXT;

UPDATE treinamento.users
SET encrypted_cpf = encode(
  encrypt(cpf::bytea, 'chave-cpf-secreta', 'aes'),
  'base64'
)
WHERE cpf IS NOT NULL;

-- Criar função para descriptografar (apenas para admins)
CREATE OR REPLACE FUNCTION decrypt_cpf(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 FROM treinamento.admin_users
    WHERE auth.uid() = id
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN convert_from(
    decrypt(
      decode((SELECT encrypted_cpf FROM treinamento.users WHERE id = user_id), 'base64'),
      'chave-cpf-secreta',
      'aes'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql;
```

**Outros Campos a Considerar**:
- [ ] CPF (`treinamento.users.cpf`)
- [ ] Telefone (`treinamento.users.phone`)
- [ ] Dados bancários (se houver)
- [ ] Endereços completos

---

### 6. Funções RPC Expostas

**Status**: ⚠️ REQUER AUDITORIA

**Verificar**:
```sql
-- Listar todas as funções públicas
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema IN ('treinamento', 'public')
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Validar Cada Função**:
- [ ] Verifica autenticação (`auth.uid()` não é null)
- [ ] Verifica autorização (permissões do usuário)
- [ ] Sanitiza inputs (previne SQL injection)
- [ ] Não expõe dados sensíveis desnecessariamente
- [ ] Usa `SECURITY DEFINER` apenas quando necessário

**Exemplo de Função SEGURA**:
```sql
CREATE OR REPLACE FUNCTION get_my_enrollments()
RETURNS TABLE(...)
SECURITY INVOKER -- Executa com permissões do usuário
AS $$
BEGIN
  -- Verificar autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  -- Retornar apenas dados do usuário autenticado
  RETURN QUERY
  SELECT * FROM treinamento.enrollments
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;
```

---

### 7. Configurações de Autenticação

**Status**: ⚠️ REQUER CONFIGURAÇÃO

**No Supabase Dashboard → Authentication → Settings**:

#### Email Auth
- [ ] **Email Confirmation**: ✅ HABILITADO (para produção)
- [ ] **Secure Email Change**: ✅ HABILITADO
- [ ] **Double Confirm Email Changes**: ✅ HABILITADO

#### Password Requirements
- [ ] **Minimum Password Length**: Mínimo 12 caracteres
- [ ] **Password Strength**: Strong

#### Security
- [ ] **Enable Multi-Factor Authentication**: ✅ HABILITADO
- [ ] **Enable Email OTP**: ✅ CONSIDERAR
- [ ] **Session Timeout**: Configurar para 30 minutos de inatividade

#### Rate Limiting
```sql
-- Configurar no Dashboard ou via API
{
  "rate_limit": {
    "sign_in": 5,  // 5 tentativas
    "sign_up": 3,  // 3 tentativas
    "window": 900  // 15 minutos
  }
}
```

---

### 8. Logs e Auditoria

**Status**: ⚠️ REQUER IMPLEMENTAÇÃO

**Criar Tabela de Auditoria**:
```sql
CREATE TABLE IF NOT EXISTS treinamento.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE treinamento.audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler logs
CREATE POLICY "Only admins can read audit logs"
  ON treinamento.audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treinamento.admin_users
      WHERE id = auth.uid()
    )
  );
```

**Criar Trigger de Auditoria para Tabelas Críticas**:
```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO treinamento.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar em tabelas críticas
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON treinamento.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_admin_users
  AFTER INSERT OR UPDATE OR DELETE ON treinamento.admin_users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

### 9. Backup e Recovery

**Status**: ⚠️ VERIFICAR CONFIGURAÇÃO

**No Supabase Dashboard → Settings → Database**:

- [ ] **Point-in-Time Recovery (PITR)**: ✅ HABILITADO
- [ ] **Backup Schedule**: Configurar diário no mínimo
- [ ] **Backup Retention**: Mínimo 7 dias
- [ ] **Testar Recovery**: Fazer teste de restauração mensalmente

---

### 10. Permissions e Roles

**Status**: ⚠️ REQUER VALIDAÇÃO

**Verificar Permissions**:
```sql
-- Ver grants de tabelas
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema IN ('treinamento', 'public')
ORDER BY table_name;
```

**Princípio do Menor Privilégio**:
```sql
-- Revogar permissões desnecessárias
REVOKE ALL ON treinamento.admin_users FROM anon;
REVOKE ALL ON treinamento.admin_users FROM authenticated;

-- Service role só para operações administrativas via Edge Functions
GRANT SELECT, INSERT, UPDATE ON treinamento.users TO service_role;
```

---

### 11. SSL/TLS e Conexões

**Status**: ✅ Supabase gerencia automaticamente

**Validar**:
- [ ] Todas conexões usam HTTPS/TLS
- [ ] Certificados SSL válidos
- [ ] Sem downgrade para HTTP

---

### 12. Secrets e API Keys

**Status**: 🔴 CRÍTICO

**Ações Imediatas**:

1. **Rotacionar Chaves Expostas**
   - [ ] Rotacionar `VITE_SUPABASE_PUBLISHABLE_KEY` se commitado
   - [ ] Rotacionar `EDGE_FUNCTION_CALL_KEY`
   - [ ] Verificar se service_role_key não está exposta

2. **Configurar Secrets para Edge Functions**
   ```bash
   # Via Supabase CLI
   supabase secrets set SECRET_NAME=secret_value
   ```

3. **Nunca Commitar**
   - [ ] Verificar `.gitignore` inclui `.env*`
   - [ ] Remover `.env` do histórico do Git se necessário

---

## 📊 RESUMO DE PRIORIDADES

### 🔴 URGENTE (Fazer Hoje)
1. ✅ Habilitar RLS em TODAS as tabelas
2. ✅ Remover ou criptografar `visible_password`
3. ✅ Rotacionar API keys expostas
4. ✅ Revisar políticas que usam `USING (true)`

### 🟠 ALTA (Esta Semana)
5. ✅ Implementar auditoria de eventos críticos
6. ✅ Criptografar CPF e telefones
7. ✅ Configurar MFA obrigatório para admins
8. ✅ Auditar todas as funções RPC expostas

### 🟡 MÉDIA (Este Mês)
9. ✅ Configurar rate limiting adequado
10. ✅ Implementar monitoramento de logs
11. ✅ Revisar todas as permissões de roles
12. ✅ Testar recovery de backup

---

## 🛠️ COMANDOS ÚTEIS

### Verificar Configuração de Segurança
```sql
-- Resumo de segurança das tabelas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as num_policies
FROM pg_tables t
WHERE schemaname IN ('treinamento', 'public')
ORDER BY schemaname, tablename;
```

### Verificar Último Acesso de Usuários
```sql
-- Requer tabela de auditoria implementada
SELECT
  u.email,
  u.name,
  MAX(a.created_at) as last_activity
FROM auth.users u
LEFT JOIN treinamento.audit_log a ON a.user_id = u.id
GROUP BY u.id, u.email, u.name
ORDER BY last_activity DESC NULLS LAST;
```

### Verificar Tamanho das Tabelas
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('treinamento', 'public')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📞 PRÓXIMOS PASSOS

1. **Acessar Supabase Dashboard**
2. **Executar queries de verificação deste documento**
3. **Implementar correções críticas**
4. **Documentar decisões de segurança**
5. **Agendar revisões mensais de segurança**

---

**Última Atualização**: 2025-11-03
**Versão**: 1.0
**Responsável**: Equipe de Desenvolvimento
