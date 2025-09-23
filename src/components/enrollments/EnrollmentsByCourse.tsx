import { useMemo, useState } from "react";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Card } from "@/components/ui/card";
import { EnrollmentTurmaCard } from "./EnrollmentTurmaCard";
import { TurmaEnrollmentsDialog } from "./TurmaEnrollmentsDialog";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";

const EnrollmentsByCourse = () => {
  const { data: enrollments = [], isLoading } = useEnrollments();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ativas");

  const grouped = useMemo(() => {
    // First filter enrollments by turma status
    const filteredEnrollments = enrollments.filter(enrollment => {
      const turmaStatus = enrollment.turmas?.status;
      if (statusFilter === "ativas") {
        // Default active view: show 'em_andamento' and 'agendada' only
        return turmaStatus === 'em_andamento' || turmaStatus === 'agendada';
      } else if (statusFilter === "arquivadas") {
        // Archive view: show 'encerrada' and 'cancelada'
        return turmaStatus === 'encerrada' || turmaStatus === 'cancelada';
      } else {
        // Specific status filter
        return turmaStatus === statusFilter;
      }
    });

    const map = new Map<string, { 
      name: string; 
      turmaName: string;
      professorName: string;
      courseName: string;
      items: typeof enrollments 
    }>();
    
    for (const e of filteredEnrollments) {
      const key = `${e.course_id}-${e.turma_id}` || "sem-turma";
      const courseName = (e.courses?.name || "Sem curso").trim();
      const turmaName = e.turmas?.name || e.turmas?.code || "Turma não definida";
      const professorName = e.turmas?.responsavel_name || "Professor não definido";
      const name = `${courseName} - ${turmaName}`;
      
      if (!map.has(key)) {
        map.set(key, { 
          name, 
          turmaName,
          professorName,
          courseName,
          items: [] as any 
        });
      }
      map.get(key)!.items.push(e);
    }
    return Array.from(map.entries())
      .map(([id, g]) => ({ id, ...g }))
      .sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [enrollments, statusFilter]);

  const handleCardClick = (group: any) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-muted-foreground">Carregando inscrições...</div>
      </div>
    );
  }

  if (!enrollments.length) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Nenhuma inscrição encontrada.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <TurmaStatusFilters 
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {grouped.map((group) => (
            <EnrollmentTurmaCard
              key={group.id}
              group={group}
              onClick={() => handleCardClick(group)}
            />
          ))}
        </div>
      </div>

      <TurmaEnrollmentsDialog
        group={selectedGroup}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default EnrollmentsByCourse;
