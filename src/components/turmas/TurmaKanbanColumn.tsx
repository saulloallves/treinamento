import { useState } from "react";
import { TurmaKanbanCard } from "./TurmaKanbanCard";
import { Turma } from "@/hooks/useTurmas";
import { Course } from "@/hooks/useCourses";
import { Badge } from "@/components/ui/badge";

interface TurmaKanbanColumnProps {
  title: string;
  status: string;
  turmas: Turma[];
  courses: Course[];
  color: string;
  headerColor: string;
  count: number;
  onViewDetails: (turma: Turma) => void;
  onEnrollStudent: (turmaId: string) => void;
  onEditTurma: (turma: Turma) => void;
  onDragStart: (turma: Turma) => void;
  onDragEnd: () => void;
  onDrop: (status: string) => void;
  draggedTurma: Turma | null;
}

export const TurmaKanbanColumn = ({
  title,
  status,
  turmas,
  courses,
  color,
  headerColor,
  count,
  onViewDetails,
  onEnrollStudent,
  onEditTurma,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedTurma,
}: TurmaKanbanColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(status);
  };

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div className={`rounded-t-lg p-4 ${headerColor} text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{title}</h3>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {count}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <div
        className={`max-h-[calc(100vh-300px)] overflow-y-auto p-4 border-l border-r border-b rounded-b-lg transition-all duration-200 ${color} ${
          isDragOver ? 'bg-primary/10 border-primary border-dashed border-2 ring-2 ring-primary/30' : ''
        } custom-scrollbar`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          {turmas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">Nenhuma turma {title.toLowerCase()}</div>
            </div>
          ) : (
            turmas.map((turma) => {
              const course = courses.find(c => c.id === turma.course_id);
              return (
                <TurmaKanbanCard
                  key={turma.id}
                  turma={turma}
                  course={course}
                  onViewDetails={onViewDetails}
                  onEnrollStudent={onEnrollStudent}
                  onEditTurma={onEditTurma}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  isDragging={draggedTurma?.id === turma.id}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};