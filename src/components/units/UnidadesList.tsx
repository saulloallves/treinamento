import { useState } from "react";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { useUnidades, Unidade } from "@/hooks/useUnidades";
import UnidadeCard from "./UnidadeCard";
import UnidadeDetailsDialog from "./UnidadeDetailsDialog";
import EditUnidadeDialog from "./EditUnidadeDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { PageFilters, EmptyState, MetricsGrid } from "@/components/layout";
import type { MetricData } from "@/components/layout";

const UnidadesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [faseFilter, setFaseFilter] = useState("all");
  const [usersFilter, setUsersFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const { data: unidades = [], isLoading, error } = useUnidades();

  const filteredUnidades = unidades.filter((unidade) => {
    const matchesSearch = 
      unidade.grupo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.uf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.codigo_grupo?.toString().includes(searchTerm);
    
    const matchesFase = faseFilter === "all" || unidade.fase_loja === faseFilter;
    
    const matchesUsers = 
      usersFilter === "all" || 
      (usersFilter === "with_users" && unidade.hasUsers) ||
      (usersFilter === "without_users" && !unidade.hasUsers);
    
    return matchesSearch && matchesFase && matchesUsers;
  });

  const handleViewDetails = (unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setDetailsOpen(true);
  };

  const handleEdit = (unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setDetailsOpen(false);
    setEditOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["unidades"] });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get unique fases for filter
  const uniqueFases = Array.from(new Set(unidades.map(u => u.fase_loja).filter(Boolean)));

  // Metrics data
  const metrics: MetricData[] = [
    {
      title: "Total de Unidades",
      value: unidades.length,
      icon: Building2,
      changeType: "neutral"
    },
    {
      title: "Com Usuários",
      value: unidades.filter(u => u.hasUsers).length,
      icon: CheckCircle,
      changeType: "positive"
    },
    {
      title: "Sem Usuários",
      value: unidades.filter(u => !u.hasUsers).length,
      icon: XCircle,
      changeType: "negative"
    },
    {
      title: "Exibindo",
      value: filteredUnidades.length,
      icon: Building2,
      changeType: "neutral"
    }
  ];

  if (error) {
    return (
      <EmptyState
        icon={XCircle}
        title="Erro ao carregar unidades"
        description="Não foi possível carregar as unidades. Tente novamente."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <MetricsGrid metrics={metrics} columns={4} />

      {/* Refresh Button */}
      <div className="flex justify-end">
        <RefreshButton
          onClick={handleRefresh}
          isRefreshing={isRefreshing}
          disabled={isLoading}
        />
      </div>

      {/* Filtros */}
      <PageFilters
        searchPlaceholder="Buscar por nome, cidade..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Filtrar por fase",
            value: faseFilter,
            options: [
              { label: "Todas as fases", value: "all" },
              ...uniqueFases.map(fase => ({
                label: fase || "Desconhecido",
                value: fase || "unknown"
              }))
            ],
            onChange: setFaseFilter
          },
          {
            placeholder: "Status de usuários",
            value: usersFilter,
            options: [
              { label: "Todas as unidades", value: "all" },
              { label: "Com usuários", value: "with_users" },
              { label: "Sem usuários", value: "without_users" }
            ],
            onChange: setUsersFilter
          }
        ]}
      />

      {/* Grid de unidades */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[180px] sm:h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredUnidades.map((unidade) => (
            <UnidadeCard
              key={unidade.id}
              unidade={unidade}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {filteredUnidades.length === 0 && !isLoading && (
        <EmptyState
          icon={Building2}
          title="Nenhuma unidade encontrada"
          description="Tente ajustar os filtros para encontrar unidades."
        />
      )}

      {/* Dialog de detalhes */}
      <UnidadeDetailsDialog
        unidade={selectedUnidade}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEdit}
      />

      {/* Dialog de edição */}
      <EditUnidadeDialog
        unidade={selectedUnidade}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
};

export default UnidadesList;