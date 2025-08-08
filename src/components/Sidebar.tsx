
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
    <div className="w-64 bg-sidebar border-r border-border h-screen flex flex-col relative overflow-hidden">
      {/* Formas decorativas de fundo mais sutis */}
      <div className="absolute -top-12 -right-12 w-32 h-32 organic-shape-3 animate-float-gentle">
        <div className="w-full h-full gradient-soft opacity-10"></div>
      </div>
      <div className="absolute -bottom-12 -left-12 w-36 h-36 organic-shape-2">
        <div className="w-full h-full gradient-accent opacity-5"></div>
      </div>

      <div className="relative p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[20px] flex items-center justify-center shadow-medium animate-bounce-soft relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary"></div>
            <GraduationCap className="w-7 h-7 text-primary-foreground relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-gray-dark mb-1">
              <span className="text-primary">
                EduManager
              </span>
            </h1>
            <p className="text-xs text-brand-gray font-medium">
              Sistema de Treinamentos
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={item.active ? "sidebar-item-active w-full" : "sidebar-item w-full group"}
            >
              <div className={`w-8 h-8 rounded-[16px] flex items-center justify-center transition-all duration-200 relative overflow-hidden ${
                item.active 
                  ? 'bg-white/20 shadow-soft' 
                  : 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 group-hover:scale-110'
              }`}>
                <Icon className="w-5 h-5 relative z-10" />
                {!item.active && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border relative z-10">
        <div className="flex items-center gap-3 p-3 rounded-[20px] transition-all duration-200 hover:scale-105 hover:shadow-soft relative overflow-hidden">
          <div className="absolute inset-0 gradient-soft opacity-10"></div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-soft relative z-10">
            <div className="absolute inset-0 gradient-primary rounded-full"></div>
            <span className="text-sm font-bold text-primary-foreground relative z-10">A</span>
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-sm font-semibold text-brand-gray-dark">Admin</p>
            <p className="text-xs text-brand-gray font-medium">Gestor do Sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
