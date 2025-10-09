import * as React from "react";
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProfileProvider } from "@/contexts/ProfileContext";
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
import StudentTurmaQuiz from "./pages/student/StudentTurmaQuiz";
import CollaboratorManagement from "./pages/student/CollaboratorManagement";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import MigrationPage from "./pages/MigrationPage";
import TestEmailPage from "./pages/TestEmailPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import RoleRedirect from "@/components/RoleRedirect";
import ProfessorRoute from "@/components/ProfessorRoute";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const queryClient = new QueryClient();

const RealtimeUpdater = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up Supabase Realtime listener for unidades...');

    const channel = supabase
      .channel('unidades-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'unidades' },
        (payload) => {
          console.log('Realtime update received for unidades:', payload);
          toast.info('A lista de unidades foi atualizada em tempo real.');
          queryClient.invalidateQueries({ queryKey: ['unidades'] });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to unidades changes!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error:', err);
        }
      });

    return () => {
      console.log('Unsubscribing from unidades changes.');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null; // This component does not render anything
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
              <RealtimeUpdater />
              <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<RoleRedirect />} />
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
              <Route path="/migration" element={
                <AdminRoute>
                  <MigrationPage />
                </AdminRoute>
              } />
              <Route path="/test-email" element={
                <AdminRoute>
                  <TestEmailPage />
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
              <Route path="/professor/tests" element={
                <ProfessorRoute>
                  <TestsPage />
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
              <Route path="/streaming" element={
                <ProfessorRoute>
                  <StreamingModule />
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
              <Route path="/aluno/teste/:testId/questoes" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentTestQuestions />
                </ProtectedRoute>
              } />
              <Route path="/aluno/teste/:testId/resultado" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentTestResult />
                </ProtectedRoute>
              } />
              <Route path="/aluno/turma/:turmaId/testes" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentTurmaTests />
                </ProtectedRoute>
              } />
              <Route path="/aluno/turma/:turmaId/quiz" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentTurmaQuiz />
                </ProtectedRoute>
              } />
              <Route path="/streaming" element={
                <AdminRoute>
                  <StreamingModule />
                </AdminRoute>
              } />
              <Route path="/aula-ao-vivo/:lessonId" element={
                <ProtectedRoute>
                  <StreamingTestRoom />
                </ProtectedRoute>
              } />
              <Route path="/streaming-demo" element={
                <ProtectedRoute>
                  <StreamingDemo />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;