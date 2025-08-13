import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/hooks/useCourses";
import { useQuiz } from "@/hooks/useQuiz";

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateQuizDialog = ({ open, onOpenChange }: CreateQuizDialogProps) => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { createQuestion } = useQuiz();
  
  const [formData, setFormData] = useState({
    course_id: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    order_index: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.question || !formData.option_a || !formData.option_b || !formData.correct_answer) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createQuestion.mutateAsync(formData);
      toast({
        title: "Pergunta criada",
        description: "A pergunta foi criada com sucesso.",
      });
      onOpenChange(false);
      setFormData({
        course_id: "",
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "",
        order_index: 0,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar pergunta.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Pergunta do Quiz</DialogTitle>
          <DialogDescription>
            Crie uma nova pergunta para o quiz de um curso.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Pergunta *</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Digite a pergunta do quiz"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="option_a">Opção A *</Label>
              <Input
                id="option_a"
                value={formData.option_a}
                onChange={(e) => setFormData(prev => ({ ...prev, option_a: e.target.value }))}
                placeholder="Primeira opção"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_b">Opção B *</Label>
              <Input
                id="option_b"
                value={formData.option_b}
                onChange={(e) => setFormData(prev => ({ ...prev, option_b: e.target.value }))}
                placeholder="Segunda opção"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_c">Opção C</Label>
              <Input
                id="option_c"
                value={formData.option_c}
                onChange={(e) => setFormData(prev => ({ ...prev, option_c: e.target.value }))}
                placeholder="Terceira opção (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_d">Opção D</Label>
              <Input
                id="option_d"
                value={formData.option_d}
                onChange={(e) => setFormData(prev => ({ ...prev, option_d: e.target.value }))}
                placeholder="Quarta opção (opcional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correct_answer">Resposta Correta *</Label>
            <Select
              value={formData.correct_answer}
              onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a resposta correta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                {formData.option_c && <SelectItem value="C">C</SelectItem>}
                {formData.option_d && <SelectItem value="D">D</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Ordem</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
              placeholder="Ordem da pergunta"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? "Criando..." : "Criar Pergunta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialog;