
import BaseLayout from "@/components/BaseLayout";

const ProgressPage = () => {
  return (
    <BaseLayout title="Progresso dos Usuários">
      <ProgressByCourse />
    </BaseLayout>
  );
};

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const ProgressByCourse = () => {
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState<string>("todos");

  const coursesQuery = useQuery({
    queryKey: ["courses", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", "with-course"],
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
          courses(name, tipo, lessons_count)
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
            progress_percentage: realProgress
          };
        })
      );
      
      return enrichedEnrollments;
    },
  });

  const rows = useMemo(() => {
    const base = (enrollmentsQuery.data ?? []) as any[];
    return base.filter((e) => {
      const matchCourse = courseId === "todos" || e.course_id === courseId;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || (e.student_name?.toLowerCase().includes(q) || e.student_email?.toLowerCase().includes(q));
      return matchCourse && matchSearch;
    });
  }, [enrollmentsQuery.data, courseId, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por curso</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Input placeholder="Buscar aluno por nome ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select
            className="h-10 px-3 rounded-md border bg-background"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="todos">Todos os cursos</option>
            {(coursesQuery.data ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {enrollmentsQuery.isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground">Nenhum progresso encontrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.student_name}</TableCell>
                  <TableCell>{e.courses?.name ?? '—'}</TableCell>
                  <TableCell>{e.status}</TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <Progress value={e.progress_percentage ?? 0} className="w-40" />
                      <span className="text-sm text-muted-foreground">{e.progress_percentage ?? 0}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressPage;
