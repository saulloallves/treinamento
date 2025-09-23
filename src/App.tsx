
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import LiveStream from "./pages/LiveStream";
import StreamingDemo from "@/components/streaming/StreamingDemo";
import StreamingModule from "./pages/StreamingModule";
import StreamingTestRoom from "@/components/streaming/StreamingTestRoom";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CoursesPage from "./pages/CoursesPage";
import LessonsPage from "./pages/LessonsPage";
import QuizPage from "./pages/QuizPage";
import TestsPage from "./pages/TestsPage";
import ReportsPage from "./pages/ReportsPage";
import ProfessorReports from "./pages/professor/ProfessorReports";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import AttendancePage from "./pages/AttendancePage";
import ProgressPage from "./pages/ProgressPage";
import CertificatesPage from "./pages/CertificatesPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import CommunicationPage from "./pages/CommunicationPage";
import UsersPage from "./pages/UsersPage";
import UnitsPage from "./pages/UnitsPage";
import SettingsPage from "./pages/SettingsPage";
import TurmasPage from "./pages/TurmasPage";
import ProfessorsPage from "./pages/ProfessorsPage";
import AdminsPage from "./pages/AdminsPage";
import StudentPortal from "./pages/student/StudentPortal";
import StudentCourse from "./pages/student/StudentCourse";
import StudentCourses from "./pages/student/StudentCourses";
import StudentProfile from "./pages/student/StudentProfile";
import StudentLessons from "./pages/student/StudentLessons";
import StudentCourseSchedule from "./pages/student/StudentCourseSchedule";
import TurmaLessons from "./pages/student/TurmaLessons";
import StudentQuiz from "./pages/student/StudentQuiz";
import StudentTests from "./pages/student/StudentTests";
import StudentTest from "./pages/student/StudentTest";
import StudentTestQuestions from "@/components/student/StudentTestQuestions";
import StudentTestResult from "@/components/student/StudentTestResult";
import StudentTurmaTests from "./pages/student/StudentTurmaTests";
import CollaboratorManagement from "./pages/student/CollaboratorManagement";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import RoleGuard from "@/components/RoleGuard";
import RoleRedirect from "@/components/RoleRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<RoleRedirect />} />
              <Route path="/dashboard" element={
                <RoleGuard requiredRole="admin">
                  <Index />
                </RoleGuard>
              } />
              <Route path="/courses" element={
                <RoleGuard requiredRole="admin">
                  <CoursesPage />
                </RoleGuard>
              } />
              <Route path="/lessons" element={
                <RoleGuard requiredRole="admin">
                  <LessonsPage />
                </RoleGuard>
              } />
              <Route path="/turmas" element={
                <RoleGuard requiredRole="admin">
                  <TurmasPage />
                </RoleGuard>
              } />
              <Route path="/quiz" element={
                <RoleGuard requiredRole="admin">
                  <QuizPage />
                </RoleGuard>
              } />
              <Route path="/tests" element={
                <RoleGuard requiredRole="admin">
                  <TestsPage />
                </RoleGuard>
              } />
              <Route path="/reports" element={
                <RoleGuard requiredRole="admin">
                  <ReportsPage />
                </RoleGuard>
              } />
              <Route path="/enrollments" element={
                <RoleGuard requiredRole="admin">
                  <EnrollmentsPage />
                </RoleGuard>
              } />
              <Route path="/attendance" element={
                <RoleGuard requiredRole="admin">
                  <AttendancePage />
                </RoleGuard>
              } />
              <Route path="/progress" element={
                <RoleGuard requiredRole="admin">
                  <ProgressPage />
                </RoleGuard>
              } />
              <Route path="/certificates" element={
                <RoleGuard requiredRole="admin">
                  <CertificatesPage />
                </RoleGuard>
              } />
              <Route path="/whatsapp" element={
                <RoleGuard requiredRole="admin">
                  <WhatsAppPage />
                </RoleGuard>
              } />
              <Route path="/communication" element={
                <RoleGuard requiredRole="admin">
                  <CommunicationPage />
                </RoleGuard>
              } />
              <Route path="/users" element={
                <RoleGuard requiredRole="admin">
                  <UsersPage />
                </RoleGuard>
              } />
              <Route path="/professors" element={
                <RoleGuard requiredRole="admin">
                  <ProfessorsPage />
                </RoleGuard>
              } />
              <Route path="/admins" element={
                <RoleGuard requiredRole="admin">
                  <AdminsPage />
                </RoleGuard>
              } />
              <Route path="/units" element={
                <RoleGuard requiredRole="admin">
                  <UnitsPage />
                </RoleGuard>
              } />
              <Route path="/settings" element={
                <RoleGuard requiredRole="admin">
                  <SettingsPage />
                </RoleGuard>
              } />
              <Route path="/professor" element={
                <RoleGuard requiredRole="teacher">
                  <ProfessorDashboard />
                </RoleGuard>
              } />
              <Route path="/professor/cursos" element={
                <RoleGuard requiredRole="teacher">
                  <CoursesPage />
                </RoleGuard>
              } />
              <Route path="/professor/turmas" element={
                <RoleGuard requiredRole="teacher">
                  <TurmasPage />
                </RoleGuard>
              } />
              <Route path="/professor/aulas" element={
                <RoleGuard requiredRole="teacher">
                  <LessonsPage />
                </RoleGuard>
              } />
              <Route path="/professor/inscricoes" element={
                <RoleGuard requiredRole="teacher">
                  <EnrollmentsPage />
                </RoleGuard>
              } />
              <Route path="/professor/presenca" element={
                <RoleGuard requiredRole="teacher">
                  <AttendancePage />
                </RoleGuard>
              } />
              <Route path="/professor/progresso" element={
                <RoleGuard requiredRole="teacher">
                  <ProgressPage />
                </RoleGuard>
              } />
              <Route path="/professor/avaliacoes" element={
                <RoleGuard requiredRole="teacher">
                  <QuizPage />
                </RoleGuard>
              } />
              <Route path="/professor/tests" element={
                <RoleGuard requiredRole="teacher">
                  <TestsPage />
                </RoleGuard>
              } />
              <Route path="/professor/comunicacao" element={
                <RoleGuard requiredRole="teacher">
                  <WhatsAppPage />
                </RoleGuard>
              } />
              <Route path="/professor/disparos-automaticos" element={
                <RoleGuard requiredRole="teacher">
                  <CommunicationPage />
                </RoleGuard>
              } />
              <Route path="/streaming" element={
                <RoleGuard requiredRole="teacher">
                  <StreamingModule />
                </RoleGuard>
              } />
              <Route path="/professor/reports" element={
                <RoleGuard requiredRole="teacher">
                  <ProfessorReports />
                </RoleGuard>
              } />
              <Route path="/aluno" element={
                <RoleGuard requiredRole="student">
                  <StudentPortal />
                </RoleGuard>
              } />
              <Route path="/aluno/aulas" element={
                <RoleGuard requiredRole="student">
                  <StudentLessons />
                </RoleGuard>
              } />
              <Route path="/aluno/turma/:turmaId/aulas" element={
                <RoleGuard requiredRole="student">
                  <TurmaLessons />
                </RoleGuard>
              } />
              <Route path="/aluno/quiz" element={
                <RoleGuard requiredRole="student">
                  <StudentQuiz />
                </RoleGuard>
              } />
              <Route path="/aluno/cursos" element={
                <RoleGuard requiredRole="student">
                  <StudentCourses />
                </RoleGuard>
              } />
              <Route path="/aluno/perfil" element={
                <RoleGuard requiredRole="student">
                  <StudentProfile />
                </RoleGuard>
              } />
              <Route path="/aluno/colaboradores" element={
                <RoleGuard requiredRole="student">
                  <CollaboratorManagement />
                </RoleGuard>
              } />
              <Route path="/aluno/curso/:courseId" element={
                <RoleGuard requiredRole="student">
                  <StudentCourse />
                </RoleGuard>
              } />
              <Route path="/aluno/curso/:courseId/aulas" element={
                <RoleGuard requiredRole="student">
                  <StudentCourseSchedule />
                </RoleGuard>
              } />
              <Route path="/aluno/curso/:courseId/aulas-gravadas" element={
                <RoleGuard requiredRole="student">
                  <StudentLessons />
                </RoleGuard>
              } />
              <Route path="/aluno/testes" element={
                <RoleGuard requiredRole="student">
                  <StudentTests />
                </RoleGuard>
              } />
              <Route path="/aluno/teste/:testId" element={
                <RoleGuard requiredRole="student">
                  <StudentTest />
                </RoleGuard>
              } />
              <Route path="/aluno/teste/:testId/questoes" element={
                <RoleGuard requiredRole="student">
                  <StudentTestQuestions />
                </RoleGuard>
              } />
              <Route path="/aluno/teste/:testId/resultado" element={
                <RoleGuard requiredRole="student">
                  <StudentTestResult />
                </RoleGuard>
              } />
              <Route path="/aluno/turma/:turmaId/testes" element={
                <RoleGuard requiredRole="student">
                  <StudentTurmaTests />
                </RoleGuard>
              } />
              <Route path="/streaming" element={
                <RoleGuard requiredRole="admin">
                  <StreamingModule />
                </RoleGuard>
              } />
              <Route path="/aula-ao-vivo/:lessonId" element={
                <RoleGuard>
                  <StreamingTestRoom />
                </RoleGuard>
              } />
              <Route path="/streaming-demo" element={
                <RoleGuard>
                  <StreamingDemo />
                </RoleGuard>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
