import BaseLayout from "@/components/BaseLayout";
import EnrollmentsByCourse from "@/components/enrollments/EnrollmentsByCourse";

const EnrollmentsPage = () => {

  return (
    <BaseLayout title="Gerenciar Inscrições">
      <div className="mb-6">
        <p className="text-muted-foreground">Gerencie e visualize inscrições organizadas por curso</p>
      </div>

      <EnrollmentsByCourse />
    </BaseLayout>
  );
};

export default EnrollmentsPage;
