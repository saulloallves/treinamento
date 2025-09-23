import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, BookOpen, ChevronRight, ClipboardList } from "lucide-react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { useState } from "react";
import TurmaStatusFilters from "@/components/common/TurmaStatusFilters";

interface StudentTurmasListProps {
  showQuizLink?: boolean;
}

const StudentTurmasList = ({ showQuizLink = false }: StudentTurmasListProps) => {
  const { data: enrollments, isLoading, error } = useMyEnrollments();
  const [statusFilter, setStatusFilter] = useState("ativas");

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

  // Filtrar apenas inscrições que têm turma_id e aplicar filtro de status
  const turmaEnrollments = enrollments?.filter(enrollment => {
    if (!enrollment.turma_id) return false;
    
    const turmaStatus = enrollment.turma?.status;
    if (statusFilter === "ativas") {
      // Default active view: show 'em_andamento' and 'agendada' only
      return turmaStatus === 'em_andamento' || turmaStatus === 'agendada';
    } else if (statusFilter === "arquivadas") {
      // Archive view: show 'encerrada' and 'cancelada'
      return turmaStatus === 'encerrada' || turmaStatus === 'cancelada';
    } else {
      // Specific status filter
      return turmaStatus === statusFilter;
    }
  }) || [];

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
    <div className="space-y-6">
      {/* Quick Status Filters */}
      <TurmaStatusFilters 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {turmaEnrollments.map((enrollment) => (
        <Link 
          key={enrollment.id} 
          to={showQuizLink 
            ? `/aluno/turma/${enrollment.turma_id}/quiz`
            : `/aluno/turma/${enrollment.turma_id}/testes`
          }
          className="block"
        >
          <Card className="transition-all hover:shadow-md cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {enrollment.turma?.name || enrollment.turma?.code || `Turma ${enrollment.turma_id}`}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.course?.name || 'Curso'}
                  </p>
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
              {/* Data de Conclusão */}
              {enrollment.turma?.completion_deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Prazo: {new Date(enrollment.turma.completion_deadline).toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              {/* Indicador de Testes ou Quizzes */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {showQuizLink ? (
                  <>
                    <BookOpen className="h-4 w-4" />
                    <span>Quizzes disponíveis</span>
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4" />
                    <span>Testes disponíveis</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      </div>
    </div>
  );
};

export default StudentTurmasList;