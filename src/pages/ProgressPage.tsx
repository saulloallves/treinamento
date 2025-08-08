
import BaseLayout from "@/components/BaseLayout";

const ProgressPage = () => {
  return (
    <BaseLayout title="Progresso dos Usuários">
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Progresso</h2>
        <p className="text-muted-foreground">
          Aqui você pode acompanhar o progresso dos usuários nos cursos.
        </p>
      </div>
    </BaseLayout>
  );
};

export default ProgressPage;
