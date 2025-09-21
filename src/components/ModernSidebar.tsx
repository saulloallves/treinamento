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
  Target,
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
import { Button } from "@/components/ui/button";
import { getSelectedProfile } from "@/lib/profile";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ModernSidebarProps {
  showInMobile?: boolean;
}

const ModernSidebar = ({ showInMobile = true }: ModernSidebarProps) => {
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
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-100/50 ${
          isActive 
            ? "bg-blue-50 text-blue-700 shadow-sm" 
            : "text-slate-700 hover:text-slate-900"
        } ${isSubItem ? 'ml-7 pl-4' : ''}`}
      >
        {/* Active indicator bar */}
        {isActive && !isSubItem && (
          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
        )}
        
        <div className={`shrink-0 ${isSubItem ? 'w-4 h-4' : 'w-5 h-5'}`}>
          <Icon className={`${isSubItem ? 'w-4 h-4' : 'w-5 h-5'} transition-colors`} />
        </div>
        <span className="font-medium truncate">{item.name || item.label}</span>
      </Link>
    );
  }, [location.pathname, isMobile]);

  const renderGroupButton = useCallback((item: any) => {
    const isExpanded = expandedGroups[item.id];
    const hasActiveChild = isGroupActive(item);
    
    return (
      <button
        type="button"
        onClick={() => toggleGroup(item.id)}
        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-slate-100/50 focus:outline-none ${
          hasActiveChild
            ? 'bg-slate-100/50 text-slate-900'
            : 'text-slate-700 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 shrink-0">
            <item.icon className="w-5 h-5 transition-colors" />
          </div>
          <span className="font-medium truncate">{item.name}</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`} 
        />
      </button>
    );
  }, [expandedGroups, isGroupActive, toggleGroup]);

  const renderMenu = useCallback((menuStructure: any[]) => {
    return menuStructure.map((item) => {
      if (!item.isGroup) {
        return renderMenuItem(item);
      }

      const isExpanded = expandedGroups[item.id];
      
      return (
        <div key={item.id} className="space-y-1">
          {renderGroupButton(item)}
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded 
                ? 'max-h-96 opacity-100 animate-accordion-down' 
                : 'max-h-0 opacity-0 animate-accordion-up'
            }`}
          >
            <div className="space-y-0.5 pt-1">
              {item.items?.map((subItem: any) => renderMenuItem(subItem, true))}
            </div>
          </div>
        </div>
      );
    });
  }, [expandedGroups, renderMenuItem, renderGroupButton]);

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
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-100/50 ${
            isActive 
              ? "bg-blue-50 text-blue-700 shadow-sm" 
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          {/* Active indicator bar */}
          {isActive && (
            <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
          )}
          
          <div className="w-5 h-5 shrink-0">
            <Icon className="w-5 h-5 transition-colors" />
          </div>
          <span className="font-medium truncate">{item.label}</span>
        </Link>
      );
    });
  }, [studentMenuItems, location.pathname, isMobile]);

  if (isMobile && !showInMobile) {
    return null;
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col border-r border-slate-200/60 shadow-xl">
            {/* Header da sidebar */}
            <div className="p-6 border-b border-slate-200/60 mt-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Cresci e Perdi
                  </h1>
                  <p className="text-xs text-slate-500">
                    Sistema de Treinamentos
                  </p>
                </div>
              </div>
            </div>

            {/* Menu de navegação */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-scroll" style={{ scrollbarGutter: 'stable' }}>
              {shouldShowAdminMenu 
                ? renderMenu(adminMenuStructure) 
                : shouldShowProfessorMenu 
                ? renderMenu(professorMenuStructure) 
                : renderStudentMenu()}
            </nav>

            {/* Footer da sidebar */}
            <div className="p-4 border-t border-slate-200/60">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
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
    <div className="w-64 bg-white fixed top-0 left-0 z-40 flex-shrink-0 h-screen flex flex-col border-r border-slate-200/60 shadow-sm">
      {/* Header da sidebar */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Cresci e Perdi
            </h1>
            <p className="text-xs text-slate-500">
              Sistema de Treinamentos
            </p>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-scroll" style={{ scrollbarGutter: 'stable' }}>
        {shouldShowAdminMenu 
          ? renderMenu(adminMenuStructure) 
          : shouldShowProfessorMenu 
          ? renderMenu(professorMenuStructure) 
          : renderStudentMenu()}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-4 border-t border-slate-200/60">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;