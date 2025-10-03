import BaseLayout from "@/components/BaseLayout";
import LessonsList from "@/components/lessons/LessonsList";
import { GraduationCap } from "lucide-react";

const LessonsPage = () => {
  return (
    <BaseLayout title="Gerenciar Aulas">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
              <GraduationCap className="w-5 h-5 text-white" />
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
