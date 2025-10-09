import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";

interface EditQuizNameDialogProps {
  quiz: {
    name: string;
    questions: any[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditQuizNameDialog = ({ quiz, open, onOpenChange }: EditQuizNameDialogProps) => {
  const { toast } = useToast();
  const { updateQuestion } = useQuiz();
  
  const [quizName, setQuizName] = useState("");

  useEffect(() => {
    if (quiz) {
      setQuizName(quiz.name);
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do quiz é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!quiz) return;

    try {
      // Atualizar todas as perguntas do quiz com o novo nome
      const updatePromises = quiz.questions.map(question => 
        updateQuestion.mutateAsync({
          id: question.id,
          quiz_name: quizName.trim(),
          course_id: question.course_id,
          lesson_id: question.lesson_id,
          question: question.question,
          question_type: question.question_type,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          correct_answer: question.correct_answer,
          order_index: question.order_index,
          turma_id: question.turma_id,
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: "Quiz atualizado",
        description: "O nome do quiz foi atualizado com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar o nome do quiz.",
        variant: "destructive",
      });
    }
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Quiz</DialogTitle>
          <DialogDescription>
            Altere o nome do quiz. Esta alteração será aplicada a todas as {quiz.questions.length} pergunta{quiz.questions.length !== 1 ? 's' : ''} deste quiz.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz_name">Nome do Quiz *</Label>
            <Input
              id="quiz_name"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Digite o nome do quiz"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateQuestion.isPending}>
              {updateQuestion.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizNameDialog;