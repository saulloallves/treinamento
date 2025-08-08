
import BaseLayout from "@/components/BaseLayout";

const EnrollmentsPage = () => {
  return (
    <BaseLayout title="Gerenciar Inscrições">
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Inscrições</h2>
        <p className="text-muted-foreground">
          Aqui você pode gerenciar as inscrições dos usuários nos cursos.
        </p>
      </div>
    </BaseLayout>
  );
};

export default EnrollmentsPage;
