import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateAdminDialog = ({ open, onOpenChange }: CreateAdminDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Chamar Edge Function segura (usa service role) para criar admin
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Não foi possível criar o administrador');
      }

      toast({
        title: 'Admin criado com sucesso!',
        description: `${formData.name} foi adicionado como administrador.`,
      });

      // Reset form and close dialog
      setFormData({ name: '', email: '', password: '' });
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Erro ao criar admin',
        description: error?.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Criar Novo Administrador
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Nome Completo</Label>
            <Input
              id="admin-name"
              type="text"
              placeholder="Nome do administrador"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha Inicial</Label>
            <Input
              id="admin-password"
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
              onClick={() => onOpenChange(false)}
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
              {isLoading ? "Criando..." : "Criar Admin"}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-md">
          <strong>Nota:</strong> O administrador criado aqui terá acesso imediato ao sistema, 
          sem necessidade de aprovação adicional.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdminDialog;