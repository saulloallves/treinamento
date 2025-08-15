import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CreateUserDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    unitCode: "",
  });
  const { toast } = useToast();

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
      // 1. Validar se o código da unidade existe
      let unitId = null;
      if (formData.unitCode) {
        const unit = units?.find(u => u.code === formData.unitCode);
        if (unit) {
          unitId = unit.id;
        }
      }

      // 2. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.name,
          user_type: 'Aluno',
          unit_code: formData.unitCode
        },
        email_confirm: true // Auto-confirma o email
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // 3. Criar registro na tabela users
      const { error: userError } = await supabase.from('users').insert([{
        id: authData.user.id,
        name: formData.name,
        email: formData.email,
        user_type: 'Aluno',
        unit_id: unitId,
        unit_code: formData.unitCode || null,
        active: true,
      }]);

      if (userError) throw userError;

      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.name} foi adicionado como usuário.`,
      });

      // Reset form and close dialog
      setFormData({ name: "", email: "", password: "", unitCode: "" });
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
    setFormData({ name: "", email: "", password: "", unitCode: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Criar Novo Usuário
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-unitcode">Código da Unidade</Label>
            <Input
              id="user-unitcode"
              type="text"
              placeholder="Ex: ABC123"
              value={formData.unitCode}
              onChange={(e) => setFormData(prev => ({ ...prev, unitCode: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco se não tiver unidade específica
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
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-md">
          <strong>Nota:</strong> O usuário criado terá acesso imediato ao sistema 
          como aluno/colaborador.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;