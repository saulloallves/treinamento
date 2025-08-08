
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Building2, 
  BookOpen, 
  Award,
  BarChart3,
  Settings 
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: GraduationCap, label: "Cursos", active: false },
    { icon: BookOpen, label: "Aulas", active: false },
    { icon: Users, label: "Usuários", active: false },
    { icon: Building2, label: "Unidades", active: false },
    { icon: Award, label: "Certificados", active: false },
    { icon: BarChart3, label: "Relatórios", active: false },
    { icon: Settings, label: "Configurações", active: false },
  ];

  return (
    <div className="w-64 sidebar-clean h-screen flex flex-col">
      {/* Header da sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-brand-blue flex items-center justify-center shadow-clean">
            <GraduationCap className="w-6 h-6 text-brand-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-black">
              EduManager
            </h1>
            <p className="text-xs text-brand-gray-dark">
              Sistema de Treinamentos
            </p>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={item.active ? "sidebar-item-active w-full" : "sidebar-item w-full"}
            >
              <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
            <span className="text-sm font-medium text-brand-white">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-brand-black">Admin</p>
            <p className="text-xs text-brand-gray-dark">Gestor do Sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
