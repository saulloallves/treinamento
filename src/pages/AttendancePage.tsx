
import BaseLayout from "@/components/BaseLayout";

const AttendancePage = () => {
  return (
    <BaseLayout title="Controle de Presenças">
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Presenças</h2>
        <p className="text-muted-foreground">
          Aqui você pode controlar a presença dos usuários nas aulas.
        </p>
      </div>
    </BaseLayout>
  );
};

export default AttendancePage;
