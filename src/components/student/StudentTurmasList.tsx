import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, BookOpen, ChevronRight, ClipboardList } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import SkeletonCard from "@/components/mobile/SkeletonCard";

const StudentTurmasList = () => {
  const { data: enrollments, isLoading, error } = useMyEnrollments();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'agendada':
        return 'Agendada';
      case 'encerrada':
        return 'Encerrada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-green-500';
      case 'agendada':
        return 'bg-blue-500';
      case 'encerrada':
        return 'bg-gray-500';
      case 'cancelada':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {turmaEnrollments.map((enrollment) => (
        <Card 
          key={enrollment.id} 
          className="transition-all hover:shadow-md cursor-pointer group"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {enrollment.turma?.name || enrollment.turma?.code || `Turma ${enrollment.turma_id}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {enrollment.course?.name || 'Curso'}
                </p>
                {enrollment.turma?.code && (
                  <Badge variant="outline" className="text-xs">
                    {enrollment.turma.code}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(enrollment.turma?.status || '')} text-white`}
                >
                  {getStatusText(enrollment.turma?.status || '')}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progresso */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Progresso Geral</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conclusão</span>
                  <span className="font-medium">{enrollment.progress_percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${enrollment.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Data de Conclusão */}
            {enrollment.turma?.completion_deadline && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Prazo: {new Date(enrollment.turma.completion_deadline).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            {/* Botão para Ver Testes */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                <span>Testes disponíveis</span>
              </div>
              
              <Button 
                asChild
                variant="outline" 
                size="sm" 
                className="text-xs"
              >
                <Link to={`/aluno/turma/${enrollment.turma_id}/testes`}>
                  Ver Testes Avaliativos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentTurmasList;