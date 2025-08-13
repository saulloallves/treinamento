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
import { useLessons } from "@/hooks/useLessons";
import { useQuiz } from "@/hooks/useQuiz";

interface EditQuizDialogProps {
  question: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditQuizDialog = ({ question, open, onOpenChange }: EditQuizDialogProps) => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { data: allLessons = [] } = useLessons();
  const { updateQuestion } = useQuiz();
  
  const [formData, setFormData] = useState({
    course_id: "",
    lesson_id: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    order_index: 0,
  });

  // Filtrar aulas do curso selecionado
  const availableLessons = allLessons.filter(lesson => lesson.course_id === formData.course_id);

  useEffect(() => {
    if (question) {
      setFormData({
        course_id: question.course_id || "",
        lesson_id: question.lesson_id || "",
        question: question.question || "",
        option_a: question.option_a || "",
        option_b: question.option_b || "",
        option_c: question.option_c || "",
        option_d: question.option_d || "",
        correct_answer: question.correct_answer || "",
        order_index: question.order_index || 0,
      });
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.lesson_id || !formData.question || !formData.option_a || !formData.option_b || !formData.correct_answer) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (curso, aula, pergunta, opções A e B, resposta correta).",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateQuestion.mutateAsync({
        id: question.id,
        ...formData,
      });
      toast({
        title: "Pergunta atualizada",
        description: "A pergunta foi atualizada com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pergunta.",
        variant: "destructive",
      });
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pergunta do Quiz</DialogTitle>
          <DialogDescription>
            Edite a pergunta do quiz.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value, lesson_id: "" }))}
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
            <Label htmlFor="lesson_id">Aula *</Label>
            <Select
              value={formData.lesson_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, lesson_id: value }))}
              disabled={!formData.course_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma aula" />
              </SelectTrigger>
              <SelectContent>
                {availableLessons.map((lesson: any) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
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
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateQuestion.isPending}>
              {updateQuestion.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizDialog;