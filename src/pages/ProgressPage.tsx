
import BaseLayout from "@/components/BaseLayout";
import ProgressByCourse from "@/components/progress/ProgressByCourse";

const ProgressPage = () => {
  return (
    <BaseLayout title="Progresso dos Usuários">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground">Acompanhe o progresso e desempenho dos estudantes por curso e turma</p>
        </div>
      </div>

      <ProgressByCourse />
    </BaseLayout>
  );
};

export default ProgressPage;
