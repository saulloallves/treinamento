import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { useUnidades, Unidade } from "@/hooks/useUnidades";
import UnidadeCard from "./UnidadeCard";
import UnidadeDetailsDialog from "./UnidadeDetailsDialog";
import EditUnidadeDialog from "./EditUnidadeDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";

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
      unidade.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.uf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.group_code?.toString().includes(searchTerm);

    const matchesFase = faseFilter === "all" || unidade.store_phase === faseFilter;

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
  const uniqueFases = Array.from(new Set(unidades.map(u => u.store_phase).filter(Boolean)));

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar unidades</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie todas as unidades da rede
          </p>
        </div>
        
        <RefreshButton
          onClick={handleRefresh}
          isRefreshing={isRefreshing}
          disabled={isLoading}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={faseFilter} onValueChange={setFaseFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fases</SelectItem>
            {uniqueFases.map((fase) => (
              <SelectItem key={fase || 'unknown'} value={fase || 'unknown'}>
                {fase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={usersFilter} onValueChange={setUsersFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status de usuários" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as unidades</SelectItem>
            <SelectItem value="with_users">Com usuários</SelectItem>
            <SelectItem value="without_users">Sem usuários</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Pág 1/58 • {filteredUnidades.length} unidades
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>{unidades.filter(u => u.hasUsers).length} com usuários</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <XCircle className="h-3 w-3" />
            <span>{unidades.filter(u => !u.hasUsers).length} sem usuários</span>
          </div>
        </div>
      </div>

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
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
        </div>
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