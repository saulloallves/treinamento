import BaseLayout from "@/components/BaseLayout";
import LessonsList from "@/components/lessons/LessonsList";
import { GraduationCap } from "lucide-react";

const LessonsPage = () => {
  return (
    <BaseLayout title="Gerenciar Aulas">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Gestão de Aulas</h1>
              <p className="text-xs text-muted-foreground">Gerencie as aulas e conteúdos dos cursos</p>
            </div>
          </div>
        </div>

        <LessonsList />
      </div>
    </BaseLayout>
  );
};

export default LessonsPage;
