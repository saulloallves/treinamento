# Documentação do Sistema Cresci e Perdi

## 📋 Índice

1. [Visão Geral](DOCUMENTACAO.md#visão-geral)
2. [Arquitetura do Sistema](DOCUMENTACAO.md#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](DOCUMENTACAO.md#tecnologias-utilizadas)
4. [Estrutura do Projeto](DOCUMENTACAO.md#estrutura-do-projeto)
5. [Tipos de Usuários e Permissões](DOCUMENTACAO.md#tipos-de-usuários-e-permissões)
6. [Módulos e Funcionalidades](DOCUMENTACAO.md#módulos-e-funcionalidades)
7. [Modelo de Dados](DOCUMENTACAO.md#modelo-de-dados)
8. [Fluxos Principais](DOCUMENTACAO.md#fluxos-principais)
9. [Componentes Reutilizáveis](DOCUMENTACAO.md#componentes-reutilizáveis)
10. [Guia de Desenvolvimento](DOCUMENTACAO.md#guia-de-desenvolvimento)
11. [Segurança e RLS](DOCUMENTACAO.md#segurança-e-rls)
12. [Integração WhatsApp](DOCUMENTACAO.md#integração-whatsapp)
13. [Sistema de Streaming](DOCUMENTACAO.md#sistema-de-streaming)

---

## 🎯 Visão Geral

O **Sistema Cresci e Perdi** é uma plataforma completa de gestão de treinamentos desenvolvida para franquias. O sistema permite a criação, gerenciamento e acompanhamento de cursos, turmas, aulas ao vivo e gravadas, além de avaliações e certificações.

### Principais Objetivos

- Centralizar o treinamento de franqueados e colaboradores
- Permitir aulas ao vivo com integração Zoom
- Gerenciar progresso e desempenho dos alunos
- Automatizar certificação e notificações
- Controlar acesso por cargo e unidade

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  - Vite + TypeScript + Tailwind CSS     │
│  - React Router + TanStack Query        │
│  - Shadcn UI Components                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Backend (Supabase)                 │
│  - PostgreSQL Database                  │
│  - Row Level Security (RLS)             │
│  - Edge Functions                       │
│  - Storage (vídeos, imagens)            │
│  - Authentication                       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Integrações Externas               │
│  - Zoom (aulas ao vivo)                 │
│  - WhatsApp (notificações)              │
│  - Storage (AWS S3/Supabase)            │
└─────────────────────────────────────────┘
```

### Padrões Arquiteturais

- **Frontend**: Component-based architecture com React
- **State Management**: TanStack Query (React Query) para cache e sincronização
- **Routing**: React Router com proteção de rotas por permissão
- **Styling**: Tailwind CSS com design system customizado
- **Database**: PostgreSQL com RLS policies

---

## 💻 Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | ^18.2.0 | Framework UI |
| TypeScript | Latest | Tipagem estática |
| Vite | Latest | Build tool |
| Tailwind CSS | Latest | Styling |
| React Router | ^6.30.1 | Roteamento |
| TanStack Query | ^5.83.0 | Data fetching |
| Shadcn UI | Latest | Componentes UI |
| Lucide React | ^0.462.0 | Ícones |
| React Hook Form | ^7.61.1 | Formulários |
| Zod | ^3.25.76 | Validação |

### Backend (Supabase)

- **Database**: PostgreSQL 15+
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno runtime
- **Real-time**: Supabase Realtime

### Integrações

- **Zoom**: API v2 para criação de meetings
- **WhatsApp**: ZAPI para envio de mensagens
- **Storage**: Supabase Storage para vídeos e imagens

---

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── admin/           # Componentes específicos de admin
│   ├── attendance/      # Sistema de presença
│   ├── certificates/    # Gestão de certificados
│   ├── courses/         # Gestão de cursos
│   ├── enrollments/     # Inscrições
│   ├── layout/          # Sistema de layout padronizado
│   ├── lessons/         # Gestão de aulas
│   ├── mobile/          # Componentes mobile
│   ├── professors/      # Gestão de professores
│   ├── quiz/            # Sistema de quiz
│   ├── student/         # Portal do aluno
│   ├── tests/           # Testes avaliativos
│   ├── turmas/          # Gestão de turmas
│   ├── ui/              # Componentes UI base (shadcn)
│   └── whatsapp/        # Disparos WhatsApp
├── contexts/            # Contextos React
│   └── ProfileContext.tsx
├── hooks/               # Custom hooks
│   ├── useAuth.tsx
│   ├── useCurrentUser.ts
│   ├── useIsAdmin.ts
│   ├── useIsProfessor.ts
│   └── ... (60+ hooks)
├── integrations/        # Integrações
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/                 # Utilitários
│   ├── config.ts
│   ├── dateUtils.ts
│   ├── utils.ts
│   └── videoUtils.ts
├── pages/               # Páginas principais
│   ├── admin/
│   ├── professor/
│   ├── student/
│   └── ... (20+ páginas)
└── utils/               # Funções utilitárias
    └── webRTC.ts

supabase/
├── functions/           # Edge Functions
│   ├── create-admin/
│   ├── create-professor/
│   ├── create-franchisee/
│   ├── whatsapp-disparo/
│   └── ... (15+ functions)
└── migrations/          # Migrações de banco
```

---

## 👥 Tipos de Usuários e Permissões

### 1. **Admin** (Administrador)

**Acesso Total ao Sistema**

- ✅ Gerenciar todos os módulos
- ✅ Criar e aprovar outros admins
- ✅ Criar professores e definir permissões
- ✅ Gerenciar cursos, turmas e conteúdos
- ✅ Acessar relatórios completos
- ✅ Configurações do sistema
- ✅ Gerenciar unidades e franqueados

**Verificação**: Tabela `admin_users` com status `approved`

### 2. **Professor**

**Gerenciamento de Conteúdo e Turmas**

- ✅ Criar e editar cursos (conforme permissões)
- ✅ Gerenciar turmas atribuídas
- ✅ Criar aulas, quiz e testes
- ✅ Acompanhar progresso de alunos
- ✅ Registrar presenças
- ✅ Iniciar aulas ao vivo via Zoom
- ⚠️ Permissões granulares por módulo (tabela `professor_permissions`)
- ⚠️ Permissões específicas por turma (tabela `professor_turma_permissions`)

**Verificação**: Tabela `users` com `user_type = 'Professor'` e `active = true`

### 3. **Aluno - Franqueado**

**Acesso a Treinamentos da Franquia**

- ✅ Visualizar cursos disponíveis para seu perfil
- ✅ Inscrever-se em turmas
- ✅ Assistir aulas ao vivo e gravadas
- ✅ Responder quiz e testes
- ✅ Solicitar certificados
- ✅ Acompanhar próprio progresso
- ✅ Aprovar colaboradores da unidade
- 🔒 Acesso restrito por `unit_code` e fase da loja

**Posições**:
- `FRANQ_IMPLANT` (Fase: Implantação)
- `FRANQ_OPER` (Fase: Operação)
- `FRANQ_GERAL` (Geral)

### 4. **Aluno - Colaborador**

**Acesso a Treinamentos Específicos**

- ✅ Visualizar cursos do seu cargo
- ✅ Participar de turmas
- ✅ Assistir aulas
- ✅ Responder avaliações
- ✅ Visualizar certificados
- 🔒 Requer aprovação do franqueado
- 🔒 Acesso restrito por `position`

**Posições**:
- `ATEND_LOJA` (Atendente de Loja)
- `MIDIAS_SOC` (Mídias Sociais)
- `OP_CAIXA` (Operador de Caixa)
- `AVALIADORA` (Avaliadora)
- `REPOSITOR` (Repositor)
- `LIDER_LOJA` (Líder de Loja)
- `GERENTE` (Gerente)

---

## 🎓 Módulos e Funcionalidades

### 1. **Gestão de Cursos**

**Tipos de Cursos**:
- **Ao Vivo**: Aulas síncronas via Zoom
- **Gravado**: Aulas assíncronas em vídeo

**Funcionalidades**:
- ✅ Criar/editar/excluir cursos
- ✅ Upload de capa do curso
- ✅ Definir público-alvo (Franqueado/Colaborador/Ambos)
- ✅ Configurar acesso por cargo (`course_position_access`)
- ✅ Definir se gera certificado
- ✅ Marcar como obrigatório
- ✅ Status: Ativo, Inativo, Pronto para virar treinamento

**Componentes Principais**:
- `CoursesList.tsx`: Lista de cursos
- `CreateCourseDialog.tsx`: Criação de curso
- `EditCourseDialog.tsx`: Edição de curso
- `CourseDetailDialog.tsx`: Detalhes do curso

**Hooks**:
- `useCourses.ts`: Listagem e filtros
- `useCourseAccess.ts`: Controle de acesso por cargo

### 2. **Gestão de Turmas**

**Funcionalidades**:
- ✅ Criar turmas vinculadas a cursos
- ✅ Definir responsável (professor)
- ✅ Configurar capacidade máxima
- ✅ Janela de inscrição (abertura/fechamento)
- ✅ Datas de início e fim
- ✅ Prazo de conclusão
- ✅ Status: Agendada, Em Andamento, Encerrada

**Componentes Principais**:
- `TurmasList.tsx`: Lista de turmas
- `CreateTurmaDialog.tsx`: Criação de turma
- `TurmaDetailsDialog.tsx`: Detalhes e inscritos
- `TurmaKanbanBoard.tsx`: Kanban de transformação

**Hooks**:
- `useTurmas.ts`: Gestão de turmas
- `useTurmaEnrollment.ts`: Inscrição em turmas

### 3. **Gestão de Aulas (Lessons)**

**Tipos de Aula**:
- **Ao Vivo**: Integração com Zoom
- **Gravada**: Upload de vídeo

**Funcionalidades**:
- ✅ Criar/editar/excluir aulas
- ✅ Agendar aulas ao vivo (Zoom)
- ✅ Upload de vídeos gravados
- ✅ Definir ordem das aulas
- ✅ Duração estimada
- ✅ Material de apoio
- ✅ Palavra-chave de presença

**Componentes Principais**:
- `LessonsList.tsx`: Lista de aulas
- `CreateLessonDialog.tsx`: Criação de aula
- `EditLessonDialog.tsx`: Edição de aula
- `LessonsListForCourse.tsx`: Aulas por curso

**Hooks**:
- `useLessons.ts`: Gestão de aulas
- `useLessonsByCourse.ts`: Aulas de um curso específico
- `useLessonsWithSchedule.ts`: Aulas agendadas

### 4. **Sistema de Inscrições (Enrollments)**

**Funcionalidades**:
- ✅ Inscrição manual pelo admin/professor
- ✅ Auto-inscrição pelo aluno (turmas abertas)
- ✅ Vincular inscrição a turma
- ✅ Controle de progresso (%)
- ✅ Status: Ativo, Concluído, Cancelado
- ✅ Filtro por unidade (franqueados)

**Componentes Principais**:
- `EnrollmentsByCourse.tsx`: Inscritos por curso
- `CreateEnrollmentDialog.tsx`: Nova inscrição
- `CreateManualEnrollmentDialog.tsx`: Inscrição manual
- `TurmaEnrollmentsDialog.tsx`: Inscritos na turma

**Hooks**:
- `useEnrollments.ts`: Gestão de inscrições
- `useMyEnrollments.ts`: Inscrições do aluno logado

### 5. **Sistema de Presença (Attendance)**

**Tipos de Registro**:
- **Manual**: Marcado pelo professor
- **Keyword**: Aluno digita palavra-chave
- **Automático**: Por participação em aula ao vivo

**Funcionalidades**:
- ✅ Registrar presença por aula
- ✅ Palavra-chave dinâmica por aula
- ✅ Histórico de presenças
- ✅ Relatórios de frequência
- ✅ Impacto no progresso do aluno

**Componentes Principais**:
- `AttendanceCard.tsx`: Card de presença
- `AttendancesByCourse.tsx`: Presenças por curso
- `AttendanceButton.tsx`: Botão de marcar presença
- `AttendanceKeywordModal.tsx`: Modal de palavra-chave

**Hooks**:
- Utiliza queries diretas ao Supabase

### 6. **Sistema de Quiz**

**Funcionalidades**:
- ✅ Criar quiz por aula ou turma
- ✅ Múltiplas questões por quiz
- ✅ Tipos: Múltipla escolha, Verdadeiro/Falso
- ✅ Respostas corretas configuráveis
- ✅ Status: Rascunho, Ativo, Inativo
- ✅ Duplicar quiz
- ✅ Visualizar respostas dos alunos

**Componentes Principais**:
- `QuizList.tsx`: Lista de quiz
- `CreateQuizDialog.tsx`: Criar quiz
- `EditFullQuizDialog.tsx`: Editar quiz completo
- `StudentQuizList.tsx`: Quiz para alunos
- `LessonQuiz.tsx`: Quiz de uma aula

**Hooks**:
- `useQuiz.ts`: Gestão de quiz
- `useStudentQuizData.ts`: Dados de quiz para aluno

### 7. **Sistema de Testes Avaliativos**

**Funcionalidades**:
- ✅ Criar testes por turma
- ✅ Múltiplas questões com pontuação
- ✅ Imagens nas questões
- ✅ Tempo limite configurável
- ✅ Limite de tentativas
- ✅ Porcentagem mínima de aprovação
- ✅ Status: Rascunho, Ativo, Inativo
- ✅ Relatórios detalhados de desempenho

**Componentes Principais**:
- `TestsList.tsx`: Lista de testes
- `CreateTestDialog.tsx`: Criar teste
- `ManageTestDialog.tsx`: Gerenciar questões
- `StudentTestsList.tsx`: Testes para alunos
- `StudentTestQuestions.tsx`: Responder teste
- `TestsReports.tsx`: Relatórios

**Hooks**:
- `useTests.ts`: Gestão de testes
- `useStudentTests.ts`: Testes do aluno
- `useTestStats.ts`: Estatísticas de testes
- `useTestDetailedData.ts`: Dados detalhados

### 8. **Sistema de Certificados**

**Funcionalidades**:
- ✅ Geração automática após conclusão
- ✅ Solicitar certificado manualmente
- ✅ Download de certificado
- ✅ Validação de certificado
- ✅ Data de validade configurável
- ✅ Status: Ativo, Revogado

**Componentes Principais**:
- `CertificatesList.tsx`: Lista de certificados
- `CertificateTurmaCard.tsx`: Certificados por turma
- `RequestCertificateButton.tsx`: Solicitar certificado

### 9. **Portal do Aluno**

**Funcionalidades**:
- ✅ Dashboard com cursos inscritos
- ✅ Progresso por curso
- ✅ Aulas disponíveis
- ✅ Quiz e testes pendentes
- ✅ Certificados obtidos
- ✅ Cronograma de aulas ao vivo
- ✅ Perfil do aluno

**Páginas**:
- `StudentPortal.tsx`: Dashboard principal
- `StudentCourses.tsx`: Meus cursos
- `StudentLessons.tsx`: Aulas do curso
- `StudentQuiz.tsx`: Responder quiz
- `StudentTest.tsx`: Fazer teste
- `StudentProfile.tsx`: Perfil

**Hooks**:
- `useStudentPortal.ts`: Dados do portal
- `useStudentProgress.ts`: Progresso do aluno

### 10. **Portal do Professor**

**Funcionalidades**:
- ✅ Dashboard com turmas atribuídas
- ✅ Aulas próximas
- ✅ Atividade recente
- ✅ Estatísticas de desempenho
- ✅ Acesso restrito por permissões

**Páginas**:
- `ProfessorDashboard.tsx`: Dashboard
- `ProfessorReports.tsx`: Relatórios

**Hooks**:
- `useProfessorDashboard.ts`: Dados do dashboard
- `useProfessorPermissions.ts`: Permissões do professor

### 11. **Gestão de Unidades**

**Funcionalidades**:
- ✅ Cadastro de unidades/lojas
- ✅ Código da unidade (unit_code)
- ✅ Fase da loja (Implantação/Operação)
- ✅ Vincular franqueados a unidades
- ✅ Múltiplas unidades por franqueado

**Componentes Principais**:
- `UnidadesList.tsx`: Lista de unidades
- `CreateFranchiseeDialog.tsx`: Criar franqueado
- `EditFranchiseeDialog.tsx`: Editar franqueado

**Hooks**:
- `useUnidades.ts`: Gestão de unidades

### 12. **Sistema de Aprovação de Colaboradores**

**Funcionalidades**:
- ✅ Colaborador solicita acesso
- ✅ Franqueado aprova/rejeita
- ✅ Notificação via WhatsApp
- ✅ Token de aprovação
- ✅ Status: Pendente, Aprovado, Rejeitado

**Componentes Principais**:
- `CollaboratorApprovals.tsx`: Aprovações admin
- `FranchiseeCollaboratorApprovals.tsx`: Aprovações franqueado
- `ApprovedCollaboratorsList.tsx`: Colaboradores aprovados

**Hooks**:
- `useCollaborationApprovals.ts`: Gestão de aprovações

### 13. **Disparos WhatsApp**

**Funcionalidades**:
- ✅ Envio manual de mensagens
- ✅ Disparos automatizados
- ✅ Templates de mensagem
- ✅ Agendamento de disparos
- ✅ Histórico de envios
- ✅ Filtros por turma/curso/unidade

**Componentes Principais**:
- `WhatsAppDispatch.tsx`: Interface de disparo
- `AutomatedDispatches.tsx`: Disparos automáticos
- `LessonDispatchCard.tsx`: Card de aula para disparo

**Hooks**:
- `useWhatsAppDispatches.ts`: Gestão de disparos
- `useAutomatedLessonDispatches.ts`: Disparos automatizados

### 14. **Sistema de Streaming (WebRTC)**

**Funcionalidades**:
- ✅ Aulas ao vivo P2P
- ✅ Compartilhamento de tela
- ✅ Chat em tempo real
- ✅ Lista de participantes
- ✅ Controles de áudio/vídeo

**Componentes Principais**:
- `LiveStreamRoom.tsx`: Sala de streaming
- `VideoGrid.tsx`: Grid de vídeos
- `StreamControls.tsx`: Controles
- `ChatPanel.tsx`: Chat
- `ParticipantsList.tsx`: Participantes

---

## 🗄️ Modelo de Dados

### Tabelas Principais

#### **users**
```sql
- id: uuid (PK)
- email: text
- name: text
- phone: text
- user_type: enum (Professor, Aluno)
- role: enum (Admin, Franqueado, Colaborador)
- position: text (cargo do colaborador)
- unit_code: text (código da unidade)
- unit_codes: text[] (múltiplas unidades para franqueado)
- approval_status: enum (pendente, aprovado, rejeitado)
- visible_password: text
- active: boolean
```

#### **admin_users**
```sql
- id: uuid (PK)
- user_id: uuid (FK -> users)
- email: text
- name: text
- role: text
- status: text (pending, approved, rejected)
- active: boolean
```

#### **courses**
```sql
- id: uuid (PK)
- name: text
- description: text
- tipo: text (ao_vivo, gravado)
- public_target: text (franqueado, colaborador, ambos)
- status: text
- theme: text[]
- mandatory: boolean
- generates_certificate: boolean
- lessons_count: integer
- cover_image_url: text
```

#### **turmas**
```sql
- id: uuid (PK)
- name: text
- code: text
- course_id: uuid (FK -> courses)
- responsavel_user_id: uuid (FK -> users)
- status: text (agendada, em_andamento, encerrada)
- capacity: integer
- enrollment_open_at: timestamp
- enrollment_close_at: timestamp
- start_at: timestamp
- end_at: timestamp
- completion_deadline: date
```

#### **lessons**
```sql
- id: uuid (PK)
- title: text
- description: text
- course_id: uuid (FK -> courses)
- order_index: integer
- duration_minutes: integer
- video_url: text
- status: text
- zoom_meeting_id: text
- zoom_join_url: text
- zoom_start_url: text
- attendance_keyword: text
- live_stream_room_id: uuid
```

#### **enrollments**
```sql
- id: uuid (PK)
- user_id: uuid (FK -> users)
- course_id: uuid (FK -> courses)
- turma_id: uuid (FK -> turmas)
- student_name: text
- student_email: text
- student_phone: text
- unit_code: text
- status: text
- progress_percentage: integer
- enrollment_date: timestamp
```

#### **attendance**
```sql
- id: uuid (PK)
- user_id: uuid (FK -> users)
- lesson_id: uuid (FK -> lessons)
- enrollment_id: uuid (FK -> enrollments)
- turma_id: uuid (FK -> turmas)
- attendance_type: text (manual, keyword, automatic)
- typed_keyword: text
- confirmed_at: timestamp
```

#### **quiz**
```sql
- id: uuid (PK)
- course_id: uuid (FK -> courses)
- lesson_id: uuid (FK -> lessons)
- turma_id: uuid (FK -> turmas)
- quiz_name: text
- question: text
- option_a: text
- option_b: text
- option_c: text
- option_d: text
- correct_answer: text
- question_type: text
- status: text (rascunho, ativo)
- order_index: integer
```

#### **tests**
```sql
- id: uuid (PK)
- name: text
- description: text
- course_id: uuid (FK -> courses)
- turma_id: uuid (FK -> turmas)
- status: enum (draft, active, inactive)
- passing_percentage: integer
- max_attempts: integer
- time_limit_minutes: integer
```

#### **test_questions**
```sql
- id: uuid (PK)
- test_id: uuid (FK -> tests)
- question_text: text
- question_type: text
- max_score: integer
- question_order: integer
- image_urls: text[]
```

#### **test_question_options**
```sql
- id: uuid (PK)
- question_id: uuid (FK -> test_questions)
- option_text: text
- score_value: integer
- option_order: integer
```

#### **test_submissions**
```sql
- id: uuid (PK)
- test_id: uuid (FK -> tests)
- user_id: uuid (FK -> users)
- attempt_number: integer
- status: enum (in_progress, completed)
- total_score: integer
- max_possible_score: integer
- percentage: numeric
- passed: boolean
- started_at: timestamp
- submitted_at: timestamp
```

#### **certificates**
```sql
- id: uuid (PK)
- user_id: uuid (FK -> users)
- course_id: uuid (FK -> courses)
- turma_id: uuid (FK -> turmas)
- enrollment_id: uuid (FK -> enrollments)
- certificate_url: text
- status: text
- generated_at: timestamp
- valid_until: timestamp
```

### Relacionamentos Principais

```
users (1) -----> (N) enrollments
users (1) -----> (N) quiz_responses
users (1) -----> (N) test_submissions
users (1) -----> (N) attendance

courses (1) -----> (N) turmas
courses (1) -----> (N) lessons
courses (1) -----> (N) enrollments
courses (1) -----> (N) quiz

turmas (1) -----> (N) enrollments
turmas (1) -----> (N) tests

lessons (1) -----> (N) attendance
lessons (1) -----> (N) quiz

tests (1) -----> (N) test_questions
test_questions (1) -----> (N) test_question_options
tests (1) -----> (N) test_submissions
```

---

## 🔄 Fluxos Principais

### 1. Fluxo de Criação de Curso Completo

```
1. Admin/Professor cria CURSO
   ├── Define tipo (ao vivo/gravado)
   ├── Define público-alvo
   ├── Configura acesso por cargo
   └── Upload de capa

2. Cria AULAS vinculadas ao curso
   ├── Se ao vivo: agenda Zoom meeting
   ├── Se gravado: upload de vídeo
   └── Define palavra-chave de presença

3. Cria QUIZ por aula (opcional)
   └── Define questões e respostas

4. Cria TURMA vinculada ao curso
   ├── Define responsável (professor)
   ├── Configura capacidade
   ├── Define janela de inscrição
   └── Define datas de início/fim

5. Cria TESTE por turma (opcional)
   ├── Define questões com pontuação
   └── Configura aprovação mínima

6. Alunos se INSCREVEM na turma
   └── Sistema valida acesso por cargo

7. Turma é INICIADA
   ├── Alunos acessam aulas
   ├── Respondem quiz e testes
   └── Sistema registra progresso

8. Turma é FINALIZADA
   └── Certificados são gerados automaticamente
```

### 2. Fluxo de Inscrição do Aluno

```
1. Aluno acessa portal
   └── Sistema identifica tipo (Franqueado/Colaborador)

2. Visualiza cursos disponíveis
   └── Filtrado por cargo e unit_code

3. Seleciona curso e turma
   └── Verifica janela de inscrição

4. Confirma inscrição
   ├── Sistema cria enrollment
   └── Vincula à turma

5. Acessa dashboard com cursos
   └── Visualiza aulas, quiz e testes
```

### 3. Fluxo de Aula ao Vivo

```
1. Professor agenda aula via Zoom
   └── Sistema cria meeting e armazena URLs

2. Sistema envia notificação WhatsApp
   └── 24h antes, 1h antes, início

3. Aluno clica em "Entrar na Aula"
   └── Redireciona para Zoom

4. Durante/após a aula:
   ├── Professor define palavra-chave
   └── Aluno digita palavra-chave

5. Sistema registra presença
   └── Atualiza progresso do aluno
```

### 4. Fluxo de Teste Avaliativo

```
1. Aluno acessa teste ativo
   └── Sistema inicia submission

2. Aluno responde questões
   └── Respostas salvas em test_responses

3. Aluno finaliza teste
   ├── Sistema calcula pontuação total
   ├── Verifica se passou (% mínima)
   └── Atualiza submission status

4. Aluno visualiza resultado
   └── Nota, acertos, feedback

5. Professor acessa relatórios
   └── Desempenho por aluno/questão
```

### 5. Fluxo de Aprovação de Colaborador

```
1. Colaborador se registra
   └── Informa unit_code e cargo

2. Sistema cria registro em collaboration_approvals
   └── Status: pendente

3. Edge function notifica franqueado via WhatsApp
   └── Envia link com approval_token

4. Franqueado acessa link
   └── Visualiza dados do colaborador

5. Franqueado aprova/rejeita
   ├── Se aprovado: colaborador acessa sistema
   └── Se rejeitado: acesso bloqueado
```

---

## 🧩 Componentes Reutilizáveis

### Sistema de Layout Padronizado

Localização: `src/components/layout/`

#### **PageHeader**
```tsx
<PageHeader
  icon={BookOpen}
  title="Gerenciar Cursos"
  description="Crie e gerencie cursos do sistema"
  actions={<Button>Novo Curso</Button>}
/>
```

#### **PageFilters**
```tsx
<PageFilters
  searchPlaceholder="Buscar..."
  searchValue={search}
  onSearchChange={setSearch}
  filters={[
    {
      placeholder: "Status",
      value: status,
      options: [...],
      onChange: setStatus
    }
  ]}
/>
```

#### **MetricsGrid**
```tsx
<MetricsGrid
  metrics={[
    {
      title: "Total de Cursos",
      value: 45,
      icon: BookOpen,
      changeType: "positive"
    }
  ]}
  columns={4}
/>
```

#### **EmptyState**
```tsx
<EmptyState
  icon={Users}
  title="Nenhum resultado"
  description="Ajuste os filtros"
  actionLabel="Criar Novo"
  onAction={handleCreate}
/>
```

#### **StandardCard**
```tsx
<StandardCard
  title="Título"
  description="Descrição"
  variant="elevated"
  footer={<Button>Ação</Button>}
>
  {/* Conteúdo */}
</StandardCard>
```

### Componentes Mobile

Localização: `src/components/mobile/`

- `MobileHeader.tsx`: Header mobile
- `BottomNavigation.tsx`: Navegação inferior
- `FloatingActionButton.tsx`: FAB
- `FilterDrawer.tsx`: Drawer de filtros
- `PullToRefresh.tsx`: Pull-to-refresh
- `TouchCard.tsx`: Card touch-friendly

### Componentes UI Base (Shadcn)

Localização: `src/components/ui/`

- `button.tsx`: Botões com variants
- `card.tsx`: Cards
- `dialog.tsx`: Modais
- `form.tsx`: Formulários
- `table.tsx`: Tabelas
- `select.tsx`: Selects
- `input.tsx`: Inputs
- `badge.tsx`: Badges
- `alert.tsx`: Alertas
- `toast.tsx`: Toasts/notificações

---

## 🛠️ Guia de Desenvolvimento

### Configuração do Ambiente

1. **Clonar repositório**
```bash
git clone <repo-url>
cd cresci-perdi
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente**
```bash
# .env
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-key
```

4. **Rodar projeto**
```bash
npm run dev
```

### Convenções de Código

#### Nomenclatura

- **Componentes**: PascalCase (`UserList.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useUsers.ts`)
- **Funções**: camelCase (`fetchUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Tipos/Interfaces**: PascalCase (`User`, `CourseData`)

#### Estrutura de Componente

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onAction}>Ação</Button>
    </div>
  );
};
```

#### Estrutura de Hook

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMyData = (id: string) => {
  return useQuery({
    queryKey: ['my-data', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};
```

### Criando Nova Funcionalidade

1. **Criar componente em pasta apropriada**
```
src/components/minha-funcionalidade/
├── MeuComponente.tsx
├── MeuDialog.tsx
└── MinhaLista.tsx
```

2. **Criar hook se necessário**
```
src/hooks/useMeusDados.ts
```

3. **Adicionar rota (se for página)**
```tsx
// App.tsx
<Route path="/minha-rota" element={<MinhaPage />} />
```

4. **Adicionar link na navegação**
```tsx
// ModernSidebar.tsx
{
  label: "Minha Funcionalidade",
  icon: MyIcon,
  href: "/minha-rota",
  roles: ["admin"]
}
```

5. **Testar responsividade**
   - Desktop: 1920x1080
   - Tablet: 768x1024
   - Mobile: 375x667

### Trabalhando com Supabase

#### Query Simples
```ts
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('active', true);
```

#### Query com Join
```ts
const { data } = await supabase
  .from('enrollments')
  .select(`
    *,
    courses (id, name),
    users (id, name, email)
  `)
  .eq('user_id', userId);
```

#### Insert
```ts
const { data, error } = await supabase
  .from('courses')
  .insert({
    name: 'Novo Curso',
    status: 'Ativo'
  })
  .select()
  .single();
```

#### Update
```ts
const { error } = await supabase
  .from('courses')
  .update({ status: 'Inativo' })
  .eq('id', courseId);
```

#### Delete
```ts
const { error } = await supabase
  .from('courses')
  .delete()
  .eq('id', courseId);
```

### Edge Functions

Criar nova function:

```bash
supabase functions new minha-function
```

Estrutura básica:
```ts
// supabase/functions/minha-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data } = await req.json();
  
  // Lógica aqui
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

Deploy:
```bash
supabase functions deploy minha-function
```

---

## 🔒 Segurança e RLS

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado.

#### Funções de Verificação

**is_admin**
```sql
CREATE FUNCTION is_admin(_user uuid)
RETURNS boolean
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = _user
      AND active = true
      AND status = 'approved'
  );
$$;
```

**is_professor**
```sql
CREATE FUNCTION is_professor(_user uuid)
RETURNS boolean
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = _user
      AND user_type = 'Professor'
      AND active = true
  );
$$;
```

**user_can_access_turma**
```sql
CREATE FUNCTION user_can_access_turma(_user_id uuid, _turma_id uuid)
RETURNS boolean
AS $$
  SELECT 
    is_admin(_user_id) OR
    EXISTS (
      SELECT 1 FROM turmas
      WHERE id = _turma_id
        AND responsavel_user_id = _user_id
    ) OR
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE turma_id = _turma_id
        AND user_id = _user_id
    );
$$;
```

#### Políticas de Exemplo

**Cursos**
```sql
-- Todos podem visualizar
CREATE POLICY "Users can view all courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Apenas admins/professores podem criar
CREATE POLICY "Authenticated users can create courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
```

**Inscrições**
```sql
-- Alunos veem suas próprias inscrições
CREATE POLICY "Students can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins veem todas
CREATE POLICY "Admins can view all enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));
```

### Boas Práticas de Segurança

1. **Nunca confiar apenas no frontend**
   - Validações críticas no backend/RLS
   - Edge functions para lógica sensível

2. **Usar funções SECURITY DEFINER**
   - Evitar recursão em RLS
   - Encapsular lógica complexa

3. **Validar permissões em múltiplas camadas**
   - RLS no banco
   - Validação na edge function
   - Validação no frontend (UX)

4. **Não expor dados sensíveis**
   - Senhas sempre hasheadas
   - Tokens em variáveis de ambiente
   - Logs sem informações pessoais

5. **Controle de acesso granular**
   - Permissões por módulo (professores)
   - Acesso por cargo (alunos)
   - Aprovação de colaboradores

---

## 📱 Integração WhatsApp

### Configuração ZAPI

Variáveis necessárias:
```
ZAPI_INSTANCE_ID_TREINAMENTO=sua-instance
ZAPI_INSTANCE_TOKEN_TREINAMENTO=seu-token
ZAPI_CLIENT_TOKEN_TREINAMENTO=seu-client-token
```

### Tipos de Disparo

#### 1. Manual
```ts
// supabase/functions/whatsapp-disparo/index.ts
const response = await fetch(
  `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phoneNumber,
      message: messageText
    })
  }
);
```

#### 2. Automatizado (Agendado)
```ts
// supabase/functions/whatsapp-scheduler/index.ts
// Roda via cron job
// Busca disparos agendados e envia
```

### Templates de Mensagem

**Lembrete de Aula**
```
🎓 Olá {nome}!

📚 Lembrete: Aula "{titulo}" será em {data} às {hora}.

🔗 Link: {zoom_url}

Nos vemos lá! 🚀
```

**Aprovação de Colaborador**
```
✅ Solicitação de aprovação recebida!

👤 Colaborador: {nome}
🏪 Unidade: {unidade}
💼 Cargo: {cargo}

🔗 Aprovar/Rejeitar: {link}
```

---

## 📊 Relatórios e Analytics

### Relatórios Disponíveis

1. **Desempenho por Turma**
   - Média de notas
   - Taxa de aprovação
   - Frequência média
   - Progresso geral

2. **Desempenho por Aluno**
   - Notas em testes
   - Presenças
   - Progresso em cursos
   - Certificados obtidos

3. **Desempenho por Curso**
   - Inscritos totais
   - Concluintes
   - Taxa de conclusão
   - Avaliação média

4. **Estatísticas de Testes**
   - Notas por questão
   - Questões mais erradas
   - Tempo médio de conclusão
   - Taxa de aprovação

### Hooks de Relatórios

- `useEvaluationReports.ts`: Relatórios de avaliação
- `useTestReports.ts`: Relatórios de testes
- `useDetailedTurmaReports.ts`: Relatórios detalhados de turma
- `useQuizDetailedData.ts`: Dados detalhados de quiz
- `useTestDetailedData.ts`: Dados detalhados de testes

---

## 🚀 Deploy e Produção

### Deploy Frontend (Lovable)

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático via Git push

### Deploy Supabase

```bash
# Aplicar migrações
supabase db push

# Deploy edge functions
supabase functions deploy --project-ref <ref>
```

### Monitoramento

- **Logs do Supabase**: Dashboard > Logs
- **Edge Functions**: Dashboard > Functions > Logs
- **Database**: Dashboard > Database > Query logs
- **Auth**: Dashboard > Authentication > Logs

### Backup

- **Database**: Backup automático pelo Supabase
- **Storage**: Replicação configurada
- **Código**: Git + GitHub

---

## 📖 Recursos Adicionais

### Documentação Externa

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)

### Arquivos de Referência

- `src/components/layout/README.md`: Sistema de layout
- `MIGRATION_GUIDE.md`: Guia de migração de páginas

---

## 🤝 Contribuindo

### Processo de Desenvolvimento

1. Criar branch feature
2. Implementar funcionalidade
3. Testar localmente
4. Commit com mensagem descritiva
5. Push e criar PR
6. Code review
7. Merge após aprovação

### Padrões de Commit

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou modifica testes
chore: tarefas de manutenção
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar esta documentação
2. Consultar logs do Supabase
3. Verificar console do navegador
4. Contatar equipe de desenvolvimento

---

**Última atualização**: 2025-01-02
**Versão**: 1.0.0
