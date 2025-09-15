
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
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
import CollaboratorManagement from "./pages/student/CollaboratorManagement";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfileSelection from "./pages/ProfileSelection";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import RoleRedirect from "@/components/RoleRedirect";
import ProfessorRoute from "@/components/ProfessorRoute";

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
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <ProfileSelection />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <AdminRoute>
                  <Index />
                </AdminRoute>
              } />
              <Route path="/courses" element={
                <AdminRoute>
                  <CoursesPage />
                </AdminRoute>
              } />
              <Route path="/lessons" element={
                <AdminRoute>
                  <LessonsPage />
                </AdminRoute>
              } />
              <Route path="/turmas" element={
                <AdminRoute>
                  <TurmasPage />
                </AdminRoute>
              } />
              <Route path="/quiz" element={
                <AdminRoute>
                  <QuizPage />
                </AdminRoute>
              } />
              <Route path="/tests" element={
                <AdminRoute>
                  <TestsPage />
                </AdminRoute>
              } />
              <Route path="/reports" element={
                <AdminRoute>
                  <ReportsPage />
                </AdminRoute>
              } />
              <Route path="/enrollments" element={
                <AdminRoute>
                  <EnrollmentsPage />
                </AdminRoute>
              } />
              <Route path="/attendance" element={
                <AdminRoute>
                  <AttendancePage />
                </AdminRoute>
              } />
              <Route path="/progress" element={
                <AdminRoute>
                  <ProgressPage />
                </AdminRoute>
              } />
              <Route path="/certificates" element={
                <AdminRoute>
                  <CertificatesPage />
                </AdminRoute>
              } />
              <Route path="/whatsapp" element={
                <AdminRoute>
                  <WhatsAppPage />
                </AdminRoute>
              } />
              <Route path="/communication" element={
                <AdminRoute>
                  <CommunicationPage />
                </AdminRoute>
              } />
              <Route path="/users" element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              } />
              <Route path="/professors" element={
                <AdminRoute>
                  <ProfessorsPage />
                </AdminRoute>
              } />
              <Route path="/admins" element={
                <AdminRoute>
                  <AdminsPage />
                </AdminRoute>
              } />
              <Route path="/units" element={
                <AdminRoute>
                  <UnitsPage />
                </AdminRoute>
              } />
              <Route path="/settings" element={
                <AdminRoute>
                  <SettingsPage />
                </AdminRoute>
              } />
              <Route path="/professor" element={
                <ProfessorRoute>
                  <ProfessorDashboard />
                </ProfessorRoute>
              } />
              <Route path="/professor/cursos" element={
                <ProfessorRoute>
                  <CoursesPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/turmas" element={
                <ProfessorRoute>
                  <TurmasPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/aulas" element={
                <ProfessorRoute>
                  <LessonsPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/inscricoes" element={
                <ProfessorRoute>
                  <EnrollmentsPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/presenca" element={
                <ProfessorRoute>
                  <AttendancePage />
                </ProfessorRoute>
              } />
              <Route path="/professor/progresso" element={
                <ProfessorRoute>
                  <ProgressPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/avaliacoes" element={
                <ProfessorRoute>
                  <QuizPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/comunicacao" element={
                <ProfessorRoute>
                  <WhatsAppPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/disparos-automaticos" element={
                <ProfessorRoute>
                  <CommunicationPage />
                </ProfessorRoute>
              } />
              <Route path="/professor/reports" element={
                <ProfessorRoute>
                  <ProfessorReports />
                </ProfessorRoute>
              } />
              <Route path="/aluno" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentPortal />
                </ProtectedRoute>
              } />
              <Route path="/aluno/aulas" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentLessons />
                </ProtectedRoute>
              } />
              <Route path="/aluno/turma/:turmaId/aulas" element={
                <ProtectedRoute requiredRole="Aluno">
                  <TurmaLessons />
                </ProtectedRoute>
              } />
              <Route path="/aluno/quiz" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentQuiz />
                </ProtectedRoute>
              } />
              <Route path="/aluno/cursos" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentCourses />
                </ProtectedRoute>
              } />
              <Route path="/aluno/perfil" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentProfile />
                </ProtectedRoute>
              } />
              <Route path="/aluno/colaboradores" element={
                <ProtectedRoute requiredRole="Aluno">
                  <CollaboratorManagement />
                </ProtectedRoute>
              } />
              <Route path="/aluno/curso/:courseId" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentCourse />
                </ProtectedRoute>
              } />
              <Route path="/aluno/curso/:courseId/aulas" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentCourseSchedule />
                </ProtectedRoute>
              } />
              <Route path="/aluno/curso/:courseId/aulas-gravadas" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentLessons />
                </ProtectedRoute>
              } />
              <Route path="/aluno/testes" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentTests />
                </ProtectedRoute>
              } />
              <Route path="/aluno/teste/:testId" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentTest />
                </ProtectedRoute>
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
