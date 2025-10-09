import { TrendingUp } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import ProgressByCourse from "@/components/progress/ProgressByCourse";

const ProgressPage = () => {
  return (
    <BaseLayout title="Progresso dos Usuários">
      <div className="space-y-6">
        {/* Header Section - Compacto */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Acompanhamento de Progresso</h2>
              <p className="text-sm text-muted-foreground">Acompanhe o progresso e desempenho dos estudantes por curso e turma</p>
            </div>
          </div>
        </div>

        <ProgressByCourse />
      </div>
    </BaseLayout>
  );
};

export default ProgressPage;
