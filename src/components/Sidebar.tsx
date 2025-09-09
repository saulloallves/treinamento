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
  ChevronDown,
  ChevronRight
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
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const userInteracting = useRef(false);
  const { open, setOpen } = useSidebar();
  
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
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton 
          asChild 
          isActive={isActive}
          className={isSubItem ? 'ml-6 font-normal' : 'font-medium'}
        >
          <Link
            to={item.path}
            onClick={() => {
              if (isMobile && open) setOpen(false);
              // Reset active group when navigating to a new page
              setActiveGroup(null);
            }}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name || item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }, [location.pathname, isMobile, open, setOpen]);

  const renderAdminMenu = useCallback(() => {
    return adminMenuStructure.map((item) => {
      if (!item.isGroup) {
        return renderMenuItem(item);
      }

      const isExpanded = expandedGroups[item.id];
      
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleGroup(item.id)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={`w-full font-medium ${
                  activeGroup === item.id ? 'bg-secondary text-primary' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-150 data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem: any) => (
                  <SidebarMenuSubItem key={subItem.path}>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={location.pathname === subItem.path}
                    >
                      <Link
                        to={subItem.path}
                        onClick={() => {
                          if (isMobile && open) setOpen(false);
                          setActiveGroup(null);
                        }}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    });
  }, [expandedGroups, activeGroup, toggleGroup, renderMenuItem, location.pathname, isMobile, open, setOpen]);

  const renderProfessorMenu = useCallback(() => {
    return professorMenuStructure.map((item) => {
      if (!item.isGroup) {
        return renderMenuItem(item);
      }

      const isExpanded = expandedGroups[item.id];
      
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleGroup(item.id)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={`w-full font-medium ${
                  activeGroup === item.id ? 'bg-secondary text-primary' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-150 data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem: any) => (
                  <SidebarMenuSubItem key={subItem.path}>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={location.pathname === subItem.path}
                    >
                      <Link
                        to={subItem.path}
                        onClick={() => {
                          if (isMobile && open) setOpen(false);
                          setActiveGroup(null);
                        }}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    });
  }, [expandedGroups, activeGroup, toggleGroup, renderMenuItem, location.pathname, isMobile, open, setOpen]);

  const renderStudentMenu = useCallback(() => {
    return studentMenuItems.map((item, index) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      
      return (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton asChild isActive={isActive} className="font-medium">
            <Link
              to={item.path}
              onClick={() => {
                if (isMobile && open) setOpen(false);
                setActiveGroup(null);
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  }, [studentMenuItems, location.pathname, isMobile, open, setOpen]);

  return (
    <SidebarRoot 
      className={`${!isMobile ? 'w-64' : ''}`}
      side="left"
      variant="sidebar"
      collapsible={isMobile ? "offcanvas" : "none"}
    >
      {/* Header da sidebar */}
      <SidebarHeader className="p-6 border-b">
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
      </SidebarHeader>

      {/* Menu de navegação */}
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {shouldShowAdminMenu ? renderAdminMenu() : shouldShowProfessorMenu ? renderProfessorMenu() : renderStudentMenu()}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer da sidebar */}
      <SidebarFooter className="p-4 border-t">
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
      </SidebarFooter>
    </SidebarRoot>
  );
};

export default Sidebar;