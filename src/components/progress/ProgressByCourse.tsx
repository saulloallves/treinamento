import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressCard } from "./ProgressCard";
import { ProgressDetailsDialog } from "./ProgressDetailsDialog";

interface ProgressGroup {
  id: string;
  name: string;
  turmaName: string;
  courseName: string;
  items: any[];
}

const ProgressByCourse = () => {
  const [selectedGroup, setSelectedGroup] = useState<ProgressGroup | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: turmasData, isLoading } = useQuery({
    queryKey: ["turmas-with-progress"],
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
          courses(id, name, tipo, lessons_count)
        `)
        .order("created_at", { ascending: false });
        
      if (turmasError) throw turmasError;

      // Then fetch all enrollments with progress
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          student_name,
          student_email,
          progress_percentage,
          status,
          created_at,
          course_id,
          turma_id,
          courses(name, tipo, lessons_count),
          turmas(id, name, code, status)
        `)
        .order("created_at", { ascending: false });
      
      if (enrollmentsError) throw enrollmentsError;
      
      // Calculate real progress based on course type
      const enrichedEnrollments = await Promise.all(
        (enrollments ?? []).map(async (enrollment: any) => {
          const courseType = enrollment.courses?.tipo;
          let realProgress = enrollment.progress_percentage || 0;
          
          if (courseType === 'gravado') {
            // For recorded courses, calculate progress from student_progress table
            const { data: progressData } = await supabase
              .from('student_progress')
              .select('status')
              .eq('enrollment_id', enrollment.id);
            
            // Count completed lessons for recorded courses
            const completedLessons = (progressData || []).filter(p => p.status === 'completed').length;
            const { data: totalLessonsData } = await supabase
              .from('recorded_lessons')
              .select('id')
              .eq('course_id', enrollment.course_id);
            
            const totalLessons = (totalLessonsData || []).length;
            realProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            
          } else {
            // For live courses, use attendance table (existing logic)
            const { data: attendanceData } = await supabase
              .from('attendance')
              .select('id')
              .eq('enrollment_id', enrollment.id);
            
            const attendedLessons = (attendanceData || []).length;
            const totalLessons = enrollment.courses?.lessons_count || 0;
            realProgress = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;
          }
          
          return {
            ...enrollment,
            progress_percentage: realProgress,
            courseName: enrollment.courses?.name ?? "—",
            turmaName: enrollment.turmas?.name || enrollment.turmas?.code || "Turma não definida",
            turmaStatus: enrollment.turmas?.status,
          };
        })
      );

      // Map enrollments by turma
      const enrollmentsByTurma = new Map<string, any[]>();
      enrichedEnrollments.forEach((enrollment) => {
        const turmaId = enrollment.turma_id;
        if (turmaId) {
          if (!enrollmentsByTurma.has(turmaId)) {
            enrollmentsByTurma.set(turmaId, []);
          }
          enrollmentsByTurma.get(turmaId)!.push(enrollment);
        }
      });

      // Combine turmas with their progress data
      return (turmas ?? []).map((turma) => {
        const course = turma.courses;
        const turmaEnrollments = enrollmentsByTurma.get(turma.id) || [];
        
        return {
          turmaId: turma.id,
          courseId: course?.id,
          courseName: course?.name ?? "—",
          turmaName: turma.name || turma.code || "Turma não definida",
          turmaStatus: turma.status,
          enrollments: turmaEnrollments
        };
      });
    },
  });

  const groupedProgress = useMemo(() => {
    if (!turmasData) return [];

    // Show only active turmas (em_andamento and agendada)
    const filteredTurmas = turmasData.filter(turmaData => {
      const turmaStatus = turmaData.turmaStatus;
      return turmaStatus === 'em_andamento' || turmaStatus === 'agendada';
    });

    return filteredTurmas.map((turmaData) => ({
      id: `${turmaData.courseId}-${turmaData.turmaId}`,
      name: `${turmaData.courseId}-${turmaData.turmaId}`,
      turmaName: turmaData.turmaName,
      courseName: turmaData.courseName,
      items: turmaData.enrollments
    })).sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [turmasData]);

  const handleCardClick = (group: ProgressGroup) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (groupedProgress.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum progresso encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupedProgress.map((group) => (
            <ProgressCard
              key={group.id}
              group={group}
              onClick={() => handleCardClick(group)}
            />
          ))}
        </div>
      </div>

      {selectedGroup && (
        <ProgressDetailsDialog
          group={selectedGroup}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
};

export default ProgressByCourse;