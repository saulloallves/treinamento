
import BaseLayout from "@/components/BaseLayout";
import CoursesList from "@/components/courses/CoursesList";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";
import { Plus, BookOpen } from "lucide-react";
import { useState } from "react";
import CreateCourseDialog from "@/components/courses/CreateCourseDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const CoursesPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <BaseLayout title="Gerenciar Cursos">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Gestão de Cursos</h1>
                <p className="text-xs text-muted-foreground">Gerencie os cursos de treinamento</p>
              </div>
            </div>
            
            {/* Desktop Create Button */}
            {!isMobile && (
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                size="sm"
                className="h-8"
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Novo Curso
              </Button>
            )}
          </div>
        </div>

        <CoursesList onCreateCourse={() => setCreateDialogOpen(true)} />
      </div>
      
      {/* Mobile FAB */}
      {isMobile && (
        <FloatingActionButton
          onClick={() => setCreateDialogOpen(true)}
          icon={Plus}
          label="Adicionar Curso"
        />
      )}
      
      <CreateCourseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </BaseLayout>
  );
};

export default CoursesPage;
