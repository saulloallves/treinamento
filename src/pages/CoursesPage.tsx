
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
              <p className="text-muted-foreground">Gerencie os cursos de treinamento</p>
            </div>
          </div>
          
          {/* Desktop Create Button */}
          {!isMobile && (
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="h-11 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Curso
            </Button>
          )}
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
