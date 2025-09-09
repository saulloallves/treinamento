import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useMyEnrollments, type MyEnrollment } from "@/hooks/useMyEnrollments";
import { StudentCourseCardMobile } from "@/components/student/StudentCourseCardMobile";
import { BookOpen } from "lucide-react";

const StudentCourses = () => {
  const { data, isLoading } = useMyEnrollments();
  const enrollments: MyEnrollment[] = (data ?? []) as MyEnrollment[];

  useEffect(() => {
    document.title = "Meus Cursos | Cresci e Perdi";
  }, []);

  return (
    <BaseLayout title="Meus Cursos" showBottomNav>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Meus Cursos</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando cursos...</p>
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrollments.map((enrollment) => (
              <StudentCourseCardMobile key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground">Você ainda não está inscrito em nenhum curso.</p>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default StudentCourses;