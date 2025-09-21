import { useState } from "react";
import { TurmaKanbanColumn } from "./TurmaKanbanColumn";
import { Turma } from "@/hooks/useTurmas";
import { Course } from "@/hooks/useCourses";

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

  // Group turmas by status
  const groupedTurmas = {
    agendada: turmas.filter(turma => turma.status === 'agendada'),
    em_andamento: turmas.filter(turma => turma.status === 'em_andamento'),
    transformar_treinamento: turmas.filter(turma => (turma.status as any) === 'transformar_treinamento'),
    encerrada: turmas.filter(turma => turma.status === 'encerrada'),
  };

  const columns = [
    {
      id: 'agendada',
      title: 'Planejadas',
      status: 'agendada' as const,
      turmas: groupedTurmas.agendada,
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-500',
      count: groupedTurmas.agendada.length,
    },
    {
      id: 'em_andamento', 
      title: 'Em Andamento',
      status: 'em_andamento' as const,
      turmas: groupedTurmas.em_andamento,
      color: 'bg-orange-50 border-orange-200',
      headerColor: 'bg-orange-500',
      count: groupedTurmas.em_andamento.length,
    },
    {
      id: 'transformar_treinamento',
      title: 'Transformar em Treinamento', 
      status: 'transformar_treinamento' as const,
      turmas: groupedTurmas.transformar_treinamento,
      color: 'bg-purple-50 border-purple-200',
      headerColor: 'bg-purple-500',
      count: groupedTurmas.transformar_treinamento.length,
    },
    {
      id: 'encerrada',
      title: 'Finalizadas',
      status: 'encerrada' as const,
      turmas: groupedTurmas.encerrada,
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-500',
      count: groupedTurmas.encerrada.length,
    },
  ];

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

  return (
    <div className="kanban-board">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        {columns.map((column) => (
          <TurmaKanbanColumn
            key={column.id}
            title={column.title}
            status={column.status}
            turmas={column.turmas}
            courses={courses}
            color={column.color}
            headerColor={column.headerColor}
            count={column.count}
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        {columns.map((column) => (
          <div key={column.id} className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-foreground">{column.count}</div>
            <div className="text-sm text-muted-foreground">{column.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};