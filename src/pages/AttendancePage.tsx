
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
        .select(`
          id,
          enrollment_id,
          lesson_id,
          confirmed_at,
          enrollments!inner(
            id,
            student_name,
            course_id,
            turma_id,
            turmas(id, name, code, responsavel_name)
          ),
          lessons!inner(
            id,
            title,
            course_id
          )
        `)
        .order("confirmed_at", { ascending: false })
        .limit(100);
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
          student: enrollment?.student_name ?? "—",
          lesson: lesson?.title ?? "—",
          course: course?.name ?? "—",
          turma: turma?.name || turma?.code || "Turma não definida",
          professor: turma?.responsavel_name ?? "Professor não definido",
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
                <TableHead>Turma</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Confirmado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.student}</TableCell>
                  <TableCell>{r.course}</TableCell>
                  <TableCell>{r.lesson}</TableCell>
                  <TableCell>{r.turma}</TableCell>
                  <TableCell>{r.professor}</TableCell>
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
