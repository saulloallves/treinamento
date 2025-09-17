import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import SkeletonCard from "@/components/mobile/SkeletonCard";

const StudentTurmasList = () => {
  const { data: enrollments, isLoading, error } = useMyEnrollments();

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar suas turmas.</p>
      </div>
    );
  }

  // Filtrar apenas inscrições que têm turma_id
  const turmaEnrollments = enrollments?.filter(enrollment => enrollment.turma_id) || [];

  if (turmaEnrollments.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl">👥</div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Nenhuma turma encontrada</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Você não está inscrito em nenhuma turma no momento. Entre em contato com seu professor para se inscrever.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {turmaEnrollments.map((enrollment) => (
        <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow">
          {enrollment.course?.cover_image_url && (
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img 
                src={enrollment.course.cover_image_url} 
                alt={enrollment.course.name || "Capa do curso"}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <CardTitle className="text-base leading-tight">
                {enrollment.turma?.name || enrollment.turma?.code || `Turma ${enrollment.turma_id}`}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Status da Turma */}
            <div className="flex items-center justify-between">
              <Badge variant={
                enrollment.turma?.status === 'em_andamento' ? 'default' :
                enrollment.turma?.status === 'agendada' ? 'secondary' : 'outline'
              }>
                {enrollment.turma?.status === 'em_andamento' ? 'Em Andamento' :
                 enrollment.turma?.status === 'agendada' ? 'Agendada' :
                 enrollment.turma?.status || 'Status'}
              </Badge>
            </div>

            {/* Informações do Curso */}
            {enrollment.course && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  <span className="font-medium">{enrollment.course.name}</span>
                </div>
              </div>
            )}

            {/* Data de Conclusão */}
            {enrollment.turma?.completion_deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Prazo: {new Date(enrollment.turma.completion_deadline).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            {/* Progresso */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{enrollment.progress_percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${enrollment.progress_percentage}%` }}
                />
              </div>
            </div>

            {/* Botão para Ver Testes */}
            <Button asChild variant="outline" className="w-full h-8 text-xs">
              <Link to={`/aluno/turma/${enrollment.turma_id}/testes`}>
                Ver Testes Avaliativos
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentTurmasList;