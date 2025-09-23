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
        {/* Seção de Inscrições */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Minhas Inscrições</h3>
          {isLoading ? (
            <p>Carregando...</p>
          ) : (enrollments && enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {enrollments.map((enroll) => (
              <Card key={enroll.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {enroll.course?.cover_image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={enroll.course.cover_image_url} 
                      alt={enroll.course.name || "Capa do curso"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-3 space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                      {enroll.course?.name ?? "Curso"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs h-5 px-2">
                        {enroll.course?.tipo === 'gravado' ? 'Gravado' : 'Ao Vivo'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {enroll.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Informações da Turma - mais compacto */}
                  {enroll.turma && (
                    <div className="bg-muted/30 p-2 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium truncate">
                            {enroll.turma.name || enroll.turma.code || `Turma ${enroll.turma.id.slice(0, 8)}`}
                          </span>
                        </div>
                        <Badge variant={
                          enroll.turma.status === 'em_andamento' ? 'default' : 
                          enroll.turma.status === 'encerrada' ? 'outline' : 
                          enroll.turma.status === 'cancelada' ? 'destructive' : 'secondary'
                        } className="text-xs h-4 px-1">
                          {enroll.turma.status === 'agendada' ? 'Agendada' :
                           enroll.turma.status === 'em_andamento' ? 'Ativo' :
                           enroll.turma.status === 'encerrada' ? 'Encerrada' :
                           enroll.turma.status === 'cancelada' ? 'Cancelada' : enroll.turma.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Até {format(new Date(enroll.turma.completion_deadline), "dd/MM/yy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Progresso - mais compacto */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progresso</span>
                      <span className="text-xs font-medium">{enroll.progress_percentage ?? 0}%</span>
                    </div>
                    <Progress value={enroll.progress_percentage ?? 0} className="h-1.5" />
                  </div>
                  
                  {/* Botão de ação */}
                  <Button asChild variant="default" size="sm" className="w-full h-7 text-xs">
                    {enroll.course?.tipo === 'gravado' ? (
                      <Link to={`/aluno/curso/${enroll.course_id}/aulas-gravadas`}>Assistir Aulas</Link>
                    ) : (
                      <Link to={`/aluno/curso/${enroll.course_id}`}>Acessar Curso</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Você ainda não tem inscrições.</p>
              <Button onClick={() => setOpenEnroll(true)}>Autoinscrever-se</Button>
            </div>
          ))}
        </section>

      </main>
    </BaseLayout>
  );
};

export default StudentPortal;
