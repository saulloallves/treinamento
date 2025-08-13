
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award,
  Settings,
  UserCheck,
  TrendingUp,
  MessageSquare,
  ClipboardList,
  FileQuestion,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data: isAdmin = false } = useIsAdmin(user?.id);
  
  const menuItems = isAdmin
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
        { icon: Settings, label: "Configurações", path: "/settings" },
      ]
    : [
        { icon: GraduationCap, label: "Cursos", path: "/aluno" },
        { icon: BookOpen, label: "Aulas", path: "/aluno/aulas" },
        { icon: FileQuestion, label: "Quiz", path: "/aluno/quiz" },
      ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 mobile-only bg-background/80 backdrop-blur-sm border border-border"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 mobile-only"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static
        w-72 h-screen
        bg-sidebar border-r border-sidebar-border
        flex flex-col
        transition-transform duration-300 ease-in-out
        z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-sidebar-foreground">
                Cresci e Perdi
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Treinamentos
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'group-hover:bg-sidebar-accent'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-white/80 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors duration-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {isAdmin ? 'Administrador' : 'Aluno'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.user_metadata?.full_name || user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
