
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
    <Card>
      <CardHeader>
        <CardTitle>Presenças confirmadas</CardTitle>
        <p className="text-sm text-muted-foreground">{attendanceQuery.isLoading ? "Carregando..." : `${rows.length} registro(s)`}</p>
      </CardHeader>
      <CardContent>
        {attendanceQuery.isLoading ? null : rows.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma presença confirmada ainda.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Confirmado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.student}</TableCell>
                  <TableCell>{r.course}</TableCell>
                  <TableCell>{r.lesson}</TableCell>
                  <TableCell>{new Date(r.confirmedAt).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendancePage;
