import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceCard } from "./AttendanceCard";
import { AttendanceDetailsDialog } from "./AttendanceDetailsDialog";

interface AttendanceGroup {
  id: string;
  name: string;
  turmaName: string;
  courseName: string;
  items: any[];
}

const AttendancesByCourse = () => {
  const [selectedGroup, setSelectedGroup] = useState<AttendanceGroup | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: attendances, isLoading } = useQuery({
    queryKey: ["attendance", "by-course"],
    queryFn: async () => {
      // Primeiro buscar todas as turmas ativas
      const { data: turmas, error: turmasError } = await supabase
        .from("turmas")
        .select(`
          id,
          name,
          code,
          course_id,
          courses(id, name)
        `)
        .order("created_at", { ascending: false });
        
      if (turmasError) throw turmasError;

      // Depois buscar todas as presenças
      const { data: att, error } = await supabase
        .from("attendance")
        .select(`
          id,
          enrollment_id,
          lesson_id,
          confirmed_at,
          typed_keyword,
          enrollments!inner(
            id,
            student_name,
            course_id,
            turma_id,
            turmas(id, name, code)
          ),
          lessons!inner(
            id,
            title,
            course_id
          )
        `)
        .order("confirmed_at", { ascending: false });
        
      if (error) throw error;

      // Mapear presenças por turma
      const attendancesByTurma = new Map<string, any[]>();
      
      (att ?? []).forEach((a) => {
        const enrollment = a.enrollments;
        const lesson = a.lessons;
        const turma = enrollment?.turmas;
        
        const attendanceData = {
          id: a.id,
          confirmedAt: a.confirmed_at,
          typedKeyword: a.typed_keyword,
          student: enrollment?.student_name ?? "—",
          lesson: lesson?.title ?? "—",
          turmaId: turma?.id,
          courseId: lesson?.course_id,
        };

        if (turma?.id) {
          if (!attendancesByTurma.has(turma.id)) {
            attendancesByTurma.set(turma.id, []);
          }
          attendancesByTurma.get(turma.id)!.push(attendanceData);
        }
      });

      // Criar dados para todas as turmas
      return (turmas ?? []).map((turma) => {
        const course = turma.courses;
        const attendancesForTurma = attendancesByTurma.get(turma.id) || [];
        
        return {
          turmaId: turma.id,
          courseId: course?.id,
          courseName: course?.name ?? "—",
          turmaName: turma.name || turma.code || "Turma não definida",
          attendances: attendancesForTurma
        };
      });
    },
  });

  const groupedAttendances = useMemo(() => {
    if (!attendances) return [];

    return attendances.map((turmaData) => ({
      id: `${turmaData.courseId}-${turmaData.turmaId}`,
      name: `${turmaData.courseId}-${turmaData.turmaId}`,
      turmaName: turmaData.turmaName,
      courseName: turmaData.courseName,
      items: turmaData.attendances
    })).sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [attendances]);

  const handleCardClick = (group: AttendanceGroup) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (groupedAttendances.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma turma encontrada.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groupedAttendances.map((group) => (
          <AttendanceCard
            key={group.id}
            group={group}
            onClick={() => handleCardClick(group)}
          />
        ))}
      </div>

      {selectedGroup && (
        <AttendanceDetailsDialog
          group={selectedGroup}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
};

export default AttendancesByCourse;