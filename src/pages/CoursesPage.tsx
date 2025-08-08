
import BaseLayout from "@/components/BaseLayout";
import CoursesList from "@/components/courses/CoursesList";

const CoursesPage = () => {
  return (
    <BaseLayout title="Gerenciar Cursos">
      <CoursesList />
    </BaseLayout>
  );
};

export default CoursesPage;
