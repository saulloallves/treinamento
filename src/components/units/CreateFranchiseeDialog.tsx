import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { useCreateFranchisee } from "@/hooks/useCreateFranchisee";
import { Unidade } from "@/hooks/useUnidades";

interface CreateFranchiseeDialogProps {
  unidade: Unidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateFranchiseeDialog = ({ unidade, open, onOpenChange }: CreateFranchiseeDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const createFranchiseeMutation = useCreateFranchisee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unidade?.email) {
      toast.error("Unidade deve ter um email cadastrado");
      return;
    }

    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!password.trim() || password.length < 6) {
      toast.error("Senha é obrigatória e deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      await createFranchiseeMutation.mutateAsync({
        email: unidade.email,
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
        unitCode: unidade.codigo_grupo?.toString() || "",
        unitName: unidade.grupo || ""
      });
      
      toast.success("Franqueado cadastrado com sucesso!");
      onOpenChange(false);
      setName("");
      setPhone("");
      setPassword("");
    } catch (error) {
      console.error("Erro ao criar franqueado:", error);
    }
  };

  if (!unidade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <DialogTitle>Criar Franqueado</DialogTitle>
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
              value={unidade.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Franqueado *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Esta senha será salva e o franqueado poderá usá-la para fazer login no sistema
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createFranchiseeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createFranchiseeMutation.isPending}
            >
              {createFranchiseeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar Franqueado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFranchiseeDialog;