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
  X,
  Target,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  Video
} from "lucide-react";
import { RobotIcon } from "@/components/ui/robot-icon";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSelectedProfile } from "@/lib/profile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ProfileSwitcher from "@/components/ProfileSwitcher";

interface ModernSidebarProps {
  showInMobile?: boolean;
}

const ModernSidebar = ({ showInMobile = true }: ModernSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const userInteracting = useRef(false);
  
  // Initialize expanded groups based on current route
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const path = location.pathname;
    return {
      treinamentos: ['/courses','/turmas','/lessons','/streaming','/professor/cursos','/professor/turmas','/professor/aulas'].includes(path),
      gestaoAlunos: ['/enrollments','/attendance','/progress','/certificates','/professor/inscricoes','/professor/presenca','/professor/progresso'].includes(path),
      avaliacoes: ['/quiz','/tests','/reports','/professor/avaliacoes','/professor/reports'].includes(path),
      comunicacao: ['/whatsapp','/professor/comunicacao','/communication','/professor/disparos-automaticos'].includes(path),
      administracao: ['/users','/professors','/admins','/units','/settings'].includes(path),
    };
  });

  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const { data: isProfessor = false } = useIsProfessor(user?.id);
  const { data: currentUser } = useCurrentUser();
  const selectedProfile = useMemo(() => getSelectedProfile(), []);
  
  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);
  
  // Reset active group when navigating to a different route
  useEffect(() => {
    setActiveGroup(null);
  }, [location.pathname]);
  
  // Determinar qual menu mostrar baseado na preferência do usuário
  const shouldShowAdminMenu = useMemo(() => 
    selectedProfile === 'Admin' || (selectedProfile === null && isAdmin),
    [selectedProfile, isAdmin]
  );
  
  const shouldShowProfessorMenu = useMemo(() => 
    selectedProfile === 'Professor' || (selectedProfile === null && isProfessor && !isAdmin),
    [selectedProfile, isProfessor, isAdmin]
  );
  
  // Menu para alunos
  const studentMenuItems = useMemo(() => {
    const baseItems = [
      { icon: GraduationCap, label: "Cursos", path: "/aluno" },
      { icon: BookOpen, label: "Aulas", path: "/aluno/aulas" },
      { icon: FileQuestion, label: "Quiz", path: "/aluno/quiz" },
      { icon: ClipboardCheck, label: "Testes Avaliativos", path: "/aluno/testes" },
    ];

    if (currentUser?.role === 'Franqueado' && currentUser?.unit_code) {
      baseItems.push({
        icon: Users,
        label: "Gestão de Colaboradores",
        path: "/aluno/colaboradores"
      });
    }

    return baseItems;
  }, [currentUser?.role, currentUser?.unit_code]);

  // Menu para professores
  const professorMenuStructure = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/professor',
      icon: LayoutDashboard,
      isGroup: false
    },
    {
      id: 'treinamentos',
      name: 'Treinamentos',
      icon: BookOpen,
      isGroup: true,
      items: [
        { name: 'Cursos', path: '/professor/cursos', icon: GraduationCap },
        { name: 'Turmas', path: '/professor/turmas', icon: Calendar },
        { name: 'Aulas', path: '/professor/aulas', icon: BookOpen },
        { name: 'Streaming', path: '/streaming', icon: Video },
      ]
    },
    {
      id: 'gestaoAlunos',
      name: 'Gestão de Alunos',
      icon: Users,
      isGroup: true,
      items: [
        { name: 'Inscrições', path: '/professor/inscricoes', icon: UserCheck },
        { name: 'Presença', path: '/professor/presenca', icon: ClipboardList },
        { name: 'Progresso', path: '/professor/progresso', icon: TrendingUp },
      ]
    },
    {
      id: 'avaliacoes',
      name: 'Avaliações',
      icon: FileQuestion,
      isGroup: true,
      items: [
        { name: 'Quiz', path: '/professor/avaliacoes', icon: HelpCircle },
        { name: 'Testes Avaliativos', path: '/professor/tests', icon: Target },
        { name: 'Relatórios', path: '/professor/reports', icon: BarChart3 },
      ]
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      icon: MessageSquare,
      isGroup: true,
      items: [
        { name: 'WhatsApp', path: '/professor/comunicacao', icon: MessageSquare },
        { name: 'Disparos Automáticos', path: '/professor/disparos-automaticos', icon: RobotIcon },
      ]
    }
  ];

  const adminMenuStructure = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      isGroup: false
    },
    {
      id: 'treinamentos',
      name: 'Treinamentos',
      icon: BookOpen,
      isGroup: true,
      items: [
        { name: 'Cursos', path: '/courses', icon: GraduationCap },
        { name: 'Turmas', path: '/turmas', icon: Calendar },
        { name: 'Aulas', path: '/lessons', icon: BookOpen },
        { name: 'Streaming', path: '/streaming', icon: Video },
      ]
    },
    {
      id: 'gestaoAlunos',
      name: 'Gestão de Alunos',
      icon: Users,
      isGroup: true,
      items: [
        { name: 'Inscrições', path: '/enrollments', icon: ClipboardList },
        { name: 'Presenças', path: '/attendance', icon: UserCheck },
        { name: 'Progresso', path: '/progress', icon: TrendingUp },
        { name: 'Certificados', path: '/certificates', icon: Award },
      ]
    },
    {
      id: 'avaliacoes',
      name: 'Avaliações',
      icon: FileQuestion,
      isGroup: true,
      items: [
        { name: 'Quiz', path: '/quiz', icon: FileQuestion },
        { name: 'Testes Avaliativos', path: '/tests', icon: Target },
        { name: 'Relatórios', path: '/reports', icon: BarChart3 },
      ]
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      icon: MessageSquare,
      isGroup: true,
      items: [
        { name: 'Disparos WhatsApp', path: '/whatsapp', icon: MessageSquare },
        { name: 'Disparos Automáticos', path: '/communication', icon: RobotIcon },
      ]
    },
    {
      id: 'administracao',
      name: 'Administração',
      icon: Settings,
      isGroup: true,
      items: [
        { name: 'Alunos', path: '/users', icon: Users },
        { name: 'Professores', path: '/professors', icon: User },
        { name: 'Administradores', path: '/admins', icon: LayoutDashboard },
        { name: 'Unidades', path: '/units', icon: Building2 },
        { name: 'Configurações', path: '/settings', icon: Settings },
      ]
    }
  ];

  const toggleGroup = useCallback((groupId: string) => {
    userInteracting.current = true;
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
    setActiveGroup(groupId);
    setTimeout(() => {
      userInteracting.current = false;
    }, 100);
  }, []);

  const isGroupActive = useCallback((group: any) => {
    if (activeGroup === group.id) {
      return true;
    }
    if (activeGroup === null) {
      return group.items?.some((item: any) => location.pathname === item.path);
    }
    return false;
  }, [location.pathname, activeGroup]);

  const renderMenuItem = useCallback((item: any, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => {
          if (isMobile) setIsOpen(false);
          setActiveGroup(null);
        }}
        className={`sidebar-menu-item group ${isSubItem ? 'ml-3' : ''}`}
      >
        <div className={`sidebar-icon-circular ${
          isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        {isOpen && (
          <div className={`sidebar-text-pill transition-all duration-300 ${
            isActive ? 'text-primary font-semibold' : 'text-foreground group-hover:text-primary'
          }`}>
            <span className="text-sm">
              {item.name || item.label}
            </span>
          </div>
        )}
      </Link>
    );
  }, [location.pathname, isMobile, isOpen]);

  const renderMenuGroup = useCallback((menuStructure: any[]) => {
    return menuStructure.map((item) => {
      if (!item.isGroup) {
        return renderMenuItem(item);
      }

      const isExpanded = expandedGroups[item.id];
      
      return (
        <div key={item.id} className="space-y-3">
          <button
            type="button"
            onClick={() => toggleGroup(item.id)}
            className="w-full flex items-center justify-between sidebar-menu-item group focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className={`sidebar-icon-circular ${
                activeGroup === item.id ? 'sidebar-icon-active' : 'sidebar-icon-inactive'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              {isOpen && (
                <div className={`sidebar-text-pill transition-all duration-300 ${
                  activeGroup === item.id ? 'text-primary font-semibold' : 'text-foreground group-hover:text-primary'
                }`}>
                  <span className="text-sm">
                    {item.name}
                  </span>
                </div>
              )}
            </div>
            {isOpen && (
              <div className={`sidebar-icon-circular w-8 h-8 ${
                isExpanded ? 'sidebar-icon-active' : 'sidebar-icon-inactive'
              }`}>
                <ChevronRight className={`h-4 w-4 transition-all duration-300 ${
                  isExpanded ? 'rotate-90' : 'rotate-0'
                }`} />
              </div>
            )}
          </button>
          
          {item.items && isExpanded && isOpen && (
            <div className="sidebar-menu-expanded space-y-2 p-3 ml-6 animate-fade-in">
              {item.items.map((subItem: any) => renderMenuItem(subItem, true))}
            </div>
          )}
        </div>
      );
    });
  }, [expandedGroups, activeGroup, toggleGroup, renderMenuItem, isOpen]);

  const renderStudentMenu = useCallback(() => {
    return studentMenuItems.map((item, index) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      
      return (
        <Link
          key={index}
          to={item.path}
          onClick={() => {
            if (isMobile) setIsOpen(false);
            setActiveGroup(null);
          }}
          className="sidebar-menu-item group"
        >
          <div className={`sidebar-icon-circular ${
            isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          {isOpen && (
            <div className={`sidebar-text-pill transition-all duration-300 ${
              isActive ? 'text-primary font-semibold' : 'text-foreground group-hover:text-primary'
            }`}>
              <span className="text-sm">
                {item.label}
              </span>
            </div>
          )}
        </Link>
      );
    });
  }, [studentMenuItems, location.pathname, isMobile, isOpen]);

  if (isMobile && !showInMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          glass-sidebar fixed left-2 top-2 bottom-2 z-50 flex flex-col transition-all duration-500 ease-out rounded-3xl
          ${isOpen ? 'w-80' : 'w-20'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Toggle Button */}
        <div className="absolute -right-4 top-6 z-10">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="sidebar-icon-circular sidebar-icon-active shadow-lg"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="sidebar-icon-circular sidebar-icon-active">
              <GraduationCap className="w-6 h-6" />
            </div>
            {isOpen && (
              <div className="sidebar-text-pill">
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Sistema de Treinamento
                  </h2>
                  <p className="text-xs text-foreground/70 mt-1">
                    Cresci e Perdi
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {shouldShowAdminMenu && renderMenuGroup(adminMenuStructure)}
          {shouldShowProfessorMenu && renderMenuGroup(professorMenuStructure)}
          {!shouldShowAdminMenu && !shouldShowProfessorMenu && renderStudentMenu()}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="sidebar-icon-circular sidebar-icon-inactive">
              <span className="text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {isOpen && (
              <div className="sidebar-text-pill flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
                    </p>
                    <p className="text-xs text-foreground/70 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {user && <ProfileSwitcher />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-60 sidebar-icon-circular sidebar-icon-active shadow-lg md:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
    </>
  );
};

export default ModernSidebar;