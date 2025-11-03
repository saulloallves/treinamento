# 📝 GUIA DE USO DO LOGGER

Sistema de logging centralizado com sanitização automática de dados sensíveis.

---

## 🎯 Por que usar o Logger?

### Antes (❌ Problemas)
```typescript
console.log('Usuário logado:', user); // Expõe dados sensíveis
console.log('Senha:', password); // CRÍTICO: Expõe senha
console.error('Erro:', error); // Sem controle em produção
```

### Depois (✅ Seguro)
```typescript
import { logger } from '@/lib/logger';

logger.info('Usuário logado:', user); // Sanitiza automaticamente
logger.debug('Debug info:', data); // Só aparece em desenvolvimento
logger.error('Erro:', error); // Preparado para Sentry
```

---

## 📦 Importação

```typescript
import { logger } from '@/lib/logger';
```

---

## 🔧 Métodos Disponíveis

### 1. `logger.info()`
Informações gerais do sistema

```typescript
// Carregamento de dados
logger.info('Cursos carregados:', courses.length);

// Ações do usuário
logger.info('Usuário acessou página de relatórios');

// Status de operações
logger.info('Sincronização concluída com sucesso');
```

### 2. `logger.warn()`
Avisos e situações não ideais

```typescript
// Dados faltando
logger.warn('CPF não fornecido para usuário:', userId);

// Comportamento inesperado
logger.warn('API demorou mais que o esperado:', responseTime);

// Deprecations
logger.warn('Função canBrowserPlayVideo está deprecated');
```

### 3. `logger.error()`
Erros e exceções

```typescript
// Erros em requisições
try {
  await supabase.from('users').select();
} catch (error) {
  logger.error('Erro ao buscar usuários:', error);
}

// Validações falhadas
logger.error('Validação falhou:', validationErrors);

// Operações críticas
logger.error('Falha ao gerar certificado:', { userId, courseId });
```

### 4. `logger.debug()`
Informações de debug (apenas desenvolvimento)

```typescript
// Estados intermediários
logger.debug('Estado atual:', currentState);

// Valores calculados
logger.debug('Score calculado:', calculatedScore);

// Fluxo de dados
logger.debug('Props recebidas:', props);
```

---

## 🔒 Sanitização Automática

O logger **remove automaticamente** dados sensíveis:

```typescript
const userData = {
  name: 'João Silva',
  email: 'joao@email.com',
  password: 'senha123',        // ← Será [REDACTED]
  token: 'abc123xyz',          // ← Será [REDACTED]
  api_key: 'sk_live_123',      // ← Será [REDACTED]
  cpf: '123.456.789-00'
};

logger.info('Dados do usuário:', userData);

// Output:
// [INFO] 2025-11-03T10:30:00.000Z Dados do usuário: {
//   name: 'João Silva',
//   email: 'joao@email.com',
//   password: '[REDACTED]',
//   token: '[REDACTED]',
//   api_key: '[REDACTED]',
//   cpf: '123.456.789-00'
// }
```

### Palavras Sanitizadas
- `password`
- `token`
- `secret`
- `apiKey` / `api_key`
- `authorization`
- `cookie`

---

## 📋 Exemplos Práticos

### Exemplo 1: Formulário de Login
```typescript
// ❌ ANTES
const handleLogin = async (email: string, password: string) => {
  console.log('Tentando login:', { email, password }); // EXPÕE SENHA!

  try {
    const result = await signIn(email, password);
    console.log('Login bem-sucedido:', result);
  } catch (error) {
    console.error('Erro no login:', error);
  }
};

// ✅ DEPOIS
const handleLogin = async (email: string, password: string) => {
  logger.debug('Tentando login para:', email);

  try {
    const result = await signIn(email, password);
    logger.info('Login bem-sucedido:', result); // Sanitiza token
  } catch (error) {
    logger.error('Erro no login:', error);
  }
};
```

### Exemplo 2: Carregamento de Dados
```typescript
// ❌ ANTES
const loadCourses = async () => {
  console.log('Carregando cursos...');

  const { data, error } = await supabase
    .from('courses')
    .select();

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log('Cursos carregados:', data);
};

// ✅ DEPOIS
const loadCourses = async () => {
  logger.info('Iniciando carregamento de cursos');

  const { data, error } = await supabase
    .from('courses')
    .select();

  if (error) {
    logger.error('Erro ao carregar cursos:', error);
    return;
  }

  logger.info('Cursos carregados com sucesso', { count: data.length });
};
```

