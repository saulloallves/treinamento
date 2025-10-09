import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";

interface EditQuizStatusDialogProps {
  quiz: {
    id: string;
    quiz_name: string;
    status: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditQuizStatusDialog = ({ quiz, open, onOpenChange }: EditQuizStatusDialogProps) => {
  const { toast } = useToast();
  const { updateQuestion } = useQuiz();
  const [status, setStatus] = useState<string>("");

  // Update status when quiz changes
  React.useEffect(() => {
    if (quiz) {
      setStatus(quiz.status || "rascunho");
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quiz) return;

    try {
      await updateQuestion.mutateAsync({
        id: quiz.id,
        status,
      });
      
      toast({
        title: "Status atualizado",
        description: "O status do quiz foi atualizado com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar o status do quiz.",
        variant: "destructive",
      });
    }
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Status do Quiz</DialogTitle>
          <DialogDescription>
            Atualize o status do quiz "{quiz.quiz_name}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateQuestion.isPending}
            >
              {updateQuestion.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizStatusDialog;