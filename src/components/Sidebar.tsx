
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
      <div className="p-6 border-b border-brand-yellow/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-7 h-7 text-brand-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">
              EduManager
            </h1>
            <p className="text-xs text-brand-brown/60 font-medium">
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
                  ? 'bg-brand-white/20 shadow-lg' 
                  : 'bg-brand-yellow/10 hover:bg-brand-yellow/20 hover:scale-110'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-4 border-t border-brand-yellow/20">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-brand-yellow/10 to-brand-blue/10 hover:from-brand-yellow/20 hover:to-brand-blue/20 transition-all duration-200 hover:scale-105 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-brand-white">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-brown">Admin</p>
            <p className="text-xs text-brand-brown/60">Gestor do Sistema</p>
          </div>
        </div>
      </div>

      {/* Elemento decorativo */}
      <div className="absolute top-1/2 right-0 w-1 h-16 bg-gradient-to-b from-brand-yellow to-brand-orange rounded-l-full opacity-40"></div>
    </div>
  );
};

export default Sidebar;
