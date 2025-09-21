import { useState } from "react";
import { TurmaKanbanColumn } from "./TurmaKanbanColumn";
import { Turma } from "@/hooks/useTurmas";
import { Course } from "@/hooks/useCourses";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { KanbanColumnManager } from "./KanbanColumnManager";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TurmaKanbanBoardProps {
  turmas: Turma[];
  courses: Course[];
  onViewDetails: (turma: Turma) => void;
  onEnrollStudent: (turmaId: string) => void;
  onEditTurma: (turma: Turma) => void;
}

export const TurmaKanbanBoard = ({
  turmas,
  courses,
  onViewDetails,
  onEnrollStudent,
  onEditTurma,
}: TurmaKanbanBoardProps) => {
  const [draggedTurma, setDraggedTurma] = useState<Turma | null>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const { columns } = useKanbanColumns();

  // Group turmas by status using dynamic columns
  const groupedTurmas = columns.reduce((acc, column) => {
    acc[column.status] = turmas.filter(turma => 
      (turma.status as any) === column.status || 
      turma.status === column.status
    );
    return acc;
  }, {} as Record<string, Turma[]>);

  const handleDragStart = (turma: Turma) => {
    setDraggedTurma(turma);
  };

  const handleDragEnd = () => {
    setDraggedTurma(null);
  };

  const handleDrop = (targetStatus: string) => {
    if (!draggedTurma) return;
    
    // Here you would normally call an API to update the turma status
    // For now, we'll just log it
    console.log(`Moving turma ${draggedTurma.id} to status ${targetStatus}`);
    
    setDraggedTurma(null);
  };

  const gridCols = columns.length <= 3 ? 'md:grid-cols-3' : 
                   columns.length === 4 ? 'md:grid-cols-4' : 
                   'md:grid-cols-5';

  return (
    <div className="kanban-board space-y-6">
      {/* Column Management */}
      <div className="flex justify-end">
        <Collapsible open={showColumnManager} onOpenChange={setShowColumnManager}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {showColumnManager ? 'Ocultar' : 'Gerenciar'} Colunas
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <KanbanColumnManager />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Kanban Board */}
      <div className={`grid grid-cols-1 ${gridCols} gap-6 h-full`}>
        {columns.map((column) => (
          <TurmaKanbanColumn
            key={column.id}
            title={column.title}
            status={column.status}
            turmas={groupedTurmas[column.status] || []}
            courses={courses}
            color={column.color}
            headerColor={column.headerColor}
            count={(groupedTurmas[column.status] || []).length}
            onViewDetails={onViewDetails}
            onEnrollStudent={onEnrollStudent}
            onEditTurma={onEditTurma}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggedTurma={draggedTurma}
          />
        ))}
      </div>
      
      {/* Summary at bottom */}
      <div className={`mt-6 grid grid-cols-1 ${gridCols} gap-4 text-center`}>
        {columns.map((column) => (
          <div key={column.id} className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-foreground">
              {(groupedTurmas[column.status] || []).length}
            </div>
            <div className="text-sm text-muted-foreground">{column.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};