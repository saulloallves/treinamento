import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Building2, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const StudentProfile = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { signOut } = useAuth();

  useEffect(() => {
    document.title = "Meu Perfil | Cresci e Perdi";
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <BaseLayout title="Meu Perfil" showBottomNav>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserCircle className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando perfil...</p>
          </div>
        ) : currentUser ? (
          <div className="grid gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <p className="font-medium">{currentUser.name || 'Nome não informado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  {currentUser.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">{currentUser.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
                    <Badge variant="secondary">{currentUser.user_type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(currentUser.role || currentUser.unit_code || currentUser.position) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Informações Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentUser.role && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Função</label>
                        <Badge variant="outline">{currentUser.role}</Badge>
                      </div>
                    )}
                    
                    {currentUser.position && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                        <p className="font-medium">{currentUser.position}</p>
                      </div>
                    )}
                    
                    {currentUser.unit_code && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Código da Unidade</label>
                        <p className="font-medium">{currentUser.unit_code}</p>
                      </div>
                    )}
                    
                    {currentUser.approval_status && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <Badge variant={
                          currentUser.approval_status === 'aprovado' ? 'default' :
                          currentUser.approval_status === 'pendente' ? 'secondary' :
                          'destructive'
                        }>
                          {currentUser.approval_status === 'aprovado' ? 'Aprovado' :
                           currentUser.approval_status === 'pendente' ? 'Pendente' :
                           currentUser.approval_status === 'rejeitado' ? 'Rejeitado' :
                           currentUser.approval_status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full md:w-auto"
                >
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Perfil não encontrado</h3>
            <p className="text-muted-foreground">Não foi possível carregar as informações do perfil.</p>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default StudentProfile;