import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressCard } from "./ProgressCard";
import { ProgressDetailsDialog } from "./ProgressDetailsDialog";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";

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
  const [statusFilter, setStatusFilter] = useState("ativas");

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["progress", "by-course"],
    queryFn: async () => {
      const { data: enrollments, error } = await supabase
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
      
      if (error) throw error;
      
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
      
      return enrichedEnrollments;
    },
  });

  const groupedProgress = useMemo(() => {
    if (!progressData) return [];

    // Filter by turma status
    const filteredProgressData = progressData.filter(progress => {
      const turmaStatus = progress.turmaStatus;
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

    const groups = new Map<string, ProgressGroup>();

    filteredProgressData.forEach((progress) => {
      const key = `${progress.course_id}-${progress.turma_id}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          name: key,
          turmaName: progress.turmaName,
          courseName: progress.courseName,
          items: []
        });
      }
      
      groups.get(key)!.items.push(progress);
    });

    return Array.from(groups.values()).sort((a, b) => 
      a.courseName.localeCompare(b.courseName)
    );
  }, [progressData, statusFilter]);

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
        <TurmaStatusFilters 
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

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