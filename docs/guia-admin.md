# 📕 Guia do Administrador - Sistema de Treinamento

Bem-vindo, Administrador! Este é o guia completo para gerenciar todo o sistema de treinamento. Você tem controle total sobre cursos, turmas, professores, alunos e relatórios.

---

## 🎯 Índice Completo:

### Estrutura do Sistema
- [Entendendo a hierarquia do sistema](#-entendendo-a-hierarquia-do-sistema)

### Gestão de Conteúdo
- [Criando Cursos](#-criando-cursos)
- [Criando Módulos](#-criando-módulos)
- [Criando Aulas](#-criando-aulas)
- [Inserindo aulas gravadas em turmas](#-inserindo-aulas-gravadas-em-turmas-manualmente)
- [Criando Turmas](#-criando-turmas)

### Avaliações
- [Criando Quizzes](#-criando-quizzes)
- [Criando Provas](#-criando-provas)
- [Vinculando avaliações a turmas](#-vinculando-avaliações-a-turmas)

### Gestão de Pessoas
- [Gerenciando Professores](#-gerenciando-professores)
- [Gerenciando Alunos](#-gerenciando-alunos)
- [Gerenciando Unidades e Franquias](#-gerenciando-unidades-e-franquias)
- [Usando o Kanban de Alunos](#-usando-o-kanban-de-alunos)

### Relatórios e Insights
- [Relatórios de Turmas](#-relatórios-de-turmas)
- [Relatórios de Avaliações](#-relatórios-de-avaliações)
- [Dashboard e Métricas](#-dashboard-e-métricas)

---

## 🏗️ Entendendo a Hierarquia do Sistema

O sistema segue uma estrutura organizada. É **MUITO IMPORTANTE** criar as coisas nesta ordem:

```
1. CURSO (Ex: "Marketing Digital Avançado")
   └── 2. MÓDULOS (Ex: "Módulo 1 - Fundamentos", "Módulo 2 - Redes Sociais")
       └── 3. AULAS (Ex: "Aula 1 - Introdução ao Marketing")
           └── 4. TURMAS (Ex: "Turma A - Março 2024")
               └── 5. ALUNOS (Inscritos nas turmas)
```

### **Resumo simples:**
1. **Curso** = O programa completo (ex: "Marketing Digital")
2. **Módulo** = Divisões do curso (ex: "Módulo 1", "Módulo 2")
3. **Aula** = Conteúdo individual dentro de um módulo (ex: "Aula sobre SEO")
4. **Turma** = Grupo de alunos que vai estudar o curso juntos
5. **Aluno** = Pessoa matriculada na turma

### **⚠️ IMPORTANTE:**
- Você **PRIMEIRO** cria o conteúdo (curso, módulos, aulas)
- **DEPOIS** cria turmas para os alunos estudarem
- Aulas gravadas são criadas em "Aulas" mas inseridas **manualmente** nas turmas
- Cada turma pode ter uma programação diferente, mesmo sendo do mesmo curso

---

## 📚 Criando Cursos

### **O que é um curso?**
Um curso é o programa completo de treinamento. Exemplo: "Marketing Digital", "Vendas Avançadas", "Liderança".

### **Passo 1: Acessar a área de cursos**

1. No menu lateral, clique em **"Cursos"**
2. Você verá todos os cursos cadastrados
3. Clique no botão **"+ Novo Curso"**

### **Passo 2: Preencher informações do curso**

1. **Nome do Curso** (obrigatório)
   - Exemplo: "Marketing Digital Completo"
   - Use um nome claro e descritivo

2. **Descrição** (obrigatório)
   - Explique o que o aluno vai aprender
   - Seja específico sobre os benefícios
   - Exemplo: "Aprenda a criar campanhas de marketing digital do zero, incluindo redes sociais, e-mail marketing e anúncios pagos."

3. **Carga Horária** (opcional)
   - Total de horas do curso
   - Exemplo: "40 horas"

4. **Capa do Curso** (opcional, mas recomendado)
   - Faça upload de uma imagem atraente
   - Tamanho recomendado: 1200x600 pixels
   - Formatos: JPG ou PNG

5. **Status** (obrigatório)
   - **Ativo** - Curso visível e disponível para matrículas
   - **Inativo** - Curso oculto, não aparece para alunos

6. Clique em **"Criar Curso"**

### **Passo 3: Após criar o curso**

Agora você pode:
- Adicionar módulos ao curso
- Visualizar detalhes do curso
- Editar informações
- Criar turmas baseadas neste curso

---

## 📂 Criando Módulos

### **O que é um módulo?**
Módulos são divisões do curso. Cada curso pode ter vários módulos para organizar o conteúdo.

Exemplo de curso com módulos:
- **Curso:** "Marketing Digital"
  - Módulo 1: Fundamentos
  - Módulo 2: Redes Sociais
  - Módulo 3: E-mail Marketing
  - Módulo 4: Anúncios Pagos

### **Passo 1: Acessar módulos de um curso**

1. Clique em **"Cursos"** no menu
2. Clique no curso desejado
3. Dentro do curso, clique em **"Módulos"**
4. Clique em **"+ Novo Módulo"**

### **Passo 2: Criar o módulo**

1. **Nome do Módulo** (obrigatório)
   - Exemplo: "Módulo 1 - Fundamentos do Marketing"
   - Use numeração para manter ordem

2. **Descrição** (opcional)
   - O que será ensinado neste módulo

3. **Ordem** (obrigatório)
   - Defina a sequência dos módulos
   - Exemplo: 1, 2, 3, 4...

4. Clique em **"Criar Módulo"**

### **Passo 3: Adicionar aulas ao módulo**

Agora você pode criar aulas dentro deste módulo.

---

## 🎥 Criando Aulas

### **Tipos de Aulas:**

1. **Aula Gravada** - Vídeo já gravado que os alunos assistem quando quiserem
2. **Aula ao Vivo** - Transmissão ao vivo com professor e horário marcado

### **Passo 1: Acessar a área de aulas**

1. No menu lateral, clique em **"Aulas"**
2. Clique em **"+ Nova Aula"**

### **Passo 2: Informações básicas**

1. **Nome da Aula** (obrigatório)
   - Exemplo: "Aula 1 - Introdução ao Marketing Digital"
   - Seja específico sobre o conteúdo

2. **Descrição** (obrigatório)
   - O que será ensinado nesta aula
   - Tópicos principais

3. **Selecione o Curso** (obrigatório)
   - Escolha a qual curso esta aula pertence

4. **Selecione o Módulo** (obrigatório)
   - Escolha o módulo dentro do curso

5. **Duração** (opcional)
   - Tempo estimado da aula
   - Exemplo: "1 hora", "45 minutos"

### **Passo 3: Tipo de aula**

#### **Para Aula GRAVADA:**

1. Marque o tipo como **"Aula Gravada"**

2. **Fazer upload do vídeo:**
   - Clique em **"Fazer Upload"**
   - Selecione o arquivo de vídeo do seu computador
   - Aguarde o upload completar (pode demorar para vídeos grandes)
   - Formatos aceitos: MP4, MOV, AVI

3. **OU adicionar link de vídeo:**
   - Cole o link do YouTube, Vimeo ou outro
   - Exemplo: `https://youtube.com/watch?v=xxxxx`

4. **Material de Apoio** (opcional)
   - Faça upload de PDFs, slides, documentos
   - Os alunos poderão baixar

#### **Para Aula AO VIVO:**

1. Marque o tipo como **"Aula ao Vivo"**

2. **NÃO precisa de vídeo** - A transmissão será em tempo real

3. **Data e Horário** serão definidos quando você adicionar a aula a uma turma

### **Passo 4: Criar a aula**

1. Revise todas as informações
2. Clique em **"Criar Aula"**
3. A aula foi criada mas ainda NÃO está disponível para alunos

---

## 📌 Inserindo Aulas Gravadas em Turmas (MANUALMENTE)

### **⚠️ MUITO IMPORTANTE - Leia com atenção:**

Quando você cria uma **aula gravada**, ela fica no "banco de aulas" do sistema. Para que os alunos vejam essa aula, você precisa **adicionar manualmente** à turma.

### **Por que fazer isso?**
- Diferentes turmas podem ter cronogramas diferentes
- Você controla exatamente quando liberar cada aula
- Pode reutilizar a mesma aula em várias turmas

### **Passo 1: Acessar a turma**

1. No menu lateral, clique em **"Turmas"**
2. Clique na turma onde quer adicionar a aula

### **Passo 2: Adicionar aula gravada**

1. Dentro da turma, procure por **"Aulas da Turma"** ou **"Cronograma"**
2. Clique em **"+ Adicionar Aula"**
3. Uma lista de aulas disponíveis aparecerá
4. **Filtrar por curso:** Selecione o curso da turma para ver apenas aulas relevantes
5. Encontre a aula gravada que criou anteriormente
6. Clique em **"Adicionar à Turma"**

### **Passo 3: Configurar disponibilidade**

1. **Data de Liberação** (opcional)
   - Quando os alunos poderão ver essa aula
   - Se deixar em branco, fica disponível imediatamente

2. **Ordem na Turma**
   - Em que posição essa aula aparece no cronograma
   - Exemplo: 1ª aula, 2ª aula, etc.

3. Clique em **"Confirmar"**

### **Passo 4: Aula adicionada!**

Agora os alunos desta turma podem assistir a aula gravada.

---

## 👥 Criando Turmas

### **O que é uma turma?**
Uma turma é um grupo de alunos que vai estudar um curso juntos, com datas e horários específicos.

### **Passo 1: Acessar turmas**

1. No menu lateral, clique em **"Turmas"**
2. Clique em **"+ Nova Turma"**

### **Passo 2: Informações da turma**

1. **Nome da Turma** (obrigatório)
   - Exemplo: "Marketing Digital - Turma Março 2024"
   - Use nomes que identifiquem período ou grupo

2. **Selecione o Curso** (obrigatório)
   - Qual curso essa turma vai estudar

3. **Professor Responsável** (obrigatório)
   - Selecione o professor que vai ministrar as aulas ao vivo
   - Se o professor não aparecer, você precisa cadastrá-lo primeiro

4. **Data de Início** (obrigatório)
   - Quando a turma começa

5. **Data de Término** (opcional)
   - Quando a turma termina

6. **Horário das Aulas** (opcional)
   - Exemplo: "Terças e Quintas, 19h às 21h"

7. **Máximo de Alunos** (opcional)
   - Limite de vagas
   - Deixe em branco para ilimitado

8. **Status** (obrigatório)
   - **Ativa** - Turma em andamento, aceita matrículas
   - **Inativa** - Turma encerrada ou não iniciada

9. Clique em **"Criar Turma"**

### **Passo 3: Configurar a turma**

Após criar, você pode:
1. **Adicionar aulas ao cronograma** (gravadas e ao vivo)
2. **Matricular alunos**
3. **Vincular quizzes e provas**
4. **Configurar palavra-chave de presença**

### **Adicionando aulas ao vivo à turma:**

1. Dentro da turma, clique em **"+ Adicionar Aula ao Vivo"**
2. Selecione a aula que criou anteriormente
3. Defina **Data e Horário** específicos para esta turma
4. Clique em **"Agendar"**
5. Os alunos verão essa aula agendada no cronograma

---

## 📝 Criando Quizzes

### **O que é um quiz?**
Um quiz é uma avaliação curta, geralmente sobre uma aula ou módulo específico. Pode ter questões de múltipla escolha ou dissertativas.

### **Passo 1: Acessar quizzes**

1. No menu lateral, clique em **"Quizzes"** ou **"Avaliações"**
2. Clique em **"+ Novo Quiz"**

### **Passo 2: Informações do quiz**

1. **Nome do Quiz** (obrigatório)
   - Exemplo: "Quiz - Fundamentos do Marketing"
   - Seja claro sobre o conteúdo avaliado

2. **Descrição** (opcional)
   - Instruções para os alunos
   - Exemplo: "Responda as 10 questões sobre o conteúdo da aula 1"

3. **Vinculado à Aula** (opcional)
   - Se for um quiz sobre uma aula específica, selecione-a

4. **Tempo Limite** (opcional)
   - Se deixar em branco, não há limite de tempo
   - Se definir (ex: 30 minutos), o quiz será cronometrado

5. **Número de Tentativas** (opcional)
   - Quantas vezes o aluno pode refazer
   - 1 = apenas uma tentativa
   - Deixe em branco = ilimitado

6. **Nota Mínima para Aprovação** (opcional)
   - Exemplo: 7.0 ou 70%

### **Passo 3: Adicionar questões**

#### **Opção A - Criar questões manualmente (uma por vez):**

1. Clique em **"+ Adicionar Questão"**

2. **Tipo de Questão:**
   - **Múltipla Escolha** - O aluno escolhe uma alternativa
   - **Dissertativa** - O aluno escreve uma resposta

3. **Para Múltipla Escolha:**
   - Digite o enunciado da questão
   - Adicione as alternativas (A, B, C, D...)
   - Marque qual é a alternativa correta
   - Defina o peso/pontos da questão

4. **Para Dissertativa:**
   - Digite o enunciado da questão
   - Defina o peso/pontos da questão
   - Adicione uma resposta esperada (opcional, para ajudar na correção)

5. Clique em **"Adicionar"**

6. Repita para adicionar mais questões

#### **Opção B - Criar múltiplas questões de uma vez:**

1. Clique em **"Criar Múltiplas Questões"**
2. Um formulário especial abrirá
3. Você pode copiar e colar questões em formato específico
4. Exemplo de formato:
   ```
   Q: Qual é a capital do Brasil?
   A) São Paulo
   B) Rio de Janeiro
   C) Brasília *
   D) Salvador

   Q: O que significa SEO?
   DISSERTATIVA
   ```
   (O asterisco * marca a resposta correta)

### **Passo 4: Revisar e publicar**

1. Revise todas as questões
2. Verifique se as respostas corretas estão marcadas
3. Clique em **"Salvar Quiz"**
4. O quiz foi criado mas ainda não está disponível para alunos

---

## 📋 Criando Provas

### **O que é uma prova?**
Uma prova é uma avaliação mais completa, geralmente cobrindo todo o conteúdo de um módulo ou curso.

### **Processo de criação:**
O processo é **IDÊNTICO** ao de criar quizzes (veja seção anterior), com as mesmas opções:
- Questões de múltipla escolha e dissertativas
- Tempo limite
- Nota mínima
- Número de tentativas

### **Diferenças principais:**
- Provas geralmente têm **mais questões**
- Provas costumam ter **tempo limite**
- Provas têm **peso maior** na nota final
- Provas avaliam **todo o conteúdo** estudado

### **Siga os mesmos passos da seção "Criando Quizzes"**

---

## 🔗 Vinculando Avaliações a Turmas

### **⚠️ IMPORTANTE:**
Criar um quiz ou prova NÃO o torna automaticamente disponível para alunos. Você precisa **vincular à turma**.

### **Passo 1: Acessar a turma**

1. No menu lateral, clique em **"Turmas"**
2. Clique na turma desejada

### **Passo 2: Adicionar quiz**

1. Dentro da turma, procure por **"Quizzes"** ou **"Avaliações"**
2. Clique em **"+ Adicionar Quiz"**
3. Selecione o quiz que criou anteriormente
4. Configure:
   - **Data de Liberação** - Quando o quiz fica disponível
   - **Data Limite** - Prazo para fazer (opcional)
5. Clique em **"Adicionar"**

### **Passo 3: Adicionar prova**

1. Ainda dentro da turma, procure por **"Provas"**
2. Clique em **"+ Adicionar Prova"**
3. Selecione a prova que criou
4. Configure:
   - **Data de Liberação**
   - **Data Limite**
   - Se é obrigatória para certificado
5. Clique em **"Adicionar"**

### **Agora os alunos podem fazer!**

---

## 👨‍🏫 Gerenciando Professores

### **Criar novo professor:**

1. No menu lateral, clique em **"Professores"**
2. Clique em **"+ Novo Professor"**
3. Preencha:
   - **Nome Completo**
   - **E-mail** (será usado para login)
   - **Senha Temporária** (o professor deve trocar no primeiro acesso)
   - **CPF**
   - **Telefone**
4. Clique em **"Criar Professor"**
5. O professor receberá um e-mail com as credenciais

### **Gerenciar permissões de professor:**

1. Na lista de professores, clique em um professor
2. Clique em **"Permissões"** ou **"Gerenciar Acesso"**
3. Você pode:
   - **Vincular a turmas** - Quais turmas ele pode lecionar
   - **Vincular a cursos** - Quais cursos ele pode ver
   - **Permissões especiais:**
     - Ver todos os relatórios
     - Corrigir avaliações de outras turmas
     - Gerenciar alunos

### **Redefinir senha de professor:**

1. Na lista de professores, clique no professor
2. Clique em **"Redefinir Senha"**
3. Uma nova senha temporária será enviada por e-mail
4. Ou defina uma senha manualmente

---

## 🎓 Gerenciando Alunos

### **Visualizar todos os alunos:**

1. No menu lateral, clique em **"Alunos"** ou **"Usuários"**
2. Você verá lista completa de:
   - Franqueados
   - Colaboradores
   - Status de aprovação

### **Aprovar colaboradores (se necessário):**

Normalmente os franqueados aprovam seus próprios colaboradores, mas você como admin também pode:

1. Clique em **"Aprovações Pendentes"**
2. Veja colaboradores aguardando aprovação
3. Clique em **"Aprovar"** ou **"Rejeitar"**
4. Se aprovar, preencha dados do colaborador

### **Matricular aluno em turma:**

#### **Opção 1 - Pela turma:**

1. Acesse a turma
2. Clique em **"Alunos"** ou **"Matrículas"**
3. Clique em **"+ Adicionar Aluno"**
4. Busque o aluno pelo nome ou e-mail
5. Clique em **"Matricular"**

#### **Opção 2 - Pelo perfil do aluno:**

1. Acesse o perfil do aluno
2. Clique em **"Turmas"**
3. Clique em **"+ Adicionar à Turma"**
4. Selecione a turma
5. Clique em **"Matricular"**

### **Remover aluno de turma:**

1. Acesse a turma
2. Na lista de alunos, encontre o aluno
3. Clique no ícone de **lixeira** ou **"Remover"**
4. Confirme a remoção

### **Ver histórico do aluno:**

1. Clique no perfil do aluno
2. Você verá:
   - Todas as turmas que fez ou está fazendo
   - Notas em quizzes e provas
   - Presença em aulas
   - Certificados obtidos
   - Progresso atual

---

## 🏢 Gerenciando Unidades e Franquias

### **Criar nova unidade:**

1. No menu lateral, clique em **"Unidades"** ou **"Franquias"**
2. Clique em **"+ Nova Unidade"**
3. Preencha:
   - **Nome da Unidade** (ex: "Unidade São Paulo Centro")
   - **CNPJ**
   - **Endereço Completo**
   - **Telefone**
   - **E-mail de contato**
4. Clique em **"Criar Unidade"**

### **Criar franqueado para a unidade:**

1. Na lista de unidades, clique na unidade
2. Clique em **"+ Adicionar Franqueado"**
3. Preencha dados do franqueado:
   - **Nome Completo**
   - **E-mail** (login)
   - **Senha Temporária**
   - **CPF**
   - **Telefone**
4. Clique em **"Criar Franqueado"**
5. Ele receberá credenciais por e-mail

### **Vincular franqueado a unidade:**

Se o franqueado já existe:
1. Acesse a unidade
2. Clique em **"Franqueados"**
3. Clique em **"+ Vincular Franqueado Existente"**
4. Busque e selecione o franqueado
5. Clique em **"Vincular"**

---

## 📊 Usando o Kanban de Alunos

### **O que é o Kanban?**
O Kanban é um quadro visual para organizar e acompanhar o status dos alunos em uma turma.

### **Acessar o Kanban:**

1. Entre em uma turma específica
2. Clique em **"Kanban"** ou **"Quadro de Alunos"**

### **Estrutura do Kanban:**

O quadro tem colunas padrão como:
- **Novos** - Alunos recém-matriculados
- **Em Progresso** - Alunos ativos e estudando
- **Em Risco** - Alunos com baixa frequência ou notas
- **Concluídos** - Alunos que terminaram o curso
- **Desistentes** - Alunos que abandonaram

### **Mover alunos entre colunas:**

1. Arraste e solte o card do aluno para outra coluna
2. Ou clique no aluno e selecione **"Mover para..."**
3. A mudança é salva automaticamente

### **Criar colunas personalizadas:**

1. No Kanban, clique em **"+ Nova Coluna"**
2. Dê um nome (ex: "Aguardando Documentos")
3. Escolha uma cor
4. Clique em **"Criar"**

### **Filtrar alunos no Kanban:**

1. Use a barra de busca para encontrar aluno específico
2. Use filtros por:
   - Status de pagamento
   - Presença
   - Notas
   - Data de matrícula

---

## 📈 Relatórios de Turmas

### **Relatório Geral da Turma:**

1. Acesse a turma
2. Clique em **"Relatórios"**
3. Você verá:
   - **Total de Alunos** matriculados
   - **Taxa de Conclusão** - Quantos % completaram
   - **Taxa de Presença Média** - Frequência geral
   - **Média de Notas** - Desempenho geral
   - **Alunos em Risco** - Com problemas

### **Relatório de Presença:**

1. Dentro de **"Relatórios"**, clique em **"Presença"**
2. Veja tabela com:
   - Nome de cada aluno
   - % de presença
   - Quais aulas faltou
   - Histórico detalhado
3. Exporte para Excel se necessário

### **Relatório de Desempenho:**

1. Clique em **"Desempenho"** ou **"Notas"**
2. Veja:
   - Média de cada aluno em quizzes
   - Média de cada aluno em provas
   - Comparativo entre alunos
   - Questões mais erradas
3. **Insights:**
   - Se muitos alunos erraram a mesma questão, pode indicar problema no ensino
   - Se média está baixa, revisar conteúdo

---

## 📊 Relatórios de Avaliações

### **Relatório de um Quiz/Prova específico:**

1. Clique em **"Quizzes"** ou **"Provas"**
2. Clique em um quiz/prova específico
3. Clique em **"Relatórios"**
4. Você verá:
   - Quantos alunos fizeram
   - Quantos ainda não fizeram
   - Média de acertos
   - Tempo médio de conclusão
   - Questões mais difíceis (mais erradas)

### **Análise por questão:**

1. Dentro do relatório do quiz/prova
2. Clique em **"Análise de Questões"**
3. Para cada questão, veja:
   - % de acertos
   - % de erros
   - Qual alternativa foi mais escolhida (se múltipla escolha)
   - Respostas comuns (se dissertativa)

### **Exportar dados:**

1. Em qualquer relatório, procure o botão **"Exportar"**
2. Escolha o formato:
   - **Excel** - Para análise em planilhas
   - **PDF** - Para impressão
   - **CSV** - Para importar em outros sistemas
3. Clique em **"Download"**

---

## 🎯 Dashboard e Métricas

### **Dashboard Principal:**

Ao fazer login, você vê o dashboard com:

1. **Métricas Rápidas:**
   - Total de alunos ativos
   - Total de turmas em andamento
   - Total de cursos disponíveis
   - Total de professores

2. **Gráficos:**
   - Evolução de matrículas ao longo do tempo
   - Taxa de conclusão por turma
   - Desempenho médio em avaliações
   - Presença média por período

3. **Atividades Recentes:**
   - Últimas matrículas
   - Últimas avaliações concluídas
   - Últimas aulas ministradas
   - Alertas importantes

### **Filtrar dashboard por período:**

1. No topo do dashboard, selecione o período:
   - Última semana
   - Último mês
   - Último trimestre
   - Último ano
   - Personalizado
2. Os dados serão atualizados automaticamente

### **Métricas por unidade/franquia:**

1. No dashboard, filtre por unidade específica
2. Veja métricas isoladas daquela unidade
3. Compare desempenho entre unidades

---

## 🔔 Notificações e Comunicação

### **Enviar avisos para turma:**

1. Acesse a turma
2. Clique em **"Comunicar"** ou **"Enviar Mensagem"**
3. Escreva a mensagem
4. Escolha o canal:
   - **E-mail** - Enviado para e-mail dos alunos
   - **WhatsApp** - Enviado via integração (se configurada)
   - **Notificação no Sistema** - Aparece quando aluno faz login
5. Clique em **"Enviar"**

### **Agendar lembretes automáticos:**

1. No menu lateral, clique em **"Comunicação"** ou **"Automações"**
2. Clique em **"+ Nova Automação"**
3. Configure:
   - **Tipo:** Lembrete de aula, prazo de prova, etc.
   - **Quando enviar:** X horas antes do evento
   - **Para quem:** Todos da turma, apenas faltosos, etc.
   - **Canal:** E-mail, WhatsApp, Sistema
4. Ative a automação

### **Ver histórico de mensagens:**

1. Acesse **"Comunicação"**
2. Clique em **"Histórico"**
3. Veja todas as mensagens enviadas, quando e para quem

---

## 🎓 Emitindo Certificados

### **Verificar elegibilidade:**

1. Acesse a turma
2. Clique em **"Certificados"**
3. Você verá lista de alunos:
   - ✅ **Elegível** - Completou requisitos
   - ⏳ **Pendente** - Ainda falta algo
   - ❌ **Não Elegível** - Não atende critérios

### **Critérios de elegibilidade:**
- Completou X% das aulas (configurável)
- Atingiu nota mínima nas avaliações
- Teve presença mínima nas aulas ao vivo

### **Emitir certificado:**

1. Clique no aluno elegível
2. Clique em **"Emitir Certificado"**
3. Revise as informações:
   - Nome do aluno (como aparecerá no certificado)
   - Nome do curso
   - Carga horária
   - Data de conclusão
4. Clique em **"Gerar Certificado"**
5. O certificado é gerado automaticamente
6. O aluno recebe notificação

### **Emissão em lote:**

1. Na tela de certificados, marque vários alunos elegíveis
2. Clique em **"Emitir em Lote"**
3. Todos os certificados serão gerados de uma vez

---

## 💡 Fluxo de Trabalho Recomendado

### **Para iniciar um novo curso completo:**

1. ✅ **Criar o Curso** (Menu: Cursos > + Novo Curso)
2. ✅ **Criar Módulos** (Dentro do curso > Módulos > + Novo Módulo)
3. ✅ **Criar Aulas** (Menu: Aulas > + Nova Aula)
   - Faça upload das aulas gravadas
   - Cadastre aulas ao vivo (sem vídeo)
4. ✅ **Criar Quizzes e Provas** (Menu: Avaliações > + Novo Quiz/Prova)
5. ✅ **Criar Professor** (se ainda não existe) (Menu: Professores > + Novo Professor)
6. ✅ **Criar Turma** (Menu: Turmas > + Nova Turma)
   - Vincule ao curso
   - Atribua o professor
7. ✅ **Adicionar Aulas à Turma** (Dentro da turma > + Adicionar Aula)
   - Adicione aulas gravadas manualmente
   - Agende aulas ao vivo com data/hora
8. ✅ **Vincular Quizzes e Provas à Turma** (Dentro da turma > Avaliações > + Adicionar)
9. ✅ **Matricular Alunos** (Dentro da turma > Alunos > + Adicionar Aluno)
10. ✅ **Acompanhar Progresso** (Relatórios, Kanban, Dashboard)

---

## ⚠️ Erros Comuns e Como Evitar

### **❌ Erro: "Alunos não veem a aula gravada"**
**Causa:** Você criou a aula mas não adicionou à turma
**Solução:** Entre na turma e adicione manualmente a aula gravada

### **❌ Erro: "Professor não consegue acessar a turma"**
**Causa:** Você não vinculou o professor à turma
**Solução:** Edite a turma e selecione o professor correto

### **❌ Erro: "Alunos não veem o quiz"**
**Causa:** Você criou o quiz mas não vinculou à turma
**Solução:** Entre na turma, vá em Avaliações e adicione o quiz

### **❌ Erro: "Aluno não pode solicitar certificado"**
**Causa:** Aluno não completou requisitos
**Solução:** Verifique se ele completou aulas, passou nas provas e teve presença mínima

### **❌ Erro: "Vídeo não carrega para os alunos"**
**Causa:** Upload não completou ou formato não suportado
**Solução:** Verifique se o upload terminou, use MP4 como formato

---

## ❓ Perguntas Frequentes (FAQ)

### **Posso reutilizar uma aula em várias turmas?**
Sim! Crie a aula uma vez e adicione a quantas turmas quiser.

### **Como faço para cancelar uma aula ao vivo?**
Entre na turma, encontre a aula agendada e clique em "Cancelar" ou "Reagendar".

### **Posso editar um quiz depois que alunos já fizeram?**
Tecnicamente sim, mas NÃO é recomendado. Isso pode invalidar respostas já dadas. Crie um novo quiz se necessário.

### **Como transfiro um aluno de uma turma para outra?**
Remova-o da turma atual e matricule na turma nova. O histórico dele é preservado.

### **Posso ter múltiplos administradores?**
Sim! Crie outros usuários com perfil de administrador.

### **Como faço backup dos dados?**
Use a função "Exportar Todos os Dados" no menu de Configurações (se disponível).

---

## 📞 Suporte Técnico

Se você encontrar problemas técnicos ou tiver dúvidas não respondidas neste guia:

1. Verifique este guia novamente
2. Consulte os outros guias (Professor, Aluno)
3. Contate o suporte técnico da plataforma
4. Envie e-mail para o desenvolvedor do sistema

---

**Bom trabalho na administração do sistema! 🚀**
