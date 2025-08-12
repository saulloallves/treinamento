import { useEffect, useState } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import SelfEnrollDialog from "@/components/student/SelfEnrollDialog";
import { Link } from "react-router-dom";

const StudentPortal = () => {
  const { data: enrollments, isLoading } = useMyEnrollments();
  const [openEnroll, setOpenEnroll] = useState(false);

  useEffect(() => {
    document.title = "Área do Aluno | Cresci e Perdi";
  }, []);

  return (
    <BaseLayout title="Área do Aluno">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Minhas Inscrições</h1>
        <Button onClick={() => setOpenEnroll(true)}>Autoinscrição</Button>
      </header>

      <SelfEnrollDialog open={openEnroll} onOpenChange={setOpenEnroll} />

      <main>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (enrollments && enrollments.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enroll) => (
              <Card key={enroll.id}>
                <CardHeader>
                  <CardTitle>{enroll.course?.name ?? "Curso"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status</span>
                      <span className="font-medium">{enroll.status}</span>
                    </div>
                    <Progress value={enroll.progress_percentage ?? 0} />
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">{enroll.progress_percentage ?? 0}%</span>
                    </div>
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/aluno/curso/${enroll.course_id}`}>Ver curso</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : (
          <section className="text-center py-10">
            <p className="text-muted-foreground mb-4">Você ainda não tem inscrições.</p>
            <Button onClick={() => setOpenEnroll(true)}>Autoinscrever-se</Button>
          </section>
        ))}
      </main>
    </BaseLayout>
  );
};

export default StudentPortal;
