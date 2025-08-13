import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceButton from "@/components/student/AttendanceButton";
import RequestCertificateButton from "@/components/student/RequestCertificateButton";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
const StudentCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin = false, isLoading: checkingAdmin } = useIsAdmin(user?.id || undefined);

  useEffect(() => {
    document.title = "Meu Curso | Área do Aluno";
  }, []);

  useEffect(() => {
    if (!checkingAdmin && isAdmin) {
      navigate('/', { replace: true });
    }
  }, [checkingAdmin, isAdmin, navigate]);
  const enrollmentQuery = useQuery({
    queryKey: ["my-enrollment", courseId],
    queryFn: async () => {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) throw new Error("Autenticação necessária");

      const { data, error } = await supabase
        .from("enrollments")
        .select("id, progress_percentage, status, course_id")
        .eq("user_id", userResp.user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const lessonsQuery = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, order_index, zoom_start_time")
        .eq("course_id", courseId)
        .or(`zoom_start_time.is.null,zoom_start_time.gte.${nowIso}`)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!courseId && !!enrollmentQuery.data,
  });

  const enrollment = enrollmentQuery.data;
  const lessons = lessonsQuery.data ?? [];

  // Count how many lessons have attendance confirmed for this enrollment
  const attendanceCountQuery = useQuery({
    queryKey: ['attendance', 'count', enrollment?.id, courseId, (lessons?.map(l => l.id) ?? []).join(',')],
    enabled: Boolean(enrollment?.id && lessons.length > 0),
    queryFn: async () => {
      const lessonIds = lessons.map((l: any) => l.id);
      const { count, error } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('enrollment_id', enrollment!.id)
        .in('lesson_id', lessonIds);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const allAttended = lessons.length > 0 && (attendanceCountQuery.data ?? 0) >= lessons.length;

  // Backfill: se o progresso estiver desatualizado, recalcula no backend e refaz o fetch
  useEffect(() => {
    if (!enrollment || lessons.length === 0) return;
    const attended = attendanceCountQuery.data ?? 0;
    const expected = lessons.length > 0 ? Math.floor((attended * 100) / lessons.length) : 0;
    if ((enrollment.progress_percentage ?? 0) !== expected) {
      supabase.rpc('recalc_enrollment_progress', { p_enrollment_id: enrollment.id })
        .then(() => { enrollmentQuery.refetch(); });
    }
  }, [enrollment?.id, enrollment?.progress_percentage, lessons.length, attendanceCountQuery.data]);

  return (
    <BaseLayout title="Detalhes do Curso">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aulas</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              enrollmentQuery.refetch();
              lessonsQuery.refetch();
            }}
            disabled={enrollmentQuery.isRefetching || lessonsQuery.isRefetching}
          >
            {(enrollmentQuery.isRefetching || lessonsQuery.isRefetching) ? "Recarregando..." : "Recarregar"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/aluno">Voltar</Link>
          </Button>
        </div>
      </header>

      {enrollmentQuery.isLoading ? (
        <p className="mb-6">Carregando sua matrícula...</p>
      ) : enrollment ? (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Progresso: <span className="font-medium">{enrollment.progress_percentage ?? 0}%</span>
          </div>
          {(allAttended || (enrollment.progress_percentage ?? 0) >= 100) ? (
            <RequestCertificateButton
              enrollmentId={enrollment.id}
              courseId={enrollment.course_id}
            />
          ) : (
            <Button variant="secondary" disabled>
              Complete o curso para solicitar o certificado
            </Button>
          )}
        </div>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inscrição necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Você não está inscrito neste curso. Solicite sua inscrição para acessar as aulas.
            </p>
            <Button asChild>
              <Link to="/aluno">Solicitar inscrição</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {enrollment && (
        <section className="grid gap-4">
          {lessons.map((lesson: any) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground max-w-[70%]">
                    {lesson.description ?? ""}
                  </p>
                  <AttendanceButton
                    enrollmentId={enrollment.id}
                    lessonId={lesson.id}
                  >
                    Marcar Presença
                  </AttendanceButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </BaseLayout>
  );
};

export default StudentCourse;
