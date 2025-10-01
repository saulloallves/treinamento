# Guia de Migração para Layout Padronizado

Este guia ajuda a migrar páginas existentes para o novo sistema de layout padronizado.

## ✅ Checklist de Migração

- [ ] Substituir título do BaseLayout por PageHeader
- [ ] Padronizar filtros com PageFilters
- [ ] Adicionar métricas com MetricsGrid
- [ ] Padronizar estados vazios com EmptyState
- [ ] Usar StandardCard para cards
- [ ] Aplicar classes CSS do design system

## Passo a Passo

### 1. Importar Componentes

```tsx
// Antes
import BaseLayout from "@/components/BaseLayout";
import { Input } from "@/components/ui/input";
import { Select, ... } from "@/components/ui/select";

// Depois
import BaseLayout from "@/components/BaseLayout";
import { 
  PageHeader, 
  PageFilters, 
  MetricsGrid, 
  EmptyState 
} from "@/components/layout";
import type { MetricData } from "@/components/layout";
```

### 2. Substituir Cabeçalho

```tsx
// Antes
<BaseLayout title="Gerenciar Cursos">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <BookOpen className="w-6 h-6" />
      <div>
        <p className="description">Gerencie os cursos</p>
      </div>
    </div>
    <Button onClick={handleCreate}>Criar</Button>
  </div>
  {/* ... */}
</BaseLayout>

// Depois
<BaseLayout title="" showBottomNav={false}>
  <PageHeader
    icon={BookOpen}
    title="Gerenciar Cursos"
    description="Gerencie os cursos do sistema"
    actions={
      <Button onClick={handleCreate}>
        <Plus className="w-4 h-4 mr-2" />
        Criar Curso
      </Button>
    }
  />
  {/* ... */}
</BaseLayout>
```

### 3. Adicionar Métricas (Opcional)

```tsx
// Adicionar antes dos filtros
const metrics: MetricData[] = [
  {
    title: "Total de Cursos",
    value: courses.length,
    icon: BookOpen,
    changeType: "neutral"
  },
  {
    title: "Ativos",
    value: activeCourses.length,
    icon: CheckCircle,
    changeType: "positive"
  }
];

<MetricsGrid metrics={metrics} columns={4} />
```

### 4. Padronizar Filtros

```tsx
// Antes
<div className="flex gap-4">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
    <Input
      placeholder="Buscar..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10"
    />
  </div>
  
  <Select value={filter} onValueChange={setFilter}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="active">Ativos</SelectItem>
    </SelectContent>
  </Select>
</div>

// Depois
<PageFilters
  searchPlaceholder="Buscar cursos..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filters={[
    {
      placeholder: "Status",
      value: filter,
      options: [
        { label: "Todos", value: "all" },
        { label: "Ativos", value: "active" }
      ],
      onChange: setFilter
    }
  ]}
/>
```

### 5. Padronizar Estado Vazio

```tsx
// Antes
{items.length === 0 && (
  <div className="text-center py-12">
    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
    <h3 className="text-lg font-semibold mt-4">Nenhum curso encontrado</h3>
    <p className="text-muted-foreground">Crie o primeiro curso!</p>
    <Button onClick={handleCreate} className="mt-4">
      Criar Curso
    </Button>
  </div>
)}

// Depois
{items.length === 0 && (
  <EmptyState
    icon={BookOpen}
    title="Nenhum curso encontrado"
    description="Crie o primeiro curso para começar!"
    actionLabel="Criar Curso"
    onAction={handleCreate}
  />
)}
```

### 6. Usar Classes CSS Padronizadas

```tsx
// Antes
<h2 className="text-xl font-semibold">Título</h2>
<p className="text-muted-foreground text-sm">Descrição</p>
<span className="text-xs text-gray-500">Label</span>

// Depois
<h2 className="section-title">Título</h2>
<p className="card-description">Descrição</p>
<span className="card-label">Label</span>
```

### 7. Padronizar Badges de Status

```tsx
// Antes
<Badge className="bg-green-100 text-green-800">Ativo</Badge>
<Badge className="bg-red-100 text-red-800">Inativo</Badge>

// Depois
<div className="badge-status badge-success">Ativo</div>
<div className="badge-status badge-error">Inativo</div>
```

## Exemplos de Páginas Migradas

### ✅ UnitsPage
- Página já migrada e funcionando
- Localização: `src/pages/UnitsPage.tsx`
- Componente: `src/components/units/UnidadesList.tsx`

## Páginas Pendentes de Migração

### 📋 Alta Prioridade
- [ ] TurmasPage
- [ ] CoursesPage
- [ ] Dashboard
- [ ] LessonsPage
- [ ] UsersPage

### 📋 Média Prioridade
- [ ] AttendancePage
- [ ] ProgressPage
- [ ] CertificatesPage
- [ ] EnrollmentsPage

### 📋 Baixa Prioridade
- [ ] ProfessorsPage
- [ ] QuizPage
- [ ] TestsPage
- [ ] ReportsPage
- [ ] SettingsPage

## Template Base para Nova Página

```tsx
import BaseLayout from "@/components/BaseLayout";
import { PageHeader, PageFilters, MetricsGrid, EmptyState } from "@/components/layout";
import type { MetricData } from "@/components/layout";
import { Icon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";

const MyPage = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const metrics: MetricData[] = [
    { title: "Métrica 1", value: 100, icon: Icon, changeType: "neutral" }
  ];

  const handleCreate = () => {
    // Ação de criar
  };

  return (
    <BaseLayout title="" showBottomNav={true}>
      <PageHeader
        icon={Icon}
        title="Título da Página"
        description="Descrição da página"
        actions={
          !isMobile && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </Button>
          )
        }
      />

      <MetricsGrid metrics={metrics} columns={4} />

      <PageFilters
        searchPlaceholder="Buscar..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Filtro",
            value: filter,
            options: [
              { label: "Todos", value: "all" }
            ],
            onChange: setFilter
          }
        ]}
      />

      {/* Seu conteúdo aqui */}

      {/* Mobile FAB */}
      {isMobile && (
        <FloatingActionButton 
          onClick={handleCreate}
          icon={Plus}
          label="Criar"
        />
      )}
    </BaseLayout>
  );
};

export default MyPage;
```

## Recursos

- Documentação: `src/components/layout/README.md`
- Design System: `src/index.css`
- Exemplo: `src/pages/UnitsPage.tsx`
