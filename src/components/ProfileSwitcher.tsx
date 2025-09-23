import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, GraduationCap, Users, RefreshCw } from 'lucide-react';
import { getSelectedProfile, setSelectedProfile, SelectedProfile } from '@/lib/profile';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSwitcherProps {
  onProfileChange?: () => void;
}

const ProfileSwitcher = ({ onProfileChange }: ProfileSwitcherProps) => {
  const { user } = useAuth();
  const { data: isAdmin = false } = useIsAdmin(user?.id || undefined);
  const { data: isProfessor = false } = useIsProfessor(user?.id || undefined);
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<SelectedProfile | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const checkStudentProfile = async () => {
      if (!user?.id) return;
      
      const { data: studentData } = await supabase
        .from('users')
        .select('id, user_type, role')
        .eq('id', user.id)
        .maybeSingle();
        
      setHasStudentProfile(!!studentData);
    };
    
    if (user?.id) {
      checkStudentProfile();
    }
    
    setCurrentProfile(getSelectedProfile());
  }, [user?.id]);

  const availableProfiles = [
    isAdmin && { key: 'Admin' as const, label: 'Administrador', icon: Shield, color: 'purple' },
    isProfessor && { key: 'Professor' as const, label: 'Professor', icon: Users, color: 'green' },
    hasStudentProfile && { key: 'Aluno' as const, label: 'Aluno/Franqueado', icon: GraduationCap, color: 'blue' },
  ].filter(Boolean);

  const handleProfileChange = (profile: SelectedProfile) => {
    setIsChanging(true);
    setSelectedProfile(profile);
    setCurrentProfile(profile);
    
    // Redirect to appropriate area
    setTimeout(() => {
      if (profile === 'Admin') {
        window.location.href = '/dashboard';
      } else if (profile === 'Professor') {
        window.location.href = '/professor';
      } else {
        window.location.href = '/aluno';
      }
      onProfileChange?.();
    }, 500);
  };

  // Don't show if user has only one profile
  if (availableProfiles.length <= 1) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Trocar Perfil</h3>
          <p className="text-sm text-muted-foreground">
            Perfil atual: <span className="font-medium">{currentProfile}</span>
          </p>
        </div>

        <div className="space-y-2">
          {availableProfiles.map((profile) => {
            const Icon = profile.icon;
            const isActive = currentProfile === profile.key;
            
            return (
              <Button
                key={profile.key}
                variant={isActive ? "default" : "outline"}
                className={`w-full justify-start gap-2 ${
                  profile.color === 'purple' ? 'hover:bg-purple-50 hover:text-purple-700' :
                  profile.color === 'green' ? 'hover:bg-green-50 hover:text-green-700' :
                  'hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => handleProfileChange(profile.key)}
                disabled={isChanging || isActive}
              >
                {isChanging && currentProfile === profile.key ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {profile.label}
                {isActive && <span className="ml-auto text-xs">(Ativo)</span>}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSwitcher;