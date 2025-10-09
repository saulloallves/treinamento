import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useCreateCollaborator } from "@/hooks/useCollaborationApprovals";

interface CreateUserDialogProps {
  allowedUserTypes?: ("Aluno" | "Colaborador" | "Professor")[];
  buttonText?: string;
  dialogTitle?: string;
}

const CreateUserDialog = ({ 
  allowedUserTypes = ["Aluno", "Colaborador", "Professor"],
  buttonText = "Novo Usuário",
  dialogTitle = "Criar Novo Usuário"
}: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    unitCode: "",
    userType: allowedUserTypes[0] as "Aluno" | "Colaborador" | "Professor",
    position: "",
    cpf: "",
    phone: "",
  });
  const { toast } = useToast();
  const createCollaboratorMutation = useCreateCollaborator();

  // Buscar unidades para validação
  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id,name,code,active")
        .eq("active", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Se é colaborador, usar o hook específico que dispara a notificação
      if (formData.userType === "Colaborador") {
        if (!formData.unitCode) {
          throw new Error("Código da unidade é obrigatório para colaboradores");
        }
        
        await createCollaboratorMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          unitCode: formData.unitCode,
          position: formData.position
        });
      } else {
        // Para usuários normais (Aluno e Professor), continua com o fluxo atual
        let unitId = null;
        if (formData.unitCode) {
          const unit = units?.find(u => u.code === formData.unitCode);
          if (unit) {
            unitId = unit.id;
          }
        }

        // Criar usuário no auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            full_name: formData.name,
            user_type: formData.userType,
            unit_code: formData.unitCode
          },
          email_confirm: true
        });

        if (authError) throw authError;
        if (!authData.user) {
          throw new Error("Erro ao criar usuário");
        }

        // Criar registro na tabela users
        const { error: userError } = await supabase.from('users').insert([{
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          user_type: formData.userType,
          unit_id: unitId,
          unit_code: formData.unitCode || null,
          position: formData.position || null,
          cpf: formData.cpf || null,
          phone: formData.phone || null,
          approval_status: 'aprovado',
          active: true,
        }]);

        if (userError) throw userError;

        toast({
          title: "Usuário criado com sucesso!",
          description: `${formData.name} foi adicionado como usuário.`,
        });
      }

      // Reset form and close dialog
      setFormData({ name: "", email: "", password: "", unitCode: "", userType: allowedUserTypes[0], position: "", cpf: "", phone: "" });
      setOpen(false);

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", unitCode: "", userType: allowedUserTypes[0], position: "", cpf: "", phone: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="w-4 h-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-type">Tipo de Usuário</Label>
            {allowedUserTypes.length > 1 ? (
              <Select 
                value={formData.userType} 
                onValueChange={(value: "Aluno" | "Colaborador" | "Professor") => setFormData(prev => ({ ...prev, userType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedUserTypes.includes("Aluno") && <SelectItem value="Aluno">Aluno</SelectItem>}
                  {allowedUserTypes.includes("Colaborador") && <SelectItem value="Colaborador">Colaborador</SelectItem>}
                  {allowedUserTypes.includes("Professor") && <SelectItem value="Professor">Professor</SelectItem>}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-muted rounded-md text-sm font-medium">
                {allowedUserTypes[0]}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.userType === "Colaborador" 
                ? "Colaboradores precisam de aprovação do franqueado da unidade"
                : formData.userType === "Professor"
                ? "Professores têm acesso ao sistema e podem gerenciar turmas"
                : "Alunos têm acesso imediato ao sistema"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-unitcode">
              Código da Unidade {formData.userType === "Colaborador" && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="user-unitcode"
              type="text"
              placeholder="Ex: ABC123"
              value={formData.unitCode}
              onChange={(e) => setFormData(prev => ({ ...prev, unitCode: e.target.value }))}
              required={formData.userType === "Colaborador"}
            />
            <p className="text-xs text-muted-foreground">
              {formData.userType === "Colaborador" 
                ? "Obrigatório para colaboradores"
                : formData.userType === "Professor"
                ? "Opcional para professores"
                : "Deixe em branco se não tiver unidade específica"}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-name">Nome Completo</Label>
            <Input
              id="user-name"
              type="text"
              placeholder="Nome do usuário"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {formData.userType === "Colaborador" && (
            <div className="space-y-2">
              <Label htmlFor="user-position">Cargo</Label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="Atendente de Loja">Atendente de Loja</SelectItem>
                  <SelectItem value="Mídias Sociais">Mídias Sociais</SelectItem>
                  <SelectItem value="Operador(a) de Caixa">Operador(a) de Caixa</SelectItem>
                  <SelectItem value="Avaliadora">Avaliadora</SelectItem>
                  <SelectItem value="Repositor(a)">Repositor(a)</SelectItem>
                  <SelectItem value="Líder de Loja">Líder de Loja</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="usuario@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          {(formData.userType === "Professor" || formData.userType === "Colaborador") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="user-cpf">CPF</Label>
                <Input
                  id="user-cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-phone">Telefone</Label>
                <Input
                  id="user-phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="user-password">Senha Inicial</Label>
            <Input
              id="user-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || createCollaboratorMutation.isPending}
            >
              {(isLoading || createCollaboratorMutation.isPending) ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-md">
          <strong>Nota:</strong> {formData.userType === "Colaborador" 
            ? "Colaboradores precisam da aprovação do franqueado da unidade para acessar o sistema."
            : formData.userType === "Professor"
            ? "Professores têm acesso imediato ao sistema e podem gerenciar turmas."
            : "Alunos terão acesso imediato ao sistema."}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;