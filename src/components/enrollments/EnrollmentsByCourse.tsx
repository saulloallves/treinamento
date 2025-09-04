import { useMemo, useState } from "react";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Card } from "@/components/ui/card";
import { EnrollmentTurmaCard } from "./EnrollmentTurmaCard";
import { TurmaEnrollmentsDialog } from "./TurmaEnrollmentsDialog";

const EnrollmentsByCourse = () => {
  const { data: enrollments = [], isLoading } = useEnrollments();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, { 
      name: string; 
      turmaName: string;
      professorName: string;
      courseName: string;
      items: typeof enrollments 
    }>();
    for (const e of enrollments) {
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
  }, [enrollments]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {grouped.map((group) => (
          <EnrollmentTurmaCard
            key={group.id}
            group={group}
            onClick={() => handleCardClick(group)}
          />
        ))}
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
