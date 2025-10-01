import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3,
  Settings,
  GraduationCap,
  Building2,
  MessageSquare,
  ClipboardCheck,
  Award,
  UserCheck,
  FileText
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfile } from '@/contexts/ProfileContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  professorOnly?: boolean;
  studentOnly?: boolean;
}

const BottomNavigation = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { selectedProfile } = useProfile();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  // Debug log
  console.log('🔍 BottomNavigation - Profile selection:', {
    selectedProfile,
    userType: currentUser?.user_type,
    role: currentUser?.role,
    isLoadingUser,
    localStorage: typeof window !== 'undefined' ? localStorage.getItem('selected_profile') : null
  });

  if (!isMobile) return null;
  if (isLoadingUser) return null;

  const adminItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Cursos', href: '/courses', icon: BookOpen },
    { label: 'Usuários', href: '/users', icon: Users },
    { label: 'Unidades', href: '/units', icon: Building2 },
    { label: 'Turmas', href: '/turmas', icon: Users }
  ];

  const professorItems: NavItem[] = [
    { label: 'Dashboard', href: '/professor', icon: Home },
    { label: 'Turmas', href: '/professor/turmas', icon: Users },
    { label: 'Aulas', href: '/professor/aulas', icon: GraduationCap },
    { label: 'Quiz', href: '/professor/avaliacoes', icon: ClipboardCheck },
    { label: 'Alunos', href: '/professor/inscricoes', icon: Users }
  ];

  // Menu para aluno franqueado (Franqueado)
  const franchiseeStudentItems: NavItem[] = [
    { label: 'Portal', href: '/aluno', icon: Home },
    { label: 'Aulas', href: '/aluno/aulas', icon: GraduationCap },
    { label: 'Quiz', href: '/aluno/quiz', icon: ClipboardCheck },
    { label: 'Testes', href: '/aluno/testes', icon: FileText },
    { label: 'Colaboradores', href: '/aluno/colaboradores', icon: UserCheck }
  ];

  // Menu para aluno colaborador
  const collaboratorStudentItems: NavItem[] = [
    { label: 'Portal', href: '/aluno', icon: Home },
    { label: 'Cursos', href: '/aluno/cursos', icon: BookOpen },
    { label: 'Aulas', href: '/aluno/aulas', icon: GraduationCap },
    { label: 'Testes', href: '/aluno/testes', icon: FileText },
    { label: 'Perfil', href: '/aluno/perfil', icon: Users }
  ];

  // Menu para aluno regular
  const regularStudentItems: NavItem[] = [
    { label: 'Portal', href: '/aluno', icon: Home },
    { label: 'Cursos', href: '/aluno/cursos', icon: BookOpen },
    { label: 'Aulas', href: '/aluno/aulas', icon: GraduationCap },
    { label: 'Certificados', href: '/certificates', icon: Award },
    { label: 'Perfil', href: '/aluno/perfil', icon: Users }
  ];

  // Determine which navigation to show based on selected profile
  let navigationItems: NavItem[] = [];

  console.log('🔍 BottomNavigation - Determining menu for selectedProfile:', selectedProfile);

  if (selectedProfile === 'Admin') {
    console.log('✅ BottomNavigation - Showing Admin menu');
    navigationItems = adminItems;
  } else if (selectedProfile === 'Professor') {
    console.log('✅ BottomNavigation - Showing Professor menu');
    navigationItems = professorItems;
  } else {
    console.log('✅ BottomNavigation - Showing Student menu for profile:', selectedProfile);
    // Para perfil de Aluno ou quando não há perfil selecionado
    // Determinar o tipo baseado no user_type e role
    const isFranchisee = currentUser?.role === 'Franqueado';
    const isCollaborator = currentUser?.user_type === 'Colaborador';
    
    console.log('🔍 BottomNavigation - Student type check:', {
      isFranchisee,
      isCollaborator,
      userType: currentUser?.user_type,
      role: currentUser?.role
    });
    
    if (isFranchisee) {
      console.log('✅ BottomNavigation - Showing Franchisee menu');
      navigationItems = franchiseeStudentItems;
    } else if (isCollaborator) {
      console.log('✅ BottomNavigation - Showing Collaborator menu');
      navigationItems = collaboratorStudentItems;
    } else {
      console.log('✅ BottomNavigation - Showing Regular student menu');
      navigationItems = regularStudentItems;
    }
  }

  if (navigationItems.length === 0) return null;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/' || location.pathname === '/index';
    }
    if (href === '/professor') {
      return location.pathname === href || location.pathname === '/professor/dashboard';
    }
    if (href === '/aluno') {
      return location.pathname === href || location.pathname === '/aluno/portal';
    }
    if (href === '/aluno/colaboradores') {
      return location.pathname === href || location.pathname.startsWith('/aluno/colaboradores');
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`
                flex flex-col items-center justify-center px-3 py-2 min-w-[60px] rounded-lg
                transition-all duration-200 active:scale-95
                ${active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              <Icon className={`w-5 h-5 mb-1 ${active ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;