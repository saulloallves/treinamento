
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
import ProtectedRoute from "@/components/ProtectedRoute";

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
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/courses" element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              } />
              <Route path="/lessons" element={
                <ProtectedRoute>
                  <LessonsPage />
                </ProtectedRoute>
              } />
              <Route path="/enrollments" element={
                <ProtectedRoute>
                  <EnrollmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/attendance" element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              } />
              <Route path="/certificates" element={
                <ProtectedRoute>
                  <CertificatesPage />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp" element={
                <ProtectedRoute>
                  <WhatsAppPage />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/units" element={
                <ProtectedRoute>
                  <UnitsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/aluno" element={
                <ProtectedRoute>
                  <StudentPortal />
                </ProtectedRoute>
              } />
              <Route path="/aluno/curso/:courseId" element={
                <ProtectedRoute>
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
