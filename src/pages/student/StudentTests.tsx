import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import StudentTestsList from "@/components/student/StudentTestsList";

const StudentTests = () => {
  useEffect(() => {
    document.title = "Testes Avaliativos | Área do Aluno";
  }, []);

  return (
    <BaseLayout title="Área do Aluno">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Testes Avaliativos</h2>
        <p className="text-muted-foreground">Realize os testes dos seus cursos e acompanhe seu desempenho.</p>
      </header>

      <main>
        <StudentTestsList />
      </main>
    </BaseLayout>
  );
};

export default StudentTests;