import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserCog, Users } from "lucide-react";
import { useUpdateFranchisee } from "@/hooks/useUpdateFranchisee";
import { Unidade, useUnidadeCollaborators } from "@/hooks/useUnidades";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EditUserAccessDialogProps {
  unidade: Unidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserAccessDialog = ({ unidade, open, onOpenChange }: EditUserAccessDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const updateFranchiseeMutation = useUpdateFranchisee();
  
  const { data: usuarios = [] } = useUnidadeCollaborators(unidade?.codigo_grupo || 0);

  useEffect(() => {
    if (unidade && open) {
      setSelectedUserId(null);
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
    }
  }, [unidade, open]);

  const selectedUser = usuarios.find(u => u.id === selectedUserId);

  const handleSelectUser = (userId: string) => {
    const user = usuarios.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setEmail(user.email || "");
      setName(user.name || "");
      setPhone(user.phone || "");
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error("Selecione um usuário para editar");
      return;
    }

    if (!unidade?.codigo_grupo) {
      toast.error("Código da unidade não encontrado");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      await updateFranchiseeMutation.mutateAsync({
        unitCode: unidade.codigo_grupo.toString(),
        email: email.trim() || undefined,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
      });
      
      toast.success("Acesso atualizado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar acesso:", error);
    }
  };

  if (!unidade) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "aprovado":
        return "default";
      case "pendente":
        return "secondary";
      case "rejeitado":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <DialogTitle>Editar Acessos - {unidade.grupo}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de usuários */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selecione o usuário para editar
            </Label>
            
            {usuarios.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum usuário encontrado para esta unidade
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                {usuarios.map((user) => (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-colors ${
                      selectedUserId === user.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.role === 'Franqueado' ? '👤 Franqueado' : '👥 Colaborador'}
                          </p>
                        </div>
                        <Badge
                          variant={getStatusBadgeVariant(user.approval_status || "aprovado")}
                          className="text-xs"
                        >
                          {user.approval_status === "aprovado" ? "Aprovado" : 
                           user.approval_status === "pendente" ? "Pendente" : 
                           user.approval_status === "rejeitado" ? "Recusado" : "N/A"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Formulário de edição */}
          {selectedUserId && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <div className="bg-primary/5 p-3 rounded-md">
                <p className="text-sm font-medium">
                  Editando: {selectedUser?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedUser?.role === 'Franqueado' ? 'Franqueado' : 'Colaborador'} • {selectedUser?.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter o email atual
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome completo"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter o nome atual
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter o telefone atual
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter a senha atual (mínimo 6 caracteres se alterar)
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateFranchiseeMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateFranchiseeMutation.isPending}
                >
                  {updateFranchiseeMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserAccessDialog;
