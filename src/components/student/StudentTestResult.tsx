import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseLayout from "@/components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BookOpen,
  RotateCcw
} from "lucide-react";

const StudentTestResult = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["test-result", testId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !testId) return null;

      // Buscar última submission do teste
      const { data: submission, error: submissionError } = await supabase
        .from("test_submissions")
        .select(`
          *,
          tests (
            name,
            description,
            passing_percentage,
            max_attempts,
            courses:course_id (
              name
            ),
            turmas:turma_id (
              name,
              code
            )
          )
        `)
        .eq("test_id", testId)
        .eq("user_id", currentUser.id)
        .eq("status", "completed")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (submissionError) throw submissionError;

      // Buscar respostas detalhadas
      const { data: responses, error: responsesError } = await supabase
        .from("test_responses")
        .select(`
          *,
          test_question_options (
            option_text,
            score_value
          ),
          test_questions (
            question_text,
            question_order,
            test_question_options (
              id,
              option_text,
              score_value
            )
          )
        `)
        .eq("test_id", testId)
        .eq("user_id", currentUser.id)
        .order("test_questions(question_order)");

      if (responsesError) throw responsesError;

      return {
        submission,
        responses: responses || []
      };
    },
    enabled: !!currentUser?.id && !!testId,
  });

  useEffect(() => {
    if (result?.submission?.tests) {
      document.title = `Resultado - ${result.submission.tests.name}`;
    }
  }, [result]);

  if (isLoading) {
    return (
      <BaseLayout title="Carregando resultado...">
        <div className="max-w-4xl mx-auto">
          <SkeletonCard />
        </div>
      </BaseLayout>
    );
  }

  if (error || !result) {
    return (
      <BaseLayout title="Erro">
        <div className="max-w-4xl mx-auto text-center py-8">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Resultado não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar o resultado deste teste.
          </p>
          <Button onClick={() => navigate("/aluno/testes")}>
            Voltar aos Testes
          </Button>
        </div>
      </BaseLayout>
    );
  }

  const { submission, responses } = result;
  const test = submission.tests;
  const passed = submission.passed;
  const canRetake = test.max_attempts ? submission.attempt_number < test.max_attempts : false;

  const correctAnswers = responses.filter(r => r.score_obtained > 0).length;
  const totalQuestions = responses.length;

  return (
    <BaseLayout title="Resultado do Teste">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultado Principal */}
        <Card className={`border-2 ${passed ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-600" />
              ) : (
                <XCircle className="w-16 h-16 text-red-600" />
              )}
            </div>
            
            <CardTitle className="text-2xl mb-2">
              {passed ? "Parabéns! Você foi aprovado!" : "Não foi dessa vez..."}
            </CardTitle>
            
            <div className="text-6xl font-bold mb-2 text-primary">
              {submission.percentage.toFixed(1)}%
            </div>
            
            <div className="space-y-2">
              <Badge variant={passed ? "default" : "destructive"} className="text-sm">
                {passed ? "APROVADO" : "REPROVADO"}
              </Badge>
              
              <p className="text-muted-foreground">
                Nota mínima para aprovação: {test.passing_percentage}%
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Progress 
              value={submission.percentage} 
              className={`h-3 mb-4 ${passed ? '[&>div]:bg-green-600' : '[&>div]:bg-red-600'}`}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex justify-center mb-1">
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Pontuação</p>
                <p className="font-semibold">
                  {submission.total_score}/{submission.max_possible_score}
                </p>
              </div>
              
              <div>
                <div className="flex justify-center mb-1">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Acertos</p>
                <p className="font-semibold">
                  {correctAnswers}/{totalQuestions}
                </p>
              </div>
              
              {submission.time_taken_minutes && (
                <div>
                  <div className="flex justify-center mb-1">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo</p>
                  <p className="font-semibold">{submission.time_taken_minutes}min</p>
                </div>
              )}
              
              <div>
                <div className="flex justify-center mb-1">
                  <RotateCcw className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Tentativa</p>
                <p className="font-semibold">
                  {submission.attempt_number}
                  {test.max_attempts && `/${test.max_attempts}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {test.name}
            </CardTitle>
            {test.description && (
              <p className="text-muted-foreground">{test.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-2">
            {test.courses && (
              <div>
                <span className="text-sm text-muted-foreground">Curso: </span>
                <span className="font-medium">{test.courses.name}</span>
              </div>
            )}
            
            {test.turmas && (
              <div>
                <span className="text-sm text-muted-foreground">Turma: </span>
                <span className="font-medium">{test.turmas.name || test.turmas.code}</span>
              </div>
            )}
            
            <div>
              <span className="text-sm text-muted-foreground">Realizado em: </span>
              <span className="font-medium">
                {new Date(submission.submitted_at!).toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento das Respostas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento das Respostas</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {responses.map((response, index) => {
              const question = response.test_questions;
              const selectedOption = response.test_question_options;
              const isCorrect = response.score_obtained > 0;
              
              // Encontrar a opção correta (maior score)
              const correctOption = question?.test_question_options?.reduce((max, option) => 
                option.score_value > (max?.score_value || 0) ? option : max
              );
              
              return (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">
                        {index + 1}. {question?.question_text}
                      </h4>
                      
                      <div className="space-y-1">
                        <div className={`p-2 rounded ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <span className="text-sm text-muted-foreground">Sua resposta: </span>
                          <span className="font-medium">{selectedOption?.option_text}</span>
                        </div>
                        
                        {!isCorrect && correctOption && (
                          <div className="p-2 rounded bg-green-50 border border-green-200">
                            <span className="text-sm text-muted-foreground">Resposta correta: </span>
                            <span className="font-medium">{correctOption.option_text}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Pontuação: {response.score_obtained} pontos
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/aluno/testes")}
            className="flex-1"
          >
            Voltar aos Testes
          </Button>
          
          {canRetake && !passed && (
            <Button 
              onClick={() => navigate(`/aluno/teste/${testId}`)}
              className="flex-1"
            >
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default StudentTestResult;