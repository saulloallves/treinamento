import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseLayout from "@/components/BaseLayout";
import { useStudentTest } from "@/hooks/useStudentTests";
import { useTestSubmission } from "@/hooks/useTestSubmission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { Clock, CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const StudentTestQuestions = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading } = useStudentTest(testId!);
  const { 
    startTest, 
    saveResponse, 
    submitTest, 
    getCurrentSubmission,
    isLoading: submissionLoading 
  } = useTestSubmission();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!test?.time_limit_minutes || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test?.time_limit_minutes]);

  // Inicializar teste
  useEffect(() => {
    const initializeTest = async () => {
      if (!test?.id) return;

      try {
        // Verificar se já existe submission em andamento
      const currentSubmission = await getCurrentSubmission(test.id);
        
        if (currentSubmission) {
          setSubmissionId(currentSubmission.id);
          if (test.time_limit_minutes && currentSubmission.started_at) {
            const startTime = new Date(currentSubmission.started_at).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = (test.time_limit_minutes * 60) - elapsed;
            setTimeLeft(Math.max(0, remaining));
          }
        } else {
          // Criar nova submission
          const newSubmission = await startTest(test.id);
          setSubmissionId(newSubmission.id);
          if (test.time_limit_minutes) {
            setTimeLeft(test.time_limit_minutes * 60);
          }
        }
      } catch (error) {
        console.error("Error initializing test:", error);
        toast.error("Erro ao inicializar teste");
        navigate(`/aluno/teste/${test.id}`);
      }
    };

    initializeTest();
  }, [test?.id]);

  const handleResponseChange = useCallback(async (questionId: string, optionId: string) => {
    setResponses(prev => ({ ...prev, [questionId]: optionId }));
    
    if (submissionId) {
      try {
        await saveResponse({ submissionId, questionId, optionId });
      } catch (error) {
        console.error("Error saving response:", error);
        toast.error("Erro ao salvar resposta");
      }
    }
  }, [submissionId, saveResponse]);

  const handleSubmitTest = async () => {
    if (!submissionId) return;

    setIsSubmitting(true);
    try {
      const result = await submitTest(submissionId);
      toast.success(`Teste finalizado! Sua nota: ${result.percentage.toFixed(1)}%`);
      navigate(`/aluno/teste/${testId}/resultado`);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Erro ao finalizar teste");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(responses).length;
  };

  const currentQuestion = test?.test_questions?.[currentQuestionIndex];

  if (isLoading || submissionLoading) {
    return (
      <BaseLayout title="Carregando...">
        <div className="max-w-4xl mx-auto">
          <SkeletonCard />
        </div>
      </BaseLayout>
    );
  }

  if (!test || !test.test_questions?.length) {
    return (
      <BaseLayout title="Erro">
        <div className="max-w-4xl mx-auto text-center py-8">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Teste não encontrado</h2>
          <Button onClick={() => navigate("/aluno/testes")}>
            Voltar aos Testes
          </Button>
        </div>
      </BaseLayout>
    );
  }

  const totalQuestions = test.test_questions.length;
  const answeredCount = getAnsweredCount();
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <BaseLayout title={test.name}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho com timer e progresso */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Questão {currentQuestionIndex + 1} de {totalQuestions}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {timeLeft !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <Badge 
                      variant={timeLeft < 300 ? "destructive" : "secondary"}
                      className="font-mono"
                    >
                      {formatTime(timeLeft)}
                    </Badge>
                  </div>
                )}
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-sm font-medium">
                    {answeredCount}/{totalQuestions} respondidas
                  </p>
                </div>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
          </CardHeader>
        </Card>

        {/* Questão atual */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {currentQuestion.question_text}
              </CardTitle>
              {currentQuestion.image_urls && currentQuestion.image_urls.length > 0 && (
                <div className="grid gap-2">
                  {currentQuestion.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Imagem da questão ${index + 1}`}
                      className="max-w-full h-auto rounded-lg"
                    />
                  ))}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <RadioGroup
                value={responses[currentQuestion.id] || ""}
                onValueChange={(value) => handleResponseChange(currentQuestion.id, value)}
              >
                {currentQuestion.test_question_options
                  ?.sort((a, b) => a.option_order - b.option_order)
                  .map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label 
                        htmlFor={option.id} 
                        className="flex-1 cursor-pointer p-2 rounded hover:bg-muted/50"
                      >
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navegação das questões */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {test.test_questions.map((_, index) => {
                const questionId = test.test_questions![index].id;
                const isAnswered = responses[questionId];
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <Button
                    key={index}
                    variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className="w-10 h-10 p-0"
                  >
                    {isAnswered ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="sr-only">Questão {index + 1}</span>
                  </Button>
                );
              })}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                  >
                    Próxima
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting || answeredCount < totalQuestions}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Finalizando..." : "Finalizar Teste"}
                  </Button>
                )}
              </div>
            </div>
            
            {answeredCount < totalQuestions && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Responda todas as questões para finalizar o teste
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default StudentTestQuestions;