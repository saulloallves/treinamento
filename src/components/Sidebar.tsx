
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
    <div className="w-72 bg-sidebar border-r-4 border-primary/30 h-screen flex flex-col relative overflow-hidden">
      {/* Formas decorativas de fundo */}
      <div className="absolute -top-16 -right-16 w-40 h-40 organic-shape-3 animate-float">
        <div className="w-full h-full gradient-soft opacity-20"></div>
      </div>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 organic-shape-2">
        <div className="w-full h-full gradient-accent opacity-10"></div>
      </div>

      <div className="relative p-8 border-b-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-large animate-bounce-playful relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary"></div>
            <GraduationCap className="w-10 h-10 text-primary-foreground relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-brown mb-1">
              <span className="gradient-primary bg-clip-text text-transparent">
                Cresci & Perdi
              </span>
            </h1>
            <p className="text-sm text-brand-brown-light font-bold">
              Plataforma de Treinamentos
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-3 relative z-10">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={item.active ? "sidebar-item-active w-full" : "sidebar-item w-full group"}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                item.active 
                  ? 'bg-white/30 shadow-medium' 
                  : 'bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/40 group-hover:to-secondary/40 group-hover:scale-110'
              }`}>
                <Icon className="w-6 h-6 relative z-10" />
                {!item.active && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </div>
              <span className="font-bold text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t-2 border-primary/20 relative z-10">
        <div className="flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-medium relative overflow-hidden">
          <div className="absolute inset-0 gradient-soft opacity-20"></div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-medium relative z-10">
            <div className="absolute inset-0 gradient-accent rounded-full"></div>
            <span className="text-lg font-black text-accent-foreground relative z-10">A</span>
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-base font-black text-brand-brown">Admin</p>
            <p className="text-sm text-brand-brown-light font-bold">Gestor da Rede</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
