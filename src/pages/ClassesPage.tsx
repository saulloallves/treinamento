import BaseLayout from "@/components/BaseLayout";
import ClassesList from "@/components/classes/ClassesList";

const ClassesPage = () => {
  return (
    <BaseLayout title="Gerenciar Turmas">
      <ClassesList />
    </BaseLayout>
  );
};

export default ClassesPage;