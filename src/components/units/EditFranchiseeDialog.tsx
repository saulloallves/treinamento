import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import { useUpdateFranchisee } from "@/hooks/useUpdateFranchisee";
import { Unidade } from "@/hooks/useUnidades";

interface EditFranchiseeDialogProps {
  unidade: Unidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditFranchiseeDialog = ({ unidade, open, onOpenChange }: EditFranchiseeDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const updateFranchiseeMutation = useUpdateFranchisee();

  useEffect(() => {
    if (unidade && open) {
      setEmail(unidade.email || "");
      setName("");
      setPhone("");
      setPassword("");
    }
  }, [unidade, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      toast.success("Franqueado atualizado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar franqueado:", error);
    }
  };

  if (!unidade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            <DialogTitle>Editar Franqueado</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade</Label>
            <Input 
              id="unidade"
              value={`${unidade.grupo} (${unidade.codigo_grupo})`}
              disabled
              className="bg-muted"
            />
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
            <Label htmlFor="name">Nome do Franqueado</Label>
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
      </DialogContent>
    </Dialog>
  );
};

export default EditFranchiseeDialog;
