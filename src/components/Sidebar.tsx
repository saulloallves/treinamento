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
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { getSelectedProfile } from "@/lib/profile";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const userInteracting = useRef(false);
  
  // Initialize expanded groups based on current route
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const path = location.pathname;
    return {
      treinamentos: ['/courses','/turmas','/lessons','/professor/cursos','/professor/turmas','/professor/aulas'].includes(path),
      gestaoAlunos: ['/enrollments','/attendance','/progress','/certificates','/professor/inscricoes','/professor/presenca','/professor/progresso'].includes(path),
      avaliacoes: ['/quiz','/professor/avaliacoes'].includes(path),
      comunicacao: ['/whatsapp','/professor/comunicacao','/communication','/professor/disparos-automaticos'].includes(path),
      administracao: ['/users','/professors','/admins','/units','/settings'].includes(path),
    };
  });

  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const { data: isProfessor = false } = useIsProfessor(user?.id);
  const { data: currentUser } = useCurrentUser();
  const selectedProfile = useMemo(() => getSelectedProfile(), []);
  
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
  
  // Menu para alunos (inclui gestão de colaboradores para franqueados)
  const studentMenuItems = useMemo(() => {
    const baseItems = [
      { icon: GraduationCap, label: "Cursos", path: "/aluno" },
      { icon: BookOpen, label: "Aulas", path: "/aluno/aulas" },
      { icon: FileQuestion, label: "Quiz", path: "/aluno/quiz" },
    ];

    // Adicionar gestão de colaboradores se for franqueado
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
      ]
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      icon: MessageSquare,
      isGroup: true,
      items: [
        { name: 'WhatsApp', path: '/professor/comunicacao', icon: MessageSquare },
        { name: 'Disparos Automáticos', path: '/professor/disparos-automaticos', icon: Settings },
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
      ]
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      icon: MessageSquare,
      isGroup: true,
      items: [
        { name: 'Disparos WhatsApp', path: '/whatsapp', icon: MessageSquare },
        { name: 'Disparos Automáticos', path: '/communication', icon: Settings },
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
    // Set the group as active when clicked
    setActiveGroup(groupId);
    // Reset interaction flag after a short delay
    setTimeout(() => {
      userInteracting.current = false;
    }, 100);
  }, []);

  const isGroupActive = useCallback((group: any) => {
    // If there's an active group set by user click, use that
    if (activeGroup === group.id) {
      return true;
    }
    // Only check URL-based activation if no group was manually clicked
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
          // Reset active group when navigating to a new page
          setActiveGroup(null);
        }}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 w-full font-medium ${
          isActive 
            ? "bg-primary text-white" 
            : "text-foreground hover:bg-secondary hover:text-primary"
        } ${isSubItem ? 'ml-6' : ''}`}
      >
        <div className="w-8 h-8 rounded-sm flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm">{item.name || item.label}</span>
      </Link>
    );
  }, [location.pathname, isMobile]);

  const renderAdminMenu = useCallback(() => {
    return adminMenuStructure.map((item) => {
      if (!item.isGroup) {
        return renderMenuItem(item);
      }

      const isExpanded = expandedGroups[item.id];
      const hasActiveChild = isGroupActive(item);
      
      return (
        <div key={item.id} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleGroup(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none ${
              activeGroup === item.id
                ? 'bg-secondary text-primary'
                : 'text-foreground hover:bg-secondary hover:text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              {item.name}
            </div>
            <div className="will-change-transform">
              <ChevronRight className={`h-4 w-4 transition-transform duration-150 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
            </div>
          </button>
          
          {item.items && (
            <div className={`space-y-1 ${isExpanded ? 'block' : 'hidden'}`}>
              {item.items.map((subItem: any) => renderMenuItem(subItem, true))}
            </div>
          )}
        </div>
      );
    });
  }, [expandedGroups, isGroupActive, toggleGroup, renderMenuItem]);

  const renderProfessorMenu = useCallback(() => {
    return professorMenuStructure.map((item) => {
      if (!item.isGroup) {
        return renderMenuItem(item);
      }

      const isExpanded = expandedGroups[item.id];
      const hasActiveChild = isGroupActive(item);
      
      return (
        <div key={item.id} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleGroup(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none ${
              activeGroup === item.id
                ? 'bg-secondary text-primary'
                : 'text-foreground hover:bg-secondary hover:text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              {item.name}
            </div>
            <div className="will-change-transform">
              <ChevronRight className={`h-4 w-4 transition-transform duration-150 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
            </div>
          </button>
          
          {item.items && (
            <div className={`space-y-1 ${isExpanded ? 'block' : 'hidden'}`}>
              {item.items.map((subItem: any) => renderMenuItem(subItem, true))}
            </div>
          )}
        </div>
      );
    });
  }, [expandedGroups, isGroupActive, toggleGroup, renderMenuItem]);

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
            // Reset active group when navigating to a new page
            setActiveGroup(null);
          }}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 w-full font-medium ${
            isActive 
              ? "bg-primary text-white" 
              : "text-foreground hover:bg-secondary hover:text-primary"
          }`}
        >
          <div className="w-8 h-8 rounded-sm flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm">{item.label}</span>
        </Link>
      );
    });
  }, [studentMenuItems, location.pathname, isMobile]);

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
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
              {shouldShowAdminMenu ? renderAdminMenu() : shouldShowProfessorMenu ? renderProfessorMenu() : renderStudentMenu()}
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
              {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        {shouldShowAdminMenu ? renderAdminMenu() : shouldShowProfessorMenu ? renderProfessorMenu() : renderStudentMenu()}
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
              {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
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