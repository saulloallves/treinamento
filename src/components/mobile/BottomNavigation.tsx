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
  Award
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  const isAdmin = useIsAdmin();
  const isProfessor = useIsProfessor();
  const { data: currentUser } = useCurrentUser();

  if (!isMobile) return null;

  const adminItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Cursos', href: '/courses', icon: BookOpen },
    { label: 'Usuários', href: '/users', icon: Users },
    { label: 'Unidades', href: '/units', icon: Building2 },
    { label: 'Mais', href: '/settings', icon: Settings }
  ];

  const professorItems: NavItem[] = [
    { label: 'Dashboard', href: '/professor/dashboard', icon: Home },
    { label: 'Turmas', href: '/turmas', icon: Users },
    { label: 'Aulas', href: '/lessons', icon: GraduationCap },
    { label: 'Quiz', href: '/quiz', icon: ClipboardCheck },
    { label: 'Mais', href: '/settings', icon: Settings }
  ];

  const studentItems: NavItem[] = [
    { label: 'Portal', href: '/student/portal', icon: Home },
    { label: 'Cursos', href: '/student/courses', icon: BookOpen },
    { label: 'Aulas', href: '/student/lessons', icon: GraduationCap },
    { label: 'Certificados', href: '/certificates', icon: Award },
    { label: 'Perfil', href: '/student/profile', icon: Users }
  ];

  // Determine which navigation to show based on user role and selected profile
  let navigationItems: NavItem[] = [];

  if (!isAdmin && !isProfessor) {
    // Student navigation
    navigationItems = studentItems;
  } else if (isProfessor && !isAdmin) {
    // Professor navigation
    navigationItems = professorItems;
  } else if (isAdmin) {
    // Admin navigation
    navigationItems = adminItems;
  }

  if (navigationItems.length === 0) return null;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/' || location.pathname === '/index';
    }
    if (href === '/professor/dashboard') {
      return location.pathname === href;
    }
    if (href === '/student/portal') {
      return location.pathname === href;
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