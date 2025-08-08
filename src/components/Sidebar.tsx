
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
    <div className="w-64 sidebar-modern h-screen flex flex-col relative">
      {/* Header da sidebar */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">
              EduManager
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Sistema de Treinamentos
            </p>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={item.active ? "sidebar-item-active w-full" : "sidebar-item w-full"}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                item.active 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-purple-100/50 group-hover:bg-purple-200/70 group-hover:scale-110'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-100/50 to-pink-100/50 hover:from-purple-200/70 hover:to-pink-200/70 transition-all duration-200 hover:scale-105 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Admin</p>
            <p className="text-xs text-gray-500">Gestor do Sistema</p>
          </div>
        </div>
      </div>

      {/* Elemento decorativo */}
      <div className="absolute top-1/2 right-0 w-1 h-16 bg-gradient-to-b from-purple-400 to-pink-400 rounded-l-full opacity-30"></div>
    </div>
  );
};

export default Sidebar;
