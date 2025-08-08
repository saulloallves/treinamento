
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
    <div className="w-64 bg-sidebar border-r-4 border-secondary/30 h-screen flex flex-col relative overflow-hidden">
      {/* Formas decorativas de fundo */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-secondary/20 to-primary/20 organic-shape-3"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-accent/10 to-transparent organic-shape-2"></div>

      <div className="relative p-6 border-b-2 border-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-medium animate-bounce-playful">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black text-brand-brown bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cresci & Perdi
            </h1>
            <p className="text-sm text-brand-brown font-bold">
              Treinamentos
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
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                item.active 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-br from-secondary/20 to-primary/20 group-hover:from-secondary/40 group-hover:to-primary/40'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-secondary/20 relative z-10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-secondary/10 to-primary/10 hover:from-secondary/20 hover:to-primary/20 transition-all duration-300 hover:scale-105">
          <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center shadow-medium">
            <span className="text-sm font-black text-accent-foreground">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-brand-brown">Admin</p>
            <p className="text-xs text-brand-brown-light font-bold">Gestor da Rede</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
