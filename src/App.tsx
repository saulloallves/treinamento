
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
import EnrollmentsPage from "./pages/EnrollmentsPage";
import AttendancePage from "./pages/AttendancePage";
import ProgressPage from "./pages/ProgressPage";
import CertificatesPage from "./pages/CertificatesPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import UsersPage from "./pages/UsersPage";
import UnitsPage from "./pages/UnitsPage";
import SettingsPage from "./pages/SettingsPage";
import StudentPortal from "./pages/student/StudentPortal";
import StudentCourse from "./pages/student/StudentCourse";
import StudentLessons from "./pages/student/StudentLessons";
import StudentQuiz from "./pages/student/StudentQuiz";
import CollaboratorManagement from "./pages/student/CollaboratorManagement";
import ProfileSelection from "./pages/ProfileSelection";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
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
              <Route path="/quiz" element={
                <AdminRoute>
                  <QuizPage />
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
              <Route path="/users" element={
                <AdminRoute>
                  <UsersPage />
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
              <Route path="/aluno/quiz" element={
                <ProtectedRoute requiredRole="Aluno">
                  <StudentQuiz />
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
