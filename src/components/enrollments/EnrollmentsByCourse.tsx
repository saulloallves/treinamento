import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { EnrollmentTurmaCard } from "./EnrollmentTurmaCard";
import { TurmaEnrollmentsDialog } from "./TurmaEnrollmentsDialog";

const EnrollmentsByCourse = () => {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all turmas and their enrollments
  const { data: turmasData, isLoading } = useQuery({
    queryKey: ["turmas-with-enrollments"],
    queryFn: async () => {
      // First fetch all turmas
      const { data: turmas, error: turmasError } = await supabase
        .from("turmas")
        .select(`
          id,
          name,
          code,
          status,
          course_id,
          responsavel_name,
          courses(id, name)
        `)
        .order("created_at", { ascending: false });
        
      if (turmasError) throw turmasError;

      // Then fetch all enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses(name, tipo, lessons_count),
          turmas(id, name, code, status, responsavel_name)
        `)
        .order("created_at", { ascending: false });
        
      if (enrollmentsError) throw enrollmentsError;

      // Map enrollments by turma
      const enrollmentsByTurma = new Map<string, any[]>();
      (enrollments ?? []).forEach((enrollment) => {
        const turmaId = enrollment.turma_id;
        if (turmaId) {
          if (!enrollmentsByTurma.has(turmaId)) {
            enrollmentsByTurma.set(turmaId, []);
          }
          enrollmentsByTurma.get(turmaId)!.push(enrollment);
        }
      });

      // Combine turmas with their enrollments
      return (turmas ?? []).map((turma) => {
        const course = turma.courses;
        const turmaEnrollments = enrollmentsByTurma.get(turma.id) || [];
        
        return {
          turmaId: turma.id,
          courseId: course?.id,
          courseName: course?.name ?? "—",
          turmaName: turma.name || turma.code || "Turma não definida",
          turmaStatus: turma.status,
          professorName: turma.responsavel_name || "Professor não definido",
          enrollments: turmaEnrollments
        };
      });
    }
  });

  const grouped = useMemo(() => {
    if (!turmasData) return [];

    // Show only active turmas (em_andamento and agendada)
    const filteredTurmas = turmasData.filter(turmaData => {
      const turmaStatus = turmaData.turmaStatus;
      return turmaStatus === 'em_andamento' || turmaStatus === 'agendada';
    });

    return filteredTurmas.map((turmaData) => ({
      id: `${turmaData.courseId}-${turmaData.turmaId}`,
      name: `${turmaData.courseName} - ${turmaData.turmaName}`,
      turmaName: turmaData.turmaName,
      professorName: turmaData.professorName,
      courseName: turmaData.courseName,
      items: turmaData.enrollments
    })).sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [turmasData]);

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

  if (grouped.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Nenhuma turma ativa encontrada.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
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
