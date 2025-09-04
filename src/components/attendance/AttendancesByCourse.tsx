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

      // Buscar informações dos cursos
      const courseIds = Array.from(new Set(att?.map(a => a.lessons?.course_id).filter(Boolean) ?? []));
      const coursesRes = courseIds.length
        ? await supabase.from("courses").select("id,name").in("id", courseIds)
        : { data: [], error: null } as any;
      if (coursesRes.error) throw coursesRes.error;
      
      const courses = new Map<string, any>();
      for (const c of (coursesRes.data ?? [])) courses.set(c.id, c);

      return (att ?? []).map((a) => {
        const enrollment = a.enrollments;
        const lesson = a.lessons;
        const course = lesson?.course_id ? courses.get(lesson.course_id) : null;
        const turma = enrollment?.turmas;
        
        return {
          id: a.id,
          confirmedAt: a.confirmed_at,
          typedKeyword: a.typed_keyword,
          student: enrollment?.student_name ?? "—",
          lesson: lesson?.title ?? "—",
          course: course?.name ?? "—",
          courseName: course?.name ?? "—",
          turma: turma?.name || turma?.code || "Turma não definida",
          turmaName: turma?.name || turma?.code || "Turma não definida",
          turmaId: turma?.id,
          courseId: course?.id,
        };
      });
    },
  });

  const groupedAttendances = useMemo(() => {
    if (!attendances) return [];

    const groups = new Map<string, AttendanceGroup>();

    attendances.forEach((attendance) => {
      const key = `${attendance.courseId}-${attendance.turmaId}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          name: key,
          turmaName: attendance.turmaName,
          courseName: attendance.courseName,
          items: []
        });
      }
      
      groups.get(key)!.items.push(attendance);
    });

    return Array.from(groups.values()).sort((a, b) => 
      a.courseName.localeCompare(b.courseName)
    );
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
        <p className="text-muted-foreground">Nenhuma presença encontrada.</p>
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