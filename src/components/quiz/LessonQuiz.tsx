import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuestionsByLesson } from "@/hooks/useQuiz";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface LessonQuizProps {
  lessonId: string;
  courseId: string;
  turmaId?: string;
}

const LessonQuiz = ({ lessonId, courseId, turmaId }: LessonQuizProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: questions = [], isLoading } = useQuestionsByLesson(lessonId, turmaId);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Erro",
        description: "Por favor, responda todas as perguntas.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Salvar todas as respostas
      const responses = questions.map(question => ({
        user_id: user?.id,
        course_id: courseId,
        quiz_id: question.id,
        selected_answer: answers[question.id],
        is_correct: question.question_type === "multiple_choice" 
          ? answers[question.id] === question.correct_answer 
          : null, // Para perguntas dissertativas, não podemos determinar automaticamente
      }));

      const { error } = await supabase
        .from("quiz_responses")
        .insert(responses);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Quiz enviado!",
        description: "Suas respostas foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar respostas.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando quiz...</div>;
  }

  if (questions.length === 0) {
    return null; // Não mostrar nada se não houver quiz para esta aula
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-2">Quiz Concluído!</h3>
            <p className="text-muted-foreground">Suas respostas foram enviadas com sucesso.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz da Aula</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question: any, index: number) => (
          <div key={question.id} className="space-y-4">
            <h4 className="font-medium">
              {index + 1}. {question.question}
            </h4>
            
            {question.question_type === "multiple_choice" ? (
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id={`${question.id}-a`} />
                  <Label htmlFor={`${question.id}-a`} className="cursor-pointer">
                    A) {question.option_a}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id={`${question.id}-b`} />
                  <Label htmlFor={`${question.id}-b`} className="cursor-pointer">
                    B) {question.option_b}
                  </Label>
                </div>
                
                {question.option_c && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id={`${question.id}-c`} />
                    <Label htmlFor={`${question.id}-c`} className="cursor-pointer">
                      C) {question.option_c}
                    </Label>
                  </div>
                )}
                
                {question.option_d && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id={`${question.id}-d`} />
                    <Label htmlFor={`${question.id}-d`} className="cursor-pointer">
                      D) {question.option_d}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`essay-${question.id}`}>Sua resposta:</Label>
                <Textarea
                  id={`essay-${question.id}`}
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  rows={4}
                />
              </div>
            )}
          </div>
        ))}
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || Object.keys(answers).length !== questions.length}
          className="w-full"
        >
          {isSubmitting ? "Enviando..." : "Enviar Respostas"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LessonQuiz;