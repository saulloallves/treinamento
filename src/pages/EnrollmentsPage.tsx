import BaseLayout from "@/components/BaseLayout";
import EnrollmentsByCourse from "@/components/enrollments/EnrollmentsByCourse";

const EnrollmentsPage = () => {

  return (
    <BaseLayout title="Gerenciar Inscrições">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Inscrições</h2>
        <p className="text-muted-foreground">Bem-vindo! Gerencie e crie inscrições por curso.</p>
      </div>

      <EnrollmentsByCourse />
    </BaseLayout>
  );
};

export default EnrollmentsPage;
