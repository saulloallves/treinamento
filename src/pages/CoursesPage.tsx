
import BaseLayout from "@/components/BaseLayout";
import CoursesList from "@/components/courses/CoursesList";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateCourseDialog from "@/components/courses/CreateCourseDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const CoursesPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <BaseLayout title="Gerenciar Cursos">
      <CoursesList />
      
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
