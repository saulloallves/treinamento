import { useState, useEffect } from "react";
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
  const [optimisticTurmas, setOptimisticTurmas] = useState<Turma[]>(turmas);
  const { columns, loading } = useKanbanColumns();
  const updateTurma = useUpdateTurma();
  const { toast } = useToast();

  // Update optimistic turmas when turmas prop changes
  useEffect(() => {
    setOptimisticTurmas(turmas);
  }, [turmas]);

  // Group turmas by status using dynamic columns with optimistic updates
  const groupedTurmas = columns.reduce((acc, column) => {
    acc[column.status] = optimisticTurmas.filter(turma => turma.status === column.status);
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
    // All statuses map directly now, including transformar_treinamento
    return kanbanStatus as Turma['status'];
  };

// Remove debug logs for production
const handleDrop = async (targetStatus: string) => {
  if (!draggedTurma) {
    setDraggedTurma(null);
    return;
  }
  
  const originalStatus = draggedTurma.status;
  const turmaStatus = mapKanbanStatusToTurmaStatus(targetStatus);
  
  // Skip if already in correct status
  if (originalStatus === turmaStatus) {
    setDraggedTurma(null);
    return;
  }
  
  // Optimistic update - immediately update UI
  setOptimisticTurmas(prev => 
    prev.map(turma => 
      turma.id === draggedTurma.id 
        ? { ...turma, status: turmaStatus }
        : turma
    )
  );
  
  try {
    await updateTurma.mutateAsync({
      id: draggedTurma.id,
      status: turmaStatus,
    });
    
    // No success toast - silent success for better UX
  } catch (error) {
    console.error('Error updating turma status:', error);
    
    // Rollback optimistic update on error
    setOptimisticTurmas(prev => 
      prev.map(turma => 
        turma.id === draggedTurma.id 
          ? { ...turma, status: originalStatus }
          : turma
      )
    );
    
    toast({
      title: "Erro ao mover turma",
      description: "Não foi possível atualizar o status da turma.",
      variant: "destructive",
    });
  } finally {
    setDraggedTurma(null);
  }
};


  // Show loading state while fetching column configuration
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configuração...</p>
        </div>
      </div>
    );
  }

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
      <div
        className="grid gap-4 h-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(335px, 1fr))'
        }}
      >
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
      <div
        className="mt-6 grid gap-4 text-center"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'
        }}
      >
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