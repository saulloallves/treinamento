import { useEffect, useState } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMyEnrollments, type MyEnrollment } from "@/hooks/useMyEnrollments";
import SelfEnrollDialog from "@/components/student/SelfEnrollDialog";
import { Link } from "react-router-dom";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const StudentPortal = () => {
  const { data, isLoading, refetch, isRefetching } = useMyEnrollments();
  const enrollments: MyEnrollment[] = (data ?? []) as MyEnrollment[];
  const [openEnroll, setOpenEnroll] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Área do Aluno | Cresci e Perdi";
    console.log('StudentPortal loaded successfully');
  }, []);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  console.log('StudentPortal render:', {
    isLoading,
    enrollmentsCount: enrollments.length,
    enrollments
  });
  return (
    <BaseLayout title="Área do Aluno">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Minhas inscrições</h2>
        <div className="flex items-center gap-2">
          <RefreshButton 
            onClick={handleRefresh} 
            isRefreshing={isRefetching}
          />
          <Button onClick={() => setOpenEnroll(true)}>Autoinscrição</Button>
        </div>
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
