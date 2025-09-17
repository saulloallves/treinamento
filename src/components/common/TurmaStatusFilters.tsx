import { Button } from "@/components/ui/button";

interface TurmaStatusFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  className?: string;
}

const TurmaStatusFilters = ({ statusFilter, onStatusChange, className = "" }: TurmaStatusFiltersProps) => {
  return (
    <div className={`flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md ${className}`}>
      <Button
        size="sm"
        variant={statusFilter === 'em_andamento' ? 'default' : 'outline'}
        onClick={() => onStatusChange('em_andamento')}
        className="text-xs"
      >
        Em Andamento
      </Button>
      <Button
        size="sm"
        variant={statusFilter === 'agendada' ? 'default' : 'outline'}
        onClick={() => onStatusChange('agendada')}
        className="text-xs"
      >
        Agendadas
      </Button>
      <Button
        size="sm"
        variant={statusFilter === 'encerrada' ? 'default' : 'outline'}
        onClick={() => onStatusChange('encerrada')}
        className="text-xs"
      >
        📁 Turmas Arquivadas
      </Button>
      {(statusFilter !== 'todos' && statusFilter !== 'all') && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onStatusChange('todos')}
          className="text-xs"
        >
          Limpar filtro
        </Button>
      )}
    </div>
  );
};

export default TurmaStatusFilters;