
import BaseLayout from "@/components/BaseLayout";
import LessonsList from "@/components/lessons/LessonsList";

const LessonsPage = () => {
  return (
    <BaseLayout title="Gerenciar Aulas">
      <LessonsList />
    </BaseLayout>
  );
};

export default LessonsPage;
