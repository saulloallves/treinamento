
import BaseLayout from "@/components/BaseLayout";
import AttendancesByCourse from "@/components/attendance/AttendancesByCourse";

const AttendancePage = () => {
  return (
    <BaseLayout title="Controle de Presenças">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground">Visualize e gerencie as presenças organizadas por curso e turma</p>
        </div>
      </div>

      <AttendancesByCourse />
    </BaseLayout>
  );
};

export default AttendancePage;
