import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceButton from "@/components/student/AttendanceButton";
import RequestCertificateButton from "@/components/student/RequestCertificateButton";
import { TurmaEnrollmentCard } from "@/components/student/TurmaEnrollmentCard";
import { MyTurmaCard } from "@/components/student/MyTurmaCard";
import { useTurmaEnrollment } from "@/hooks/useTurmaEnrollment";
import { useAuth } from "@/hooks/useAuth";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const StudentCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Meu Curso | Área do Aluno";
  }, []);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["my-enrollment", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'count'] });
      enrollmentQuery.refetch();
      lessonsQuery.refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };
  const enrollmentQuery = useQuery({
    queryKey: ["my-enrollment", courseId],
    queryFn: async () => {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp.user) throw new Error("Autenticação necessária");

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id, 
          progress_percentage, 
          status, 
          course_id,
          course:courses(name, tipo)
        `)
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
      const now = new Date();
      
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, order_index, zoom_start_time, duration_minutes")
        .eq("course_id", courseId)
        .not('zoom_start_time', 'is', null) // Only lessons with scheduled time
        .order("order_index", { ascending: true });

      if (error) throw error;
      
      // Filter lessons that are within the 24-hour attendance window after completion
      const availableLessons = (data ?? []).filter(lesson => {
        if (!lesson.zoom_start_time) return false;
        
        const lessonStart = new Date(lesson.zoom_start_time);
        const lessonDuration = lesson.duration_minutes || 60; // Default 60 minutes
        const lessonEnd = new Date(lessonStart.getTime() + lessonDuration * 60000);
        const attendanceDeadline = new Date(lessonEnd.getTime() + 24 * 60 * 60 * 1000); // 24 hours after lesson ends
        
        // Show lesson only if current time is between lesson end and 24h after lesson end
        return now >= lessonEnd && now <= attendanceDeadline;
      });
      
      return availableLessons;
    },
    enabled: !!courseId && !!enrollmentQuery.data,
  });

  const enrollment = enrollmentQuery.data;
  const lessons = lessonsQuery.data ?? [];
  const { data: turmaEnrollment } = useTurmaEnrollment(courseId!);

  const isLiveCourse = enrollment?.course?.tipo === 'ao_vivo';

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
        <h2 className="text-2xl font-semibold">Aulas do curso</h2>
        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={handleRefresh}
            isRefreshing={enrollmentQuery.isRefetching || lessonsQuery.isRefetching}
          />
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

      {/* Turma information for live courses */}
      {enrollment && isLiveCourse && (
        <div className="mb-6">
          {turmaEnrollment?.turma ? (
            <MyTurmaCard 
              turma={turmaEnrollment.turma}
              courseName={enrollment.course?.name || "Curso"}
            />
          ) : (
            <TurmaEnrollmentCard 
              courseId={courseId!}
              courseName={enrollment.course?.name || "Curso"}
            />
          )}
        </div>
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
