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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/hooks/useCourses";
import { useLessons } from "@/hooks/useLessons";
import { useQuiz } from "@/hooks/useQuiz";
import { Plus, Trash2 } from "lucide-react";

interface CreateMultipleQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuestionForm {
  id: string;
  question: string;
  question_type: "multiple_choice" | "essay";
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

const CreateMultipleQuestionsDialog = ({ open, onOpenChange }: CreateMultipleQuestionsDialogProps) => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { data: allLessons = [] } = useLessons();
  const { createQuestion } = useQuiz();
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([{
    id: "1",
    question: "",
    question_type: "multiple_choice",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    order_index: 0,
  }]);

  // Filtrar aulas do curso selecionado
  const availableLessons = allLessons.filter(lesson => lesson.course_id === selectedCourse);

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      id: Date.now().toString(),
      question: "",
      question_type: "multiple_choice",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      order_index: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedLesson) {
      toast({
        title: "Erro",
        description: "Selecione um curso e uma aula.",
        variant: "destructive",
      });
      return;
    }

    // Validar todas as perguntas
    for (const question of questions) {
      if (!question.question.trim()) {
        toast({
          title: "Erro",
          description: "Todas as perguntas devem ter texto.",
          variant: "destructive",
        });
        return;
      }

      if (question.question_type === "multiple_choice") {
        if (!question.option_a || !question.option_b || !question.correct_answer) {
          toast({
            title: "Erro",
            description: "Para perguntas de múltipla escolha, preencha pelo menos as opções A e B e selecione a resposta correta.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      // Criar todas as perguntas
      for (const [index, question] of questions.entries()) {
        const questionData = {
          course_id: selectedCourse,
          lesson_id: selectedLesson,
          question: question.question,
          question_type: question.question_type,
          option_a: question.question_type === "multiple_choice" ? question.option_a : null,
          option_b: question.question_type === "multiple_choice" ? question.option_b : null,
          option_c: question.question_type === "multiple_choice" ? question.option_c : null,
          option_d: question.question_type === "multiple_choice" ? question.option_d : null,
          correct_answer: question.question_type === "multiple_choice" ? question.correct_answer : null,
          order_index: index,
        };

        await createQuestion.mutateAsync(questionData);
      }

      toast({
        title: "Quiz criado",
        description: `${questions.length} pergunta(s) foram criadas com sucesso.`,
      });
      
      onOpenChange(false);
      
      // Reset form
      setSelectedCourse("");
      setSelectedLesson("");
      setQuestions([{
        id: "1",
        question: "",
        question_type: "multiple_choice",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "",
        order_index: 0,
      }]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar quiz.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Quiz Completo</DialogTitle>
          <DialogDescription>
            Selecione uma aula e adicione todas as perguntas do quiz.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Curso e Aula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_id">Curso *</Label>
              <Select
                value={selectedCourse}
                onValueChange={(value) => {
                  setSelectedCourse(value);
                  setSelectedLesson("");
                }}
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
                value={selectedLesson}
                onValueChange={setSelectedLesson}
                disabled={!selectedCourse}
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
          </div>

          {/* Lista de Perguntas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Perguntas do Quiz</h3>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Pergunta {index + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Pergunta *</Label>
                    <Select
                      value={question.question_type}
                      onValueChange={(value: "multiple_choice" | "essay") => {
                        setQuestions(questions.map(q => 
                          q.id === question.id ? { 
                            ...q, 
                            question_type: value,
                            option_a: value === "essay" ? "" : q.option_a,
                            option_b: value === "essay" ? "" : q.option_b,
                            option_c: value === "essay" ? "" : q.option_c,
                            option_d: value === "essay" ? "" : q.option_d,
                            correct_answer: value === "essay" ? "" : q.correct_answer,
                          } : q
                        ));
                      }}
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
                    <Label>Pergunta *</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      placeholder="Digite a pergunta do quiz"
                      rows={3}
                    />
                  </div>

                  {question.question_type === "multiple_choice" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Opção A *</Label>
                          <Input
                            value={question.option_a}
                            onChange={(e) => updateQuestion(question.id, "option_a", e.target.value)}
                            placeholder="Primeira opção"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Opção B *</Label>
                          <Input
                            value={question.option_b}
                            onChange={(e) => updateQuestion(question.id, "option_b", e.target.value)}
                            placeholder="Segunda opção"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Opção C</Label>
                          <Input
                            value={question.option_c}
                            onChange={(e) => updateQuestion(question.id, "option_c", e.target.value)}
                            placeholder="Terceira opção (opcional)"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Opção D</Label>
                          <Input
                            value={question.option_d}
                            onChange={(e) => updateQuestion(question.id, "option_d", e.target.value)}
                            placeholder="Quarta opção (opcional)"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Resposta Correta *</Label>
                        <Select
                          value={question.correct_answer}
                          onValueChange={(value) => updateQuestion(question.id, "correct_answer", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a resposta correta" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.option_a && <SelectItem value="A">A) {question.option_a}</SelectItem>}
                            {question.option_b && <SelectItem value="B">B) {question.option_b}</SelectItem>}
                            {question.option_c && <SelectItem value="C">C) {question.option_c}</SelectItem>}
                            {question.option_d && <SelectItem value="D">D) {question.option_d}</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? "Criando..." : `Criar Quiz (${questions.length} pergunta${questions.length > 1 ? 's' : ''})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMultipleQuestionsDialog;