import { useEffect, useState } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { useMyEnrollments, type MyEnrollment } from "@/hooks/useMyEnrollments";
import SelfEnrollDialog from "@/components/student/SelfEnrollDialog";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StudentCourseCardMobile } from "@/components/student/StudentCourseCardMobile";
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
            <section className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {enrollments.map((enroll) => (
                <StudentCourseCardMobile key={enroll.id} enrollment={enroll} />
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
