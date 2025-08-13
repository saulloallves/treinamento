
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
  FileQuestion
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

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
      ];

  return (
    <div className="w-64 bg-white h-screen flex flex-col border-r border-gray-200 shadow-sm">
      {/* Header da sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#007BFF] flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000]">
              Cresci e Perdi
            </h1>
            <p className="text-xs text-[#333333]">
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
                  ? "bg-[#007BFF] text-white font-medium" 
                  : "text-[#333333] hover:bg-[#E6F0FF] hover:text-[#007BFF]"
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
        <div className="flex items-center gap-3 p-3 rounded-md bg-[#E6F0FF] hover:bg-[#E6F0FF]/80 transition-colors duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#007BFF] flex items-center justify-center">
            <span className="text-sm font-medium text-white">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#000000]">{isAdmin ? 'Admin' : 'Aluno'}</p>
            <p className="text-xs text-[#333333]">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