### Exemplo 3: Operações Críticas
```typescript
// ❌ ANTES
const generateCertificate = async (studentId: string) => {
  console.log('Gerando certificado para:', studentId);

  try {
    const pdf = await createPDF(studentId);
    console.log('Certificado gerado!');
    return pdf;
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
};

// ✅ DEPOIS
const generateCertificate = async (studentId: string) => {
  logger.info('Iniciando geração de certificado', { studentId });

  try {
    const pdf = await createPDF(studentId);
    logger.info('Certificado gerado com sucesso', { studentId });
    return pdf;
  } catch (error) {
    logger.error('Falha crítica ao gerar certificado', {
      studentId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};
```

---

## 🎛️ Configuração

O logger se adapta automaticamente ao ambiente:

### Desenvolvimento (`npm run dev`)
- ✅ Todos os logs aparecem no console
- ✅ Formato legível com timestamps
- ✅ `logger.debug()` funciona

### Produção (`npm run build`)
- ✅ Console.log removidos automaticamente pelo Vite
- ✅ Apenas erros críticos são logados
- ✅ `logger.debug()` não faz nada
- ✅ Preparado para integração com Sentry

---

## 🔮 Futuras Integrações

### Sentry (Monitoramento de Erros)
```typescript
// Em breve
logger.error('Erro crítico', error);
// → Enviado automaticamente para Sentry em produção
```

### LogRocket (Session Replay)
```typescript
// Em breve
logger.info('Usuário completou checkout');
// → Registrado na sessão do LogRocket
```

---

## ✅ Checklist de Migração

Para migrar seu código do `console` para `logger`:

1. **Adicionar import**
   ```typescript
   import { logger } from '@/lib/logger';
   ```

2. **Substituir console.log**
   ```typescript
   // Antes: console.log('Info')
   logger.info('Info')
   ```

3. **Substituir console.warn**
   ```typescript
   // Antes: console.warn('Aviso')
   logger.warn('Aviso')
   ```

4. **Substituir console.error**
   ```typescript
   // Antes: console.error('Erro')
   logger.error('Erro')
   ```

5. **Debug statements**
   ```typescript
   // Antes: console.log('Debug:', data)
   logger.debug('Debug:', data)
   ```

---

## 🚫 O Que NÃO Fazer

### ❌ Não logue senhas diretamente
```typescript
logger.info('Password:', password); // Mesmo com sanitização, evite!
```

### ❌ Não logue objetos muito grandes
```typescript
logger.info('Todo banco:', entireDatabase); // Performance!
```

### ❌ Não logue em loops intensos
```typescript
data.forEach(item => {
  logger.debug('Processing:', item); // 1000x no console!
});

// ✅ Faça isso:
logger.debug('Processing items:', { count: data.length });
```

---

## 📊 Resumo

| Método | Quando Usar | Exemplo |
|--------|-------------|---------|
| `logger.info()` | Informações gerais, ações do usuário | "Curso criado com sucesso" |
| `logger.warn()` | Situações não ideais, avisos | "API lenta, considerar cache" |
| `logger.error()` | Erros e exceções | "Falha ao salvar dados" |
| `logger.debug()` | Debug (só dev) | "Estado atual do componente" |

---

## 🎓 Boas Práticas

1. **Seja descritivo**
   ```typescript
   // ❌ Ruim
   logger.info('Sucesso');

   // ✅ Bom
   logger.info('Certificado gerado com sucesso', { studentId, courseId });
   ```

2. **Inclua contexto**
   ```typescript
   // ❌ Ruim
   logger.error('Erro');

   // ✅ Bom
   logger.error('Erro ao buscar turmas', { userId, filter });
   ```

3. **Use níveis corretos**
   ```typescript
   // ❌ Ruim - Tudo no info
   logger.info('Isso é um erro grave!');

   // ✅ Bom - Nível apropriado
   logger.error('Erro grave ao processar pagamento');
   ```

---

**Última Atualização**: 2025-11-03
