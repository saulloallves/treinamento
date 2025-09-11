import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SimpleCreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestCreated: () => void;
}

export const SimpleCreateTestDialog = ({ open, onOpenChange, onTestCreated }: SimpleCreateTestDialogProps) => {
  const [testName, setTestName] = useState("");

  const handleSubmit = () => {
    if (!testName.trim()) {
      toast.error("Digite um nome para o teste");
      return;
    }
    
    toast.success("Teste criado com sucesso!");
    setTestName("");
    onTestCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Teste</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="testName">Nome do Teste</Label>
            <Input
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Digite o nome do teste"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Criar Teste
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};