
import BaseLayout from "@/components/BaseLayout";

const AttendancePage = () => {
  return (
    <BaseLayout title="Controle de Presenças">
      <AttendanceList />
    </BaseLayout>
  );
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

const AttendanceList = () => {
  const attendanceQuery = useQuery({
    queryKey: ["attendance", "latest"],
    queryFn: async () => {
      const { data: att, error } = await supabase
        .from("attendance")
        .select("id,enrollment_id,lesson_id,confirmed_at")
        .order("confirmed_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const enrollmentIds = Array.from(new Set((att ?? []).map(a => a.enrollment_id)));
      const lessonIds = Array.from(new Set((att ?? []).map(a => a.lesson_id)));

      const [enrollmentsRes, lessonsRes] = await Promise.all([
        enrollmentIds.length
          ? supabase.from("enrollments").select("id,student_name,course_id").in("id", enrollmentIds)
          : Promise.resolve({ data: [], error: null } as any),
        lessonIds.length
          ? supabase.from("lessons").select("id,title,course_id").in("id", lessonIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);
      if (enrollmentsRes.error) throw enrollmentsRes.error;
      if (lessonsRes.error) throw lessonsRes.error;

      const enrollments = new Map<string, any>();
      for (const e of (enrollmentsRes.data ?? [])) enrollments.set(e.id, e);
      const lessons = new Map<string, any>();
      const courseIds = new Set<string>();
      for (const l of (lessonsRes.data ?? [])) { lessons.set(l.id, l); if (l.course_id) courseIds.add(l.course_id); }

      const coursesRes = courseIds.size
        ? await supabase.from("courses").select("id,name").in("id", Array.from(courseIds))
        : { data: [], error: null } as any;
      if (coursesRes.error) throw coursesRes.error;
      const courses = new Map<string, any>();
      for (const c of (coursesRes.data ?? [])) courses.set(c.id, c);

      return (att ?? []).map((a) => {
        const enr = enrollments.get(a.enrollment_id);
        const les = lessons.get(a.lesson_id);
        const course = (les?.course_id && courses.get(les.course_id)) || (enr?.course_id && courses.get(enr.course_id));
        return {
          id: a.id,
          confirmedAt: a.confirmed_at,
          student: enr?.student_name ?? "—",
          lesson: les?.title ?? "—",
          course: course?.name ?? "—",
        };
      });
    },
  });

  const rows = attendanceQuery.data ?? [];

  return (
    <div className="bg-card p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-foreground mb-4">Presenças confirmadas</h2>
      {attendanceQuery.isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma presença confirmada ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Aluno</th>
                <th className="text-left p-3">Curso</th>
                <th className="text-left p-3">Aula</th>
                <th className="text-left p-3">Confirmado em</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{r.student}</td>
                  <td className="p-3">{r.course}</td>
                  <td className="p-3">{r.lesson}</td>
                  <td className="p-3">{new Date(r.confirmedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
