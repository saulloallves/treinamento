# 📅 Mapeamento Completo de Date Pickers no Sistema

## 🎯 Resumo Executivo
**Total de Date Pickers: 7**
- ✅ 3 usando Popover + Calendar (shadcn/ui)
- ⚠️ 4 usando `<input type="date">` (HTML nativo)

---

## 📊 Date Pickers por Tipo

### 🟢 Tipo 1: Popover + Calendar Component (shadcn/ui)
Estes são date pickers modernos usando o componente Calendar do shadcn/ui dentro de um Popover.

#### 1. **Editar Detalhes do Colaborador**
- **Arquivo:** `src/components/collaboration/CollaboratorDetailsDialog.tsx`
- **Linhas:** 109-137
- **Campo:** Data de Nascimento
- **Uso:** Edição de data de nascimento do colaborador
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={field.value}
      onSelect={field.onChange}
      disabled={(date) => date > new Date()}
    />
  </PopoverContent>
</Popover>
```

#### 2. **Criar Teste Avaliativo**
- **Arquivo:** `src/components/tests/CreateTestDialog.tsx`
- **Linhas:** 214-241
- **Campo:** Data de Disponibilização
- **Uso:** Selecionar quando o teste ficará disponível
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {form.watch("available_from") ? format(new Date(form.watch("available_from")), "dd/MM/yyyy") : "Selecione a data"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={form.watch("available_from") ? new Date(form.watch("available_from")) : undefined}
      onSelect={(date) => form.setValue("available_from", date?.toISOString() || "")}
      disabled={(date) => date < new Date()}
    />
  </PopoverContent>
</Popover>
```

#### 3. **Relatórios de Testes (Date Range)**
- **Arquivo:** `src/components/tests/TestsReports.tsx`
- **Linha:** 6
- **Componente:** `DatePickerWithRange`
- **Uso:** Filtro de período para relatórios
```tsx
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
```

---

### ⚠️ Tipo 2: Input HTML Nativo `<input type="date">`
Estes são inputs HTML nativos que precisam ser substituídos por componentes modernos.

#### 4. **Criar Aula**
- **Arquivo:** `src/components/lessons/CreateLessonDialog.tsx`
- **Linha:** 363
- **Campo:** Data da Aula
- **Uso:** Selecionar data para nova aula
```tsx
<Input
  type="date"
  value={lessonData.scheduled_date}
  onChange={(e) => setLessonData({...lessonData, scheduled_date: e.target.value})}
/>
```

#### 5. **Criar Turma**
- **Arquivo:** `src/components/turmas/CreateTurmaDialog.tsx`
- **Linha:** 323
- **Campo:** Data de Início
- **Uso:** Definir quando a turma inicia
```tsx
<Input
  type="date"
  {...field}
  className="w-full"
/>
```

#### 6. **Editar Turma**
- **Arquivo:** `src/components/turmas/EditTurmaDialog.tsx`
- **Linha:** 168
- **Campo:** Data de Início
- **Uso:** Editar data de início da turma
```tsx
<Input
  type="date"
  value={editData.start_date || ''}
  onChange={(e) => handleInputChange('start_date', e.target.value)}
/>
```

#### 7. **Disparos WhatsApp**
- **Arquivo:** `src/components/whatsapp/WhatsAppDispatch.tsx`
- **Linha:** 387
- **Campo:** Data do Disparo
- **Uso:** Agendar data para envio de mensagens
```tsx
<Input
  type="date"
  value={scheduledDate}
  onChange={(e) => setScheduledDate(e.target.value)}
/>
```

#### 8. **Cadastro de Usuário (Auth)**
- **Arquivo:** `src/pages/Auth.tsx`
- **Linha:** 376
- **Campo:** Data de Nascimento
- **Uso:** Cadastro inicial de usuário
```tsx
<Input
  id="birthDate"
  type="date"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
  required
/>
```

#### 9. **Aprovar Colaborador (Modal Antigo)**
- **Arquivo:** `src/components/collaborators/CollaboratorApprovalModal.tsx`
- **Linha:** 125
- **Campo:** Data de Nascimento
- **Uso:** Definir data de nascimento ao aprovar colaborador
```tsx
<Input type="date" {...field} />
```

---

## 🎨 Componentes Base Usados

### 1. **Calendar Component**
- **Arquivo:** `src/components/ui/calendar.tsx`
- **Biblioteca:** `react-day-picker` (DayPicker)
- **Uso:** Base para todos os date pickers modernos

### 2. **DatePickerWithRange Component**
- **Arquivo:** `src/components/ui/date-range-picker.tsx`
- **Uso:** Seleção de período (data inicial e final)
- **Usado em:** Relatórios de testes

### 3. **Popover Component**
- **Arquivo:** `src/components/ui/popover.tsx`
- **Biblioteca:** `@radix-ui/react-popover`
- **Uso:** Container para o Calendar aparecer como dropdown

---

## 🔧 Ícones Usados

### 1. **Calendar Icon (lucide-react)**
Usado como ícone decorativo em cards e labels (NÃO são date pickers):
- ModernSidebar.tsx
- Sidebar.tsx
- Diversos cards de turmas, aulas, etc.

### 2. **CalendarIcon (lucide-react)**
Usado especificamente nos date pickers modernos:
- CollaboratorDetailsDialog.tsx
- CreateTestDialog.tsx
- date-range-picker.tsx

---

## ⚠️ Inputs HTML Nativos a Substituir

### Prioridade ALTA (4 componentes principais):
1. ✅ **CreateLessonDialog** - Criar Aula
2. ✅ **CreateTurmaDialog** - Criar Turma
3. ✅ **EditTurmaDialog** - Editar Turma
4. ✅ **WhatsAppDispatch** - Disparos WhatsApp

### Prioridade MÉDIA (2 componentes de usuário):
5. ⚠️ **Auth.tsx** - Cadastro de usuário (data de nascimento)
6. ⚠️ **CollaboratorApprovalModal** - Aprovar colaborador (pode estar deprecated)

---

## 📝 Notas Importantes

### Arquivos Duplicados
- ⚠️ `src/components/collaborators/CollaboratorApprovalModal.tsx`
- ⚠️ `src/collaborators/CollaboratorApprovalModal.tsx`
- **Ação:** Verificar qual está em uso e remover o duplicado

### Padrão Recomendado
Todos os date pickers devem seguir o padrão do `CreateTestDialog.tsx`:
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={(date) => date < new Date()} // ou outras regras
    />
  </PopoverContent>
</Popover>
```

### Internacionalização
O componente Calendar já está configurado para português (pt-BR) via `date-fns`.

---

## 🎯 Próximos Passos Sugeridos

1. **Substituir inputs nativos** pelos componentes Popover + Calendar
2. **Padronizar formato de data** (dd/MM/yyyy) em todo o sistema
3. **Adicionar validações** de data mínima/máxima conforme necessidade
4. **Remover arquivo duplicado** (CollaboratorApprovalModal)
5. **Testar responsividade** dos date pickers em mobile

---

**Última atualização:** 29/10/2025
**Mapeado por:** Claude Code
