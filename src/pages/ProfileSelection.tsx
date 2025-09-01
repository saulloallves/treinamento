import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { setSelectedProfile } from '@/lib/profile';

const ProfileSelection = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin = false, isLoading: checking } = useIsAdmin(user?.id || undefined);
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Selecionar Perfil | Sistema de Treinamentos';
    
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
  }, [user?.id]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Se só tem um perfil, redireciona automaticamente
  if (!isAdmin && hasStudentProfile) {
    navigate('/aluno');
    return null;
  }
  
  if (isAdmin && !hasStudentProfile) {
    navigate('/dashboard');
    return null;
  }

  const handleProfileSelection = (profile: 'admin' | 'student') => {
    if (profile === 'admin') {
      setSelectedProfile('Admin');
      navigate('/dashboard');
    } else {
      setSelectedProfile('Aluno');
      navigate('/aluno');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selecione seu Perfil</h1>
          <p className="text-gray-600">Você tem acesso a múltiplos perfis. Escolha como deseja acessar o sistema.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {isAdmin && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Administrador</CardTitle>
                <CardDescription>
                  Acesse o painel administrativo completo do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleProfileSelection('admin')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Entrar como Admin
                </Button>
              </CardContent>
            </Card>
          )}

          {hasStudentProfile && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Aluno/Franqueado</CardTitle>
                <CardDescription>
                  Acesse seus cursos e treinamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleProfileSelection('student')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Entrar como Aluno
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => supabase.auth.signOut()}
            className="text-gray-600"
          >
            Fazer Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelection;