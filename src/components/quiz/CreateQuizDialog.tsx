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
import { useLessons } from "@/hooks/useLessons";
import { useQuiz } from "@/hooks/useQuiz";

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateQuizDialog = ({ open, onOpenChange }: CreateQuizDialogProps) => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { data: allLessons = [] } = useLessons();
  const { createQuestion } = useQuiz();
  
  const [formData, setFormData] = useState({
    course_id: "",
    lesson_id: "",
    question: "",
    question_type: "multiple_choice",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    order_index: 0,
  });

  // Filtrar aulas do curso selecionado
  const availableLessons = allLessons.filter(lesson => lesson.course_id === formData.course_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.lesson_id || !formData.question) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (curso, aula, pergunta).",
        variant: "destructive",
      });
      return;
    }

    if (formData.question_type === "multiple_choice" && (!formData.option_a || !formData.option_b || !formData.correct_answer)) {
      toast({
        title: "Erro",
        description: "Para perguntas de múltipla escolha, preencha pelo menos as opções A e B e selecione a resposta correta.",
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
        lesson_id: "",
        question: "",
        question_type: "multiple_choice",
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
            Crie uma nova pergunta para a aula de um curso.
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
            <Label htmlFor="question_type">Tipo de Pergunta *</Label>
            <Select
              value={formData.question_type}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                question_type: value,
                option_a: value === "essay" ? "" : prev.option_a,
                option_b: value === "essay" ? "" : prev.option_b,
                option_c: value === "essay" ? "" : prev.option_c,
                option_d: value === "essay" ? "" : prev.option_d,
                correct_answer: value === "essay" ? "" : prev.correct_answer,
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                <SelectItem value="essay">Dissertativa</SelectItem>
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

          {formData.question_type === "multiple_choice" && (
            <>
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
                  <SelectContent className="z-[100]">
                    {formData.option_a.trim() && <SelectItem value="A">A) {formData.option_a}</SelectItem>}
                    {formData.option_b.trim() && <SelectItem value="B">B) {formData.option_b}</SelectItem>}
                    {formData.option_c.trim() && <SelectItem value="C">C) {formData.option_c}</SelectItem>}
                    {formData.option_d.trim() && <SelectItem value="D">D) {formData.option_d}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}


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