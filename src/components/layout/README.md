# Sistema de Layout Padronizado

Biblioteca de componentes reutilizáveis para garantir consistência visual em todas as páginas do sistema.

## Componentes Disponíveis

### PageHeader
Cabeçalho padrão das páginas com ícone, título, descrição e ações.

```tsx
import { PageHeader } from '@/components/layout';
import { Users } from 'lucide-react';

<PageHeader
  icon={Users}
  title="Gerenciar Usuários"
  description="Gerencie todos os usuários do sistema"
  actions={
    <Button onClick={handleCreate}>
      Criar Usuário
    </Button>
  }
/>
```

### PageFilters
Barra de filtros padrão com busca e selects.

```tsx
import { PageFilters } from '@/components/layout';

<PageFilters
  searchPlaceholder="Buscar usuários..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filters={[
    {
      placeholder: "Status",
      value: statusFilter,
      options: [
        { label: "Todos", value: "all" },
        { label: "Ativos", value: "active" },
        { label: "Inativos", value: "inactive" }
      ],
      onChange: setStatusFilter
    }
  ]}
/>
```

### PageSection
Seções de conteúdo com título e ações opcionais.

```tsx
import { PageSection } from '@/components/layout';
import { Filter } from 'lucide-react';

<PageSection
  title="Painel Visual"
  icon={Filter}
  actions={<Button size="sm">Gerenciar</Button>}
>
  {/* Conteúdo da seção */}
</PageSection>
```

### EmptyState
Estado vazio padrão com ícone, mensagem e ação.

```tsx
import { EmptyState } from '@/components/layout';
import { Users } from 'lucide-react';

<EmptyState
  icon={Users}
  title="Nenhum usuário encontrado"
  description="Crie o primeiro usuário para começar!"
  actionLabel="Criar Usuário"
  onAction={handleCreate}
/>
```

### MetricsGrid
Grid responsivo de KPIs/métricas.

```tsx
import { MetricsGrid } from '@/components/layout';
import type { MetricData } from '@/components/layout';
import { Users, BookOpen, Award } from 'lucide-react';

const metrics: MetricData[] = [
  {
    title: "Usuários Ativos",
    value: 150,
    change: "+12%",
    changeType: "positive",
    icon: Users,
    onClick: () => console.log('clicked')
  },
  {
    title: "Cursos",
    value: 45,
    icon: BookOpen,
    changeType: "neutral"
  }
];

<MetricsGrid metrics={metrics} columns={4} />
```

### StandardCard
Card padrão do sistema com header, conteúdo e footer.

```tsx
import { StandardCard } from '@/components/layout';

<StandardCard
  title="Título do Card"
  description="Descrição opcional"
  variant="elevated" // 'default' | 'outlined' | 'elevated'
  footer={
    <Button>Ação</Button>
  }
>
  {/* Conteúdo do card */}
</StandardCard>
```

## Classes CSS Disponíveis

### Tipografia
- `.page-title` - Título principal da página
- `.page-description` - Descrição da página
- `.section-title` - Título de seção
- `.card-title` - Título de card
- `.card-description` - Descrição de card
- `.card-label` - Label de campo
- `.card-value` - Valor de campo

### Status Badges
- `.badge-status` - Badge base
- `.badge-success` - Badge de sucesso (verde)
- `.badge-warning` - Badge de aviso (amarelo)
- `.badge-error` - Badge de erro (vermelho)
- `.badge-info` - Badge de informação (azul)
- `.badge-neutral` - Badge neutro (cinza)

## Exemplo Completo de Página

```tsx
import BaseLayout from "@/components/BaseLayout";
import { PageHeader, PageFilters, MetricsGrid, EmptyState } from "@/components/layout";
import type { MetricData } from "@/components/layout";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const metrics: MetricData[] = [
    { title: "Total", value: 150, icon: Users, changeType: "neutral" },
    { title: "Ativos", value: 120, icon: Users, changeType: "positive" }
  ];

  return (
    <BaseLayout title="" showBottomNav={false}>
      <PageHeader
        icon={Users}
        title="Gerenciar Usuários"
        description="Gerencie todos os usuários do sistema"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Usuário
          </Button>
        }
      />

      <MetricsGrid metrics={metrics} columns={4} />

      <PageFilters
        searchPlaceholder="Buscar usuários..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Status",
            value: statusFilter,
            options: [
              { label: "Todos", value: "all" },
              { label: "Ativos", value: "active" }
            ],
            onChange: setStatusFilter
          }
        ]}
      />

      {/* Seu conteúdo aqui */}
      
      <EmptyState
        icon={Users}
        title="Nenhum usuário encontrado"
        description="Ajuste os filtros ou crie um novo usuário."
      />
    </BaseLayout>
  );
};

export default UsersPage;
```

## Boas Práticas

1. **Sempre use PageHeader** no lugar do título do BaseLayout
2. **Use MetricsGrid** para exibir KPIs no topo das páginas
3. **Use PageFilters** para busca e filtros consistentes
4. **Use EmptyState** para estados vazios claros
5. **Use StandardCard** para cards consistentes
6. **Use as classes CSS** do design system para tipografia e badges
7. **Mantenha o BaseLayout com title=""** quando usar PageHeader

## Design System

Todas as cores, espaçamentos e tipografia seguem o design system definido em:
- `src/index.css` - Classes e variáveis CSS
- `tailwind.config.ts` - Configurações do Tailwind

Sempre use tokens semânticos do design system ao invés de valores hardcoded.
