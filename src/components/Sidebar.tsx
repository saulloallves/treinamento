
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Building2, 
  BookOpen, 
  Award,
  BarChart3,
  Settings,
  UserCheck,
  Calendar,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  ClipboardList,
  User,
  FileQuestion,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { getSelectedProfile } from "@/lib/profile";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const selectedProfile = getSelectedProfile();
  
  // Determinar qual menu mostrar baseado na preferência do usuário
  const shouldShowAdminMenu = selectedProfile === 'Admin' || (selectedProfile === null && isAdmin);
  
  console.log('Sidebar Debug:', {
    isAdmin,
    selectedProfile,
    shouldShowAdminMenu,
    currentPath: location.pathname
  });
  
  const menuItems = shouldShowAdminMenu
    ? [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        
        { icon: GraduationCap, label: "Cursos", path: "/courses" },
        { icon: BookOpen, label: "Aulas", path: "/lessons" },
        { icon: FileQuestion, label: "Quiz", path: "/quiz" },
        { icon: ClipboardList, label: "Inscrições", path: "/enrollments" },
        { icon: UserCheck, label: "Presenças", path: "/attendance" },
        { icon: TrendingUp, label: "Progresso", path: "/progress" },
        { icon: Award, label: "Certificados", path: "/certificates" },
        { icon: MessageSquare, label: "Disparos WhatsApp", path: "/whatsapp" },
        { icon: Users, label: "Usuários", path: "/users" },
        { icon: Building2, label: "Unidades", path: "/units" },
        { icon: Settings, label: "Configurações", path: "/settings" },
      ]
    : [
        { icon: GraduationCap, label: "Cursos", path: "/aluno" },
        { icon: BookOpen, label: "Aulas", path: "/aluno/aulas" },
        { icon: FileQuestion, label: "Quiz", path: "/aluno/quiz" },
      ];

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col border-r border-gray-200 shadow-lg">
            {/* Header da sidebar */}
            <div className="p-6 border-b border-gray-200 mt-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Cresci e Perdi
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Sistema de Treinamentos
                  </p>
                </div>
              </div>
            </div>

            {/* Menu de navegação */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors w-full ${
                      isActive 
                        ? "bg-primary text-white font-medium" 
                        : "text-foreground hover:bg-secondary hover:text-primary"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer da sidebar */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selectedProfile || (isAdmin ? 'Admin' : 'Aluno')}
            </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email ?? ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-64 bg-white sticky top-0 self-start flex-shrink-0 h-[100dvh] flex flex-col border-r border-gray-200 shadow-sm">
      {/* Header da sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Cresci e Perdi
            </h1>
            <p className="text-xs text-muted-foreground">
              Sistema de Treinamentos
            </p>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full ${
                isActive 
                  ? "bg-primary text-white font-medium" 
                  : "text-foreground hover:bg-secondary hover:text-primary"
              }`}
            >
              <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {selectedProfile || (isAdmin ? 'Admin' : 'Aluno')}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
