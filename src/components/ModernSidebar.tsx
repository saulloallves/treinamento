/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Video,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { RobotIcon } from "@/components/ui/robot-icon";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsProfessor } from "@/hooks/useIsProfessor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DocumentationDialog from "@/components/DocumentationDialog";
import cabecaImage from '@/assets/cabeca.png';

interface ModernSidebarProps {
  showInMobile?: boolean;
}

const ModernSidebar = ({ showInMobile = true }: ModernSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { selectedProfile } = useProfile();
  const isMobile = useIsMobile();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isTogglingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  
  // Simplified state management - use only sessionStorage, no route-based initialization
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    
    const saved = sessionStorage.getItem('sidebar-expanded-groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    
    // Start with empty state - user manually expands what they need
    return {};
  });

  const { data: isAdmin = false } = useIsAdmin(user?.id);
  const { data: isProfessor = false } = useIsProfessor(user?.id);  
  const { data: currentUser } = useCurrentUser();
  
  // Toggle sidebar collapsed state
  const toggleCollapsed = useCallback(() => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    localStorage.setItem('sidebar-collapsed', newCollapsedState.toString());
    
    // Close all submenus when collapsing
    if (newCollapsedState) {
      setExpandedGroups({});
      sessionStorage.setItem('sidebar-expanded-groups', JSON.stringify({}));
    }
  }, [isCollapsed]);
  
  // Click outside to close when expanded (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && !isCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsCollapsed(true);
        localStorage.setItem('sidebar-collapsed', 'true');
        // Close all submenus when collapsing via click outside
        setExpandedGroups({});
        sessionStorage.setItem('sidebar-expanded-groups', JSON.stringify({}));
      }
    };

    if (!isMobile && !isCollapsed) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCollapsed, isMobile]);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Determinar qual menu mostrar baseado na preferência do usuário
  const shouldShowAdminMenu = useMemo(() => {
    // Se escolheu "Admin" e é admin, mostrar
    if (selectedProfile === 'Admin' && isAdmin) {
      console.log('🔍 ModernSidebar - User chose Admin, showing admin menu');
      return true;
    }
    
    // Se não há preferência e é admin (e não professor), usar lógica padrão
    if (!selectedProfile && isAdmin && !isProfessor) {
      console.log('🔍 ModernSidebar - No preference, defaulting to admin menu');
      return true;
    }
    
    console.log('🔍 ModernSidebar - Not showing admin menu');
    return false;
  }, [isAdmin, isProfessor, selectedProfile]);
  
  const shouldShowProfessorMenu = useMemo(() => {
    // Se escolheu "Professor" e é professor, mostrar
    if (selectedProfile === 'Professor' && isProfessor) {
      console.log('🔍 ModernSidebar - User chose Professor, showing professor menu');
      return true;
    }
    
    // Se não há preferência e é professor (e não admin), usar lógica padrão
    if (!selectedProfile && isProfessor && !isAdmin) {
      console.log('🔍 ModernSidebar - No preference, defaulting to professor menu');
      return true;
    }
    
    console.log('🔍 ModernSidebar - Not showing professor menu');
    return false;
  }, [isProfessor, isAdmin, selectedProfile]);

  // Para alunos ou qualquer usuário que não seja admin/professor
  const shouldShowStudentMenu = useMemo(() => {
    // Se escolheu explicitamente "Aluno"
    if (selectedProfile === 'Aluno') {
      console.log('🔍 ModernSidebar - User chose Aluno, showing student menu');
      return true;
    }
    
    // Se não há preferência e não é admin nem professor
    if (!selectedProfile && !isAdmin && !isProfessor) {
      console.log('🔍 ModernSidebar - No preference and not admin/professor, showing student menu');
      return true;
    }
    
    // Se não está mostrando nem admin nem professor, mostrar aluno como fallback
    if (!shouldShowAdminMenu && !shouldShowProfessorMenu) {
      console.log('🔍 ModernSidebar - Fallback to student menu');
      return true;
    }
    
    return false;
  }, [selectedProfile, isAdmin, isProfessor, shouldShowAdminMenu, shouldShowProfessorMenu]);
  
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

  // Enhanced toggle function for collapsed menu - auto-expands when clicking groups
  const toggleGroup = useCallback((groupId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling and default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Protection against rapid double-clicks and StrictMode
    if (isTogglingRef.current || !mountedRef.current) {
      return;
    }
    
    isTogglingRef.current = true;
    
    // If sidebar is collapsed, expand it first and then open the group
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('sidebar-collapsed', 'false');
    }
    
    // Use requestAnimationFrame to ensure state update happens on next frame
    requestAnimationFrame(() => {
      setExpandedGroups(prev => {
        const newState = {
          ...prev,
          [groupId]: !prev[groupId]
        };
        
        // Persist to sessionStorage with error handling
        try {
          sessionStorage.setItem('sidebar-expanded-groups', JSON.stringify(newState));
        } catch (error) {
          console.warn('Failed to save sidebar state:', error);
        }
        
        return newState;
      });
      
      // Reset toggle protection after a short delay
      setTimeout(() => {
        if (mountedRef.current) {
          isTogglingRef.current = false;
        }
      }, 100);
    });
  }, [isCollapsed]);

  // Simple check without useCallback to avoid re-renders
  const isGroupActive = (group: any) => {
    return group.items?.some((item: any) => location.pathname === item.path);
  };

  const renderMenuItem = (item: any, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    const menuItem = (
      <Link
        to={item.path}
        onClick={(e) => {
          // Prevent navigation if already on this route
          if (isActive) {
            e.preventDefault();
            return;
          }
          if (isMobile) setIsOpen(false);
        }}
        className={`group relative flex items-center rounded-lg text-sm hover:bg-muted ${
          isActive 
            ? "bg-primary/10 text-primary-foreground shadow-sm" 
            : "text-foreground hover:text-foreground"
        } ${isSubItem ? 'ml-7 pl-4 gap-3 px-3 py-2' : ''} ${
          isCollapsed && !isMobile && !isSubItem 
            ? 'w-12 h-12 justify-center mx-auto' 
            : isSubItem 
              ? '' 
              : 'gap-3 px-3 py-2'
        }`}
      >
        {/* Active indicator bar - hidden when collapsed */}
        {isActive && !isSubItem && !isCollapsed && (
          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        
        <div className={`${isSubItem ? 'w-4 h-4' : 'w-5 h-5'} flex items-center justify-center shrink-0`}>
          <Icon className={`${isSubItem ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
        {(!isCollapsed || isMobile) && (
          <span className="font-medium truncate">{item.name || item.label}</span>
        )}
      </Link>
    );

    // Wrap with tooltip if collapsed and not mobile
    if (isCollapsed && !isMobile && !isSubItem) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {menuItem}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.name || item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return menuItem;
  };

  const renderGroupButton = (item: any) => {
    const isExpanded = expandedGroups[item.id];
    const hasActiveChild = isGroupActive(item);
    
    const groupButton = (
      <button
        type="button"
        onClick={(event) => toggleGroup(item.id, event)}
        onMouseDown={(e) => e.preventDefault()} // Prevent focus issues
        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted focus:outline-none select-none ${
          hasActiveChild
            ? 'bg-muted/50 text-foreground'
            : 'text-foreground hover:text-foreground'
        } ${isCollapsed && !isMobile ? 'justify-center px-2 mx-1' : ''}`}
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <div className={`w-5 h-5 shrink-0 ${isCollapsed && !isMobile ? 'mx-auto' : ''}`}>
            <item.icon className="w-5 h-5 transition-colors" />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="font-medium truncate">{item.name}</span>
          )}
        </div>
        {(!isCollapsed || isMobile) && (
          <ChevronDown 
            className={`h-4 w-4 shrink-0 transition-transform duration-200 pointer-events-none ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`} 
          />
        )}
      </button>
    );

    // Wrap with tooltip if collapsed and not mobile
    if (isCollapsed && !isMobile) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            {groupButton}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return groupButton;
  };

  const renderMenu = (menuStructure: any[]) => {
    return menuStructure.map((item) => {
      if (!item.isGroup) {
        return (
          <div key={item.path}>
            {renderMenuItem(item)}
          </div>
        );
      }

      const isExpanded = expandedGroups[item.id];
      
      return (
        <div key={item.id} className="space-y-1">
          {renderGroupButton(item)}
          
          {/* Hide submenu when collapsed */}
          {(!isCollapsed || isMobile) && (
            <div 
              className={`overflow-hidden transition-all duration-200 ease-out ${
                isExpanded 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
              style={{
                transitionProperty: 'max-height, opacity',
                willChange: isExpanded !== expandedGroups[item.id] ? 'max-height, opacity' : 'auto'
              }}
            >
              <div className="space-y-0.5 pt-1">
                {item.items?.map((subItem: any) => (
                  <div key={`${item.id}-${subItem.path}`}>
                    {renderMenuItem(subItem, true)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const renderStudentMenu = () => {
    return studentMenuItems.map((item, index) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      
      return (
        <div key={item.path}>
          <Link
            to={item.path}
            onClick={() => {
              if (isMobile) setIsOpen(false);
            }}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted ${
              isActive 
                ? "bg-primary/10 text-primary-foreground shadow-sm" 
                : "text-foreground hover:text-foreground"
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            
            <div className="w-5 h-5 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium truncate">{item.label}</span>
          </Link>
        </div>
      );
    });
  };

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
          <div className="h-full flex flex-col border-r border-border shadow-xl">
            {/* Header da sidebar */}
            <div className="p-6 border-b border-border mt-16">
              <div className="flex items-center gap-2">
                <img 
                  src={cabecaImage}
                  alt="Mascote Cresci e Perdi" 
                  className="h-8 w-auto object-contain"
                />
                <div>
                  <h1 className="text-base font-semibold text-foreground">
                    Cresci e Perdi
                  </h1>
                  <p className="text-xs text-muted-foreground">
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

              {/* Botão de documentação na sidebar mobile */}
              <div className="pt-2 mt-2 border-t border-border">
                <DocumentationDialog variant="sidebar" />
              </div>
            </nav>

            {/* Footer da sidebar */}
            <div className="p-4 border-t border-border">
              <div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {user?.email ?? ''}
                    </p>
                  </div>
                )}
              </div>
             </div>
           </div>
         </div>
       </>
     );
   }

  return (
    <TooltipProvider>
      <div 
        ref={sidebarRef}
        className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/95 backdrop-blur-sm fixed top-0 left-0 z-30 flex-shrink-0 h-screen flex flex-col border-r border-border shadow-sm`}
      >
        {/* Header da sidebar */}
        <div className={`${isCollapsed ? 'p-2' : 'p-6'} border-b border-border`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center gap-2 ${isCollapsed ? '' : 'flex-1'}`}>
              <img 
                src={cabecaImage}
                alt="Mascote Cresci e Perdi" 
                className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-9' : 'h-8'}`}
              />
              {!isCollapsed && (
                <div className="flex-1">
                  <h1 className="text-base font-semibold text-foreground">
                    Cresci e Perdi
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Sistema de Treinamentos
                  </p>
                </div>
              )}
            </div>
            
            {/* Toggle button integrated in header */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className={`h-8 w-8 hover:bg-muted transition-colors flex-shrink-0 ${
                isCollapsed ? 'absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md border border-border rounded-full' : ''
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu de navegação */}
        <nav className={`flex-1 space-y-2 overflow-y-auto sidebar-scroll ${isCollapsed ? 'p-2' : 'p-4'}`} style={{ scrollbarGutter: 'stable' }}>
          {shouldShowAdminMenu 
            ? renderMenu(adminMenuStructure) 
            : shouldShowProfessorMenu 
            ? renderMenu(professorMenuStructure) 
            : renderStudentMenu()}
        </nav>

        {/* Footer da sidebar */}
        <div className={`border-t border-border transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center transition-all duration-300 rounded-lg bg-muted/50 hover:bg-muted ${
            isCollapsed ? 'justify-center p-1 gap-0' : 'p-3 gap-3'
          }`}>
            <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-foreground truncate">
                   {selectedProfile || (isAdmin ? 'Admin' : isProfessor ? 'Professor' : 'Aluno')}
                 </p>
                <p className="text-xs text-muted-foreground break-all">
                  {user?.email ?? ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ModernSidebar;