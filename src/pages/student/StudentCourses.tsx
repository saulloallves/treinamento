import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import { useMyEnrollments, type MyEnrollment } from "@/hooks/useMyEnrollments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const StudentCourses = () => {
  const { data, isLoading } = useMyEnrollments();
  const enrollments: MyEnrollment[] = (data ?? []) as MyEnrollment[];

  useEffect(() => {
    document.title = "Meus Cursos | Cresci e Perdi";
  }, []);

  return (
    <BaseLayout title="Meus Cursos" showBottomNav>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Meus Cursos</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando cursos...</p>
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <CardTitle className="text-lg">{enroll.course?.name ?? "Curso"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline">{enroll.status}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <Badge variant="secondary">
                      {enroll.course?.tipo === 'gravado' ? 'Treinamento' : 'Curso'}
                    </Badge>
                  </div>
                  
                  {enroll.turma && (
                    <div className="bg-muted/50 p-3 rounded-md space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {enroll.turma.name || enroll.turma.code || `Turma ${enroll.turma.id.slice(0, 8)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(enroll.turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <Badge variant={
                          enroll.turma.status === 'em_andamento' ? 'default' : 
                          enroll.turma.status === 'encerrada' ? 'outline' : 
                          enroll.turma.status === 'cancelada' ? 'destructive' : 'secondary'
                        }>
                          {enroll.turma.status === 'agendada' ? 'Agendada' :
                           enroll.turma.status === 'em_andamento' ? 'Em Andamento' :
                           enroll.turma.status === 'encerrada' ? 'Encerrada' :
                           enroll.turma.status === 'cancelada' ? 'Cancelada' : enroll.turma.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <Button asChild className="w-full">
                    {enroll.course?.tipo === 'gravado' ? (
                      <Link to={`/aluno/curso/${enroll.course_id}/aulas-gravadas`}>Ver Aulas</Link>
                    ) : (
                      <Link to={`/aluno/curso/${enroll.course_id}`}>Acessar Curso</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground">Você ainda não está inscrito em nenhum curso.</p>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default StudentCourses;