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
import { Copy } from "lucide-react";

interface DuplicateQuizDialogProps {
  questions: any[];
  quizName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DuplicateQuizDialog = ({ questions, quizName, open, onOpenChange }: DuplicateQuizDialogProps) => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { data: allLessons = [] } = useLessons();
  const { createQuestion } = useQuiz();
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [newQuizName, setNewQuizName] = useState(`${quizName} - Cópia`);

  // Filtrar aulas do curso selecionado
  const availableLessons = allLessons.filter(lesson => lesson.course_id === selectedCourse);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedLesson || !newQuizName.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o nome do quiz, selecione um curso e uma aula.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Duplicar todas as perguntas
      for (const [index, question] of questions.entries()) {
        const questionData = {
          course_id: selectedCourse,
          lesson_id: selectedLesson,
          quiz_name: newQuizName.trim(),
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
        title: "Quiz duplicado",
        description: `Quiz "${newQuizName}" foi criado com ${questions.length} pergunta(s).`,
      });
      
      onOpenChange(false);
      
      // Reset form
      setSelectedCourse("");
      setSelectedLesson("");
      setNewQuizName(`${quizName} - Cópia`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar quiz.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Duplicar Quiz
          </DialogTitle>
          <DialogDescription>
            Crie uma cópia do quiz "{quizName}" com {questions.length} pergunta(s).
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_quiz_name">Nome do Novo Quiz *</Label>
            <Input
              id="new_quiz_name"
              value={newQuizName}
              onChange={(e) => setNewQuizName(e.target.value)}
              placeholder="Nome do novo quiz"
            />
          </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? "Duplicando..." : "Duplicar Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateQuizDialog;