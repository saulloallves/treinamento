import { Button } from "@/components/ui/button";

interface TurmaStatusFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  className?: string;
}

const TurmaStatusFilters = ({ statusFilter, onStatusChange, className = "" }: TurmaStatusFiltersProps) => {
  return (
    <div className={`flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md ${className}`}>
      <Button
        size="sm"
        variant={statusFilter === 'em_andamento' ? 'default' : 'outline'}
        onClick={() => onStatusChange('em_andamento')}
        className="text-xs h-7"
      >
        Em Andamento
      </Button>
      <Button
        size="sm"
        variant={statusFilter === 'agendada' ? 'default' : 'outline'}
        onClick={() => onStatusChange('agendada')}
        className="text-xs h-7"
      >
        Agendadas
      </Button>
      <Button
        size="sm"
        variant={statusFilter === 'arquivadas' ? 'default' : 'outline'}
        onClick={() => onStatusChange('arquivadas')}
        className="text-xs h-7"
      >
        📁 Turmas Arquivadas
      </Button>
      {statusFilter !== 'ativas' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onStatusChange('ativas')}
          className="text-xs h-7"
        >
          Limpar filtro
        </Button>
      )}
    </div>
  );
};

export default TurmaStatusFilters;