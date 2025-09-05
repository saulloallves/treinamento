import { useEffect, useState } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMyEnrollments, type MyEnrollment } from "@/hooks/useMyEnrollments";
import SelfEnrollDialog from "@/components/student/SelfEnrollDialog";
import { Link } from "react-router-dom";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
const StudentPortal = () => {
  const { data, isLoading, refetch, isRefetching } = useMyEnrollments();
  const enrollments: MyEnrollment[] = (data ?? []) as MyEnrollment[];
  const [openEnroll, setOpenEnroll] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Área do Aluno | Cresci e Perdi";
    console.log('StudentPortal loaded successfully');
  }, []);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  console.log('StudentPortal render:', {
    isLoading,
    enrollmentsCount: enrollments.length,
    enrollments
  });
  return (
    <BaseLayout title="Área do Aluno">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Minhas inscrições</h2>
        <div className="flex items-center gap-2">
          <RefreshButton 
            onClick={handleRefresh} 
            isRefreshing={isRefetching}
          />
          <Button onClick={() => setOpenEnroll(true)}>Autoinscrição</Button>
        </div>
      </header>

      <SelfEnrollDialog open={openEnroll} onOpenChange={setOpenEnroll} />

      <main>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (enrollments && enrollments.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enroll) => (
              <Card key={enroll.id}>
                <CardHeader>
                  <CardTitle>{enroll.course?.name ?? "Curso"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status</span>
                      <span className="font-medium">{enroll.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Tipo</span>
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                        enroll.course?.tipo === 'gravado' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {enroll.course?.tipo === 'gravado' ? 'Treinamento' : 'Curso'}
                      </span>
                    </div>
                    
                    {/* Informações da Turma */}
                    {enroll.turma && (
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            Turma: {enroll.turma.name || enroll.turma.code || `Turma ${enroll.turma.id.slice(0, 8)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Prazo: {format(new Date(enroll.turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status da Turma:</span>
                          <Badge variant={
                            enroll.turma.status === 'em_andamento' ? 'default' : 
                            enroll.turma.status === 'encerrada' ? 'outline' : 
                            enroll.turma.status === 'cancelada' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {enroll.turma.status === 'agendada' ? 'Agendada' :
                             enroll.turma.status === 'em_andamento' ? 'Em Andamento' :
                             enroll.turma.status === 'encerrada' ? 'Encerrada' :
                             enroll.turma.status === 'cancelada' ? 'Cancelada' : enroll.turma.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <Progress value={enroll.progress_percentage ?? 0} />
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">{enroll.progress_percentage ?? 0}%</span>
                    </div>
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        {enroll.course?.tipo === 'gravado' ? (
                          <Link to={`/aluno/curso/${enroll.course_id}/aulas-gravadas`}>Ver Aulas</Link>
                        ) : (
                          <Link to={`/aluno/curso/${enroll.course_id}`}>Ver curso</Link>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : (
          <section className="text-center py-10">
            <p className="text-muted-foreground mb-4">Você ainda não tem inscrições.</p>
            <Button onClick={() => setOpenEnroll(true)}>Autoinscrever-se</Button>
          </section>
        ))}
      </main>
    </BaseLayout>
  );
};

export default StudentPortal;
