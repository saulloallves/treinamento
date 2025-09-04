
import BaseLayout from "@/components/BaseLayout";
import ProgressByCourse from "@/components/progress/ProgressByCourse";

const ProgressPage = () => {
  return (
    <BaseLayout title="Progresso dos Usuários">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Progresso dos Usuários</h2>
          <p className="text-muted-foreground">Bem-vindo! Visualize o progresso dos estudantes por curso e turma.</p>
        </div>
      </div>

      <ProgressByCourse />
    </BaseLayout>
  );
};

export default ProgressPage;
