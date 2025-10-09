import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseLayout from "@/components/BaseLayout";
import { useStudentTest } from "@/hooks/useStudentTests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { Clock, Trophy, AlertTriangle, BookOpen } from "lucide-react";
import { toast } from "sonner";

const StudentTest = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useStudentTest(testId!);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (test) {
      document.title = `${test.name} | Teste Avaliativo`;
    }
  }, [test]);

  const handleStartTest = async () => {
    if (!test) return;
    
    // Verificar se já existe tentativa em andamento ou se atingiu limite
    const completedAttempts = test.test_submissions?.filter(s => s.status === 'completed').length || 0;
    const hasInProgress = test.test_submissions?.some(s => s.status === 'in_progress');
    
    if (hasInProgress) {
      toast.info("Você já tem um teste em andamento");
      navigate(`/aluno/teste/${test.id}/questoes`);
      return;
    }
    
    if (test.max_attempts && completedAttempts >= test.max_attempts) {
      toast.error("Você atingiu o limite de tentativas para este teste");
      return;
    }
    
    setIsStarting(true);
    try {
      toast.success("Redirecionando para o teste...");
      navigate(`/aluno/teste/${test.id}/questoes`);
    } catch (error) {
      toast.error("Erro ao iniciar teste");
      console.error("Error starting test:", error);
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <BaseLayout title="Carregando...">
        <div className="max-w-2xl mx-auto">
          <SkeletonCard />
        </div>
      </BaseLayout>
    );
  }

  if (error || !test) {
    return (
      <BaseLayout title="Erro">
        <div className="max-w-2xl mx-auto text-center py-8">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Teste não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || "O teste solicitado não foi encontrado ou você não tem permissão para acessá-lo."}
          </p>
          <Button onClick={() => navigate("/aluno/testes")}>
            Voltar aos Testes
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Teste Avaliativo">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabeçalho do Teste */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">{test.name}</CardTitle>
                {test.description && (
                  <p className="text-muted-foreground">{test.description}</p>
                )}
              </div>
              <Badge variant="outline">
                <BookOpen className="w-3 h-3 mr-1" />
                Teste
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informações do Curso/Turma */}
            {test.courses && (
              <div>
                <p className="text-sm text-muted-foreground">Curso</p>
                <p className="font-medium">{test.courses.name}</p>
              </div>
            )}

            {test.turmas && (
              <div>
                <p className="text-sm text-muted-foreground">Turma</p>
                <p className="font-medium">{test.turmas.name || test.turmas.code}</p>
              </div>
            )}

            {/* Detalhes do Teste */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nota mínima</p>
                  <p className="font-medium">{test.passing_percentage}%</p>
                </div>
              </div>

              {test.time_limit_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo limite</p>
                    <p className="font-medium">{test.time_limit_minutes} minutos</p>
                  </div>
                </div>
              )}

              {test.max_attempts && (
                <div>
                  <p className="text-xs text-muted-foreground">Tentativas máximas</p>
                  <p className="font-medium">{test.max_attempts}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">
                Leia cada questão cuidadosamente antes de responder.
              </p>
            </div>
            
            {test.time_limit_minutes && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">
                  Você tem {test.time_limit_minutes} minutos para completar o teste.
                </p>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">
                A nota mínima para aprovação é {test.passing_percentage}%.
              </p>
            </div>
            
            {test.max_attempts && test.max_attempts > 1 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">
                  Você pode fazer o teste até {test.max_attempts} vezes.
                </p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">
                Certifique-se de ter uma conexão estável com a internet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/aluno/testes")}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleStartTest} 
            disabled={isStarting}
            className="flex-1"
          >
            {isStarting ? "Iniciando..." : "Iniciar Teste"}
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default StudentTest;