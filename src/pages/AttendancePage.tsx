
import BaseLayout from "@/components/BaseLayout";
import AttendancesByCourse from "@/components/attendance/AttendancesByCourse";

const AttendancePage = () => {
  return (
    <BaseLayout title="Controle de Presenças">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Presenças</h2>
          <p className="text-muted-foreground">Bem-vindo! Visualize as presenças por curso e turma.</p>
        </div>
      </div>

      <AttendancesByCourse />
    </BaseLayout>
  );
};

export default AttendancePage;
