import { useState, useEffect, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { Clock, CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTestFlow } from "@/contexts/TestFlowContext";

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
  const { isTestStarted, endTest } = useTestFlow();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSavingResponse, setIsSavingResponse] = useState(false);
  const [routeProtectionChecked, setRouteProtectionChecked] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false); // Flag para permitir navegação ao finalizar
  
  // Ref para armazenar timers de debounce por questão
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Proteção da rota com delay para garantir que sessionStorage foi lido
  useEffect(() => {
    // Aguardar um momento para o contexto ser inicializado do sessionStorage
    const timer = setTimeout(() => {
      setRouteProtectionChecked(true);
      if (!isLoading && testId && !isTestStarted(testId)) {
        toast.warning("Por favor, inicie o teste a partir da página de instruções.");
        navigate(`/aluno/teste/${testId}`, { replace: true });
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, testId]); // Removido navigate e isTestStarted das dependências para evitar loop

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (testId && !isFinishing) {
        endTest(testId);
      }
    };
  }, [testId, endTest, isFinishing]);

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

      setIsInitializing(true);
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
      } finally {
        setIsInitializing(false);
      }
    };

    initializeTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id]);

  // Limpar timers ao desmontar
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleResponseChange = useCallback(async (questionId: string, answer: { optionId?: string; responseText?: string }) => {
    // Atualizar UI imediatamente
    const valueToStore = answer.optionId || answer.responseText || "";
    setResponses(prev => ({ ...prev, [questionId]: valueToStore }));
    
    if (!submissionId) return;

    // Se for múltipla escolha (optionId), salvar imediatamente
    if (answer.optionId) {
      setIsSavingResponse(true);
      try {
        await saveResponse({ submissionId, questionId, ...answer });
      } catch (error) {
        console.error("Error saving response:", error);
        setResponses(prev => {
          const updated = { ...prev };
          delete updated[questionId];
          return updated;
        });
        toast.error("Erro ao salvar resposta. Tente novamente.");
      } finally {
        setIsSavingResponse(false);
      }
      return;
    }

    // Se for texto (responseText), usar debounce de 1 segundo
    if (answer.responseText !== undefined) {
      // Limpar timer anterior desta questão
      if (debounceTimers.current[questionId]) {
        clearTimeout(debounceTimers.current[questionId]);
      }

      // Criar novo timer
      debounceTimers.current[questionId] = setTimeout(async () => {
        setIsSavingResponse(true);
        try {
          await saveResponse({ submissionId, questionId, responseText: answer.responseText });
        } catch (error) {
          console.error("Error saving response:", error);
          toast.error("Erro ao salvar resposta. Tente novamente.");
        } finally {
          setIsSavingResponse(false);
        }
      }, 1000); // 1 segundo de debounce
    }
  }, [submissionId, saveResponse]);

  const handleSubmitTest = async () => {
    if (!submissionId) {
      console.error("No submissionId found");
      return;
    }

    console.log("Starting test submission...", submissionId);
    setIsSubmitting(true);
    setIsFinishing(true); // Permitir navegação
    
    try {
      // Limpar todos os timers pendentes
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
      
      // Aguardar um momento para garantir que as respostas foram salvas
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("Submitting test to backend...");
      const result = await submitTest(submissionId);
      console.log("Test submitted successfully:", result);
      
      // Limpar o estado do teste do contexto ANTES de navegar
      if (testId) {
        console.log("Ending test flow...");
        endTest(testId);
      }
      
      // Verificar se há questões dissertativas não corrigidas
      if ((result as any).hasUngradedEssays) {
        toast.success("Teste enviado com sucesso! Suas respostas dissertativas estão aguardando correção.", {
          duration: 5000,
        });
      } else {
        toast.success(`Teste finalizado! Sua nota: ${result.percentage.toFixed(1)}%`);
      }
      
      console.log("About to navigate...");
      console.log("Navigate function:", navigate);
      console.log("Target route: /aluno/testes");
      
      // Navegar imediatamente
      navigate('/aluno/testes', { replace: true });
      
      console.log("Navigate called successfully");
      
    } catch (error: any) {
      console.error("Error submitting test:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      // Mostrar erro específico se for problema com enum
      if (error?.code === '22P02' && error?.message?.includes('pending_review')) {
        toast.error("Erro de configuração do sistema. Por favor, contate o administrador.");
      } else {
        toast.error(error?.message || "Erro ao finalizar teste. Por favor, tente novamente.");
      }
      
      setIsSubmitting(false);
      setIsFinishing(false); // Restaurar proteção em caso de erro
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

  const handleQuestionNavigation = (newIndex: number) => {
    // Limpar timers pendentes da questão atual para salvar imediatamente
    if (currentQuestion?.id && debounceTimers.current[currentQuestion.id]) {
      clearTimeout(debounceTimers.current[currentQuestion.id]);
      
      // Salvar resposta pendente se houver
      const currentResponse = responses[currentQuestion.id];
      if (currentResponse && submissionId) {
        saveResponse({ 
          submissionId, 
          questionId: currentQuestion.id, 
          responseText: currentResponse 
        }).catch(console.error);
      }
    }
    
    setCurrentQuestionIndex(newIndex);
  };

  const currentQuestion = test?.test_questions?.[currentQuestionIndex];

  if (isLoading || isInitializing) {
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
              {currentQuestion.question_type === 'multiple_choice' ? (
                <RadioGroup
                  value={responses[currentQuestion.id] || ""}
                  onValueChange={(value) => handleResponseChange(currentQuestion.id, { optionId: value })}
                  disabled={isSavingResponse}
                >
                  {currentQuestion.test_question_options
                    ?.sort((a, b) => a.option_order - b.option_order)
                    .map((option) => (
                      <div key={option.id} className="flex items-center space-x-2 py-1">
                        <RadioGroupItem 
                          value={option.id} 
                          id={option.id}
                          disabled={isSavingResponse}
                        />
                        <Label 
                          htmlFor={option.id} 
                          className="flex-1 cursor-pointer p-3 rounded hover:bg-muted/50 transition-colors"
                        >
                          {option.option_text}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="essay-response">Sua Resposta</Label>
                  <Textarea
                    id="essay-response"
                    value={responses[currentQuestion.id] || ""}
                    onChange={(e) => handleResponseChange(currentQuestion.id, { responseText: e.target.value })}
                    placeholder="Digite sua resposta aqui..."
                    rows={6}
                    disabled={isSavingResponse}
                  />
                  <p className="text-xs text-muted-foreground">Sua resposta será avaliada por um instrutor.</p>
                </div>
              )}
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
                    onClick={() => handleQuestionNavigation(index)}
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
                onClick={() => handleQuestionNavigation(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    onClick={() => handleQuestionNavigation(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
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