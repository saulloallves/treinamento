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
          <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrollments.map((enroll) => (
              <Card key={enroll.id} className="overflow-hidden">
                {enroll.course?.cover_image_url && (
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={enroll.course.cover_image_url} 
                      alt={enroll.course.name || "Capa do curso"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-tight">{enroll.course?.name ?? "Curso"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{enroll.status}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tipo</span>
                    <Badge variant="secondary" className="text-xs h-5">
                      {enroll.course?.tipo === 'gravado' ? 'Treinamento' : 'Curso'}
                    </Badge>
                  </div>
                  
                  {/* Informações da Turma */}
                  {enroll.turma && (
                    <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium truncate">
                          {enroll.turma.name || enroll.turma.code || `Turma ${enroll.turma.id.slice(0, 8)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>{format(new Date(enroll.turma.completion_deadline), "dd/MM/yy", { locale: ptBR })}</span>
                        </div>
                        <Badge variant={
                          enroll.turma.status === 'em_andamento' ? 'default' : 
                          enroll.turma.status === 'encerrada' ? 'outline' : 
                          enroll.turma.status === 'cancelada' ? 'destructive' : 'secondary'
                        } className="text-xs h-4 px-1">
                          {enroll.turma.status === 'agendada' ? 'Agendada' :
                           enroll.turma.status === 'em_andamento' ? 'Em Andamento' :
                           enroll.turma.status === 'encerrada' ? 'Encerrada' :
                           enroll.turma.status === 'cancelada' ? 'Cancelada' : enroll.turma.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <Progress value={enroll.progress_percentage ?? 0} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{enroll.progress_percentage ?? 0}%</span>
                    </div>
                  </div>
                  
                  {/* Controle de acesso baseado no status da turma */}
                  {enroll.turma?.status === 'encerrada' ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground mb-1">Turma encerrada</p>
                      <p className="text-xs text-muted-foreground">Acesso não disponível</p>
                    </div>
                  ) : enroll.turma?.status === 'cancelada' ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground mb-1">Turma cancelada</p>
                      <p className="text-xs text-muted-foreground">Acesso não disponível</p>
                    </div>
                  ) : (
                    <Button asChild variant="outline" className="w-full h-8 text-xs">
                      {enroll.course?.tipo === 'gravado' ? (
                        <Link to={`/aluno/curso/${enroll.course_id}/aulas-gravadas`}>Ver Aulas</Link>
                      ) : (
                        <Link to={`/aluno/curso/${enroll.course_id}`}>Marcar presença</Link>
                      )}
                    </Button>
                  )}
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
