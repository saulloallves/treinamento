import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceButton from "@/components/student/AttendanceButton";
import RequestCertificateButton from "@/components/student/RequestCertificateButton";

const StudentCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    document.title = "Meu Curso | Área do Aluno";
  }, []);

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
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!courseId,
  });

  const enrollment = enrollmentQuery.data;
  const lessons = lessonsQuery.data ?? [];

  return (
    <BaseLayout title="Detalhes do Curso">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aulas</h1>
        <Button asChild variant="outline">
          <Link to="/aluno">Voltar</Link>
        </Button>
      </header>

      {enrollment ? (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Progresso: <span className="font-medium">{enrollment.progress_percentage ?? 0}%</span>
          </div>
          {enrollment.progress_percentage >= 100 ? (
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
        <p className="mb-6">Carregando sua matrícula...</p>
      )}

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
                {enrollment && (
                  <AttendanceButton
                    enrollmentId={enrollment.id}
                    lessonId={lesson.id}
                  >
                    Marcar Presença
                  </AttendanceButton>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </BaseLayout>
  );
};

export default StudentCourse;
