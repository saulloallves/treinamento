import { useState } from "react";
import { StudentQuizSummary } from "./StudentQuizSummary";
import { StudentQuizDetail } from "./StudentQuizDetail";
import { StudentQuizResponses } from "./StudentQuizResponses";

interface QuizDetailedViewProps {
  turmaId: string;
  quizName: string;
  turmaName: string;
  courseName: string;
  onBack: () => void;
}

export const QuizDetailedView = ({ turmaId, quizName, turmaName, courseName, onBack }: QuizDetailedViewProps) => {
  const [view, setView] = useState<'students' | 'student-quizzes' | 'student-responses'>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  // Funções de navegação
  const handleSelectStudent = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setView('student-quizzes');
  };

  const handleSelectQuiz = (selectedQuizName: string) => {
    setView('student-responses');
  };

  const handleBackToStudents = () => {
    setView('students');
    setSelectedStudentId(null);
    setSelectedStudentName(null);
  };

  const handleBackToQuizzes = () => {
    setView('student-quizzes');
  };

  // Renderizar visualização baseada no estado atual
  if (view === 'student-responses' && selectedStudentId && selectedStudentName) {
    return (
      <StudentQuizResponses
        turmaId={turmaId}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        quizName={quizName}
        onBack={handleBackToQuizzes}
      />
    );
  }

  if (view === 'student-quizzes' && selectedStudentId && selectedStudentName) {
    return (
      <StudentQuizDetail
        turmaId={turmaId}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        onBack={handleBackToStudents}
        onSelectQuiz={handleSelectQuiz}
      />
    );
  }

  // Visualização padrão - lista de estudantes
  return (
    <StudentQuizSummary
      turmaId={turmaId}
      turmaName={turmaName}
      courseName={courseName}
      onBack={onBack}
      onSelectStudent={handleSelectStudent}
    />
  );
};