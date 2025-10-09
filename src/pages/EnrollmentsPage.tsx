import { UserPlus } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import EnrollmentsByCourse from "@/components/enrollments/EnrollmentsByCourse";

const EnrollmentsPage = () => {
  return (
    <BaseLayout title="Gerenciar Inscrições">
      <div className="space-y-6">
        {/* Header Section - Compacto */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Gestão de Inscrições</h2>
              <p className="text-sm text-muted-foreground">Gerencie e visualize inscrições organizadas por curso</p>
            </div>
          </div>
        </div>

        <EnrollmentsByCourse />
      </div>
    </BaseLayout>
  );
};

export default EnrollmentsPage;
