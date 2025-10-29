# DatePicker Component - Guia de Uso

## 📦 Importação

```tsx
import { DatePicker } from "@/components/ui/date-picker";
```

## 🎯 Exemplos de Uso

### Exemplo Básico

```tsx
const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Selecione uma data"
/>
```

### Com Validação de Data Passada (Apenas Futuro)

```tsx
<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Selecione o prazo"
  disablePast
/>
```

### Com Validação de Data Futura (Apenas Passado)

```tsx
<DatePicker
  date={birthDate}
  onDateChange={setBirthDate}
  placeholder="Data de nascimento"
  disableFuture
/>
```

### Com Range Personalizado

```tsx
const today = new Date();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  fromDate={today}
  toDate={nextMonth}
  placeholder="Selecione entre hoje e próximo mês"
/>
```

### Com Estilo Customizado

```tsx
<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Data personalizada"
  className="max-w-md"
  inputClassName="bg-blue-50"
/>
```

### Desabilitado

```tsx
<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  disabled
  placeholder="Campo desabilitado"
/>
```

## 🎨 Propriedades

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `date` | `Date \| undefined` | - | Data selecionada atual |
| `onDateChange` | `(date: Date \| undefined) => void` | - | Callback quando data é alterada |
| `placeholder` | `string` | `"Selecione a data"` | Texto quando não há data |
| `disabled` | `boolean` | `false` | Desabilita o campo |
| `disableFuture` | `boolean` | `false` | Desabilita datas futuras |
| `disablePast` | `boolean` | `false` | Desabilita datas passadas |
| `fromDate` | `Date` | - | Data mínima permitida |
| `toDate` | `Date` | - | Data máxima permitida |
| `className` | `string` | - | Classes CSS para container |
| `inputClassName` | `string` | - | Classes CSS para input |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alinhamento do popover |

## ✨ Características

- ✅ **Input ReadOnly**: Não permite digitação manual
- ✅ **Não Focável**: Input não recebe foco (tabIndex={-1})
- ✅ **Sem cursor de texto**: Cursor não aparece ao clicar
- ✅ **Click para abrir**: Clicar em qualquer lugar abre o calendário
- ✅ **Ícone integrado**: Ícone de calendário sempre visível
- ✅ **Formato pt-BR**: Exibe datas como dd/MM/yyyy
- ✅ **Validações flexíveis**: Controle de datas permitidas
- ✅ **Acessível**: Navegável pelo calendário popup
- ✅ **Responsivo**: Funciona em mobile e desktop
- ✅ **UX clara**: Usuário não tenta digitar no campo

## 🎯 Casos de Uso Comuns

### 1. Criar Turma (Prazo de Conclusão)
```tsx
const [completionDeadline, setCompletionDeadline] = useState<Date | undefined>();

<DatePicker
  date={completionDeadline}
  onDateChange={setCompletionDeadline}
  placeholder="Selecione o prazo"
  disablePast // Apenas datas futuras
/>
```

### 2. Cadastro de Usuário (Data de Nascimento)
```tsx
const [birthDate, setBirthDate] = useState<Date | undefined>();

<DatePicker
  date={birthDate}
  onDateChange={setBirthDate}
  placeholder="Data de nascimento"
  disableFuture // Apenas datas passadas
/>
```

### 3. Agendar Aula (Data e Hora)
```tsx
const [lessonDate, setLessonDate] = useState<Date | undefined>();

<DatePicker
  date={lessonDate}
  onDateChange={setLessonDate}
  placeholder="Selecione a data"
  disablePast // Não pode agendar no passado
/>
```

## 💾 Salvando no Banco de Dados

```tsx
import { format } from "date-fns";

// Converter Date para string (yyyy-MM-dd)
const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

// Salvar no banco
await supabase
  .from("turmas")
  .insert({
    completion_deadline: dateString
  });
```

## 📖 Lendo do Banco de Dados

```tsx
import { parseISO } from "date-fns";

// Converter string para Date
const dateFromDb = data.completion_deadline
  ? parseISO(data.completion_deadline)
  : undefined;

setSelectedDate(dateFromDb);
```

## 🎨 Personalização Visual

### Exemplo Completo com Form

```tsx
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

function MyForm() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="space-y-2">
      <Label htmlFor="deadline">Prazo de Conclusão *</Label>
      <DatePicker
        date={date}
        onDateChange={setDate}
        placeholder="Selecione o prazo"
        disablePast
        className="w-full"
      />
    </div>
  );
}
```

## 🔧 Troubleshooting

### Data não aparece no input
Verifique se você está passando um objeto `Date` válido:
```tsx
// ✅ Correto
const date = new Date();
<DatePicker date={date} />

// ❌ Errado
const dateString = "2025-10-29";
<DatePicker date={dateString} /> // Não vai funcionar
```

### Data em formato errado
Use `parseISO` para converter strings do banco:
```tsx
import { parseISO } from "date-fns";

const date = parseISO("2025-10-29"); // String → Date
<DatePicker date={date} />
```

### Salvar no banco
Use `format` para converter Date em string:
```tsx
import { format } from "date-fns";

const dateString = format(date, "yyyy-MM-dd"); // Date → String
// Salvar dateString no banco
```
