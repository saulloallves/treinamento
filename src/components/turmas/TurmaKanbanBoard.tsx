import { useState } from "react";
import { TurmaKanbanColumn } from "./TurmaKanbanColumn";
import { Turma, useUpdateTurma } from "@/hooks/useTurmas";
import { Course } from "@/hooks/useCourses";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { KanbanColumnManager } from "./KanbanColumnManager";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

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
  const updateTurma = useUpdateTurma();
  const { toast } = useToast();

  // Group turmas by status using dynamic columns
  const groupedTurmas = columns.reduce((acc, column) => {
    if (column.status === 'transformar_treinamento') {
      // For now, this custom column will be empty until we have metadata to distinguish
      // turmas that should be in this column vs regular 'encerrada' turmas
      acc[column.status] = [];
    } else {
      acc[column.status] = turmas.filter(turma => turma.status === column.status);
    }
    return acc;
  }, {} as Record<string, Turma[]>);

  const handleDragStart = (turma: Turma) => {
    setDraggedTurma(turma);
  };

  const handleDragEnd = () => {
    setDraggedTurma(null);
  };

  // Map custom kanban statuses to valid turma statuses
  const mapKanbanStatusToTurmaStatus = (kanbanStatus: string): Turma['status'] => {
    switch (kanbanStatus) {
      case 'transformar_treinamento':
        return 'encerrada'; // Custom status maps to 'encerrada' with additional metadata
      default:
        return kanbanStatus as Turma['status'];
    }
  };

  const handleDrop = async (targetStatus: string) => {
    if (!draggedTurma || draggedTurma.status === targetStatus) {
      setDraggedTurma(null);
      return;
    }
    
    try {
      const turmaStatus = mapKanbanStatusToTurmaStatus(targetStatus);
      
      await updateTurma.mutateAsync({
        id: draggedTurma.id,
        status: turmaStatus,
        // Add custom metadata for transformar_treinamento
        ...(targetStatus === 'transformar_treinamento' ? {
          // You can add custom fields here if needed
        } : {})
      });
      
      toast({
        title: "Turma movida com sucesso!",
        description: `A turma foi movida para ${columns.find(c => c.status === targetStatus)?.title || targetStatus}.`,
      });
    } catch (error) {
      console.error('Error updating turma status:', error);
      toast({
        title: "Erro ao mover turma",
        description: "Não foi possível atualizar o status da turma.",
        variant: "destructive",
      });
    } finally {
      setDraggedTurma(null);
    }
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