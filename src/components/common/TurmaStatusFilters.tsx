import { Button } from "@/components/ui/button";

interface TurmaStatusFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  className?: string;
}

const TurmaStatusFilters = ({ statusFilter, onStatusChange, className = "" }: TurmaStatusFiltersProps) => {
  return (
    <div className={`flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg ${className}`}>
      <Button
        size="sm"
        variant={statusFilter === 'em_andamento' ? 'default' : 'outline'}
        onClick={() => onStatusChange('em_andamento')}
        className="text-xs h-8 flex-1 sm:flex-initial min-w-fit"
      >
        Em Andamento
      </Button>
      <Button
        size="sm"
        variant={statusFilter === 'agendada' ? 'default' : 'outline'}
        onClick={() => onStatusChange('agendada')}
        className="text-xs h-8 flex-1 sm:flex-initial min-w-fit"
      >
        Agendadas
      </Button>
      <Button
        size="sm"
        variant={statusFilter === 'arquivadas' ? 'default' : 'outline'}
        onClick={() => onStatusChange('arquivadas')}
        className="text-xs h-8 w-full sm:w-auto"
      >
        📁 Turmas Arquivadas
      </Button>
    </div>
  );
};

export default TurmaStatusFilters;