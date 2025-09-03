import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, User } from "lucide-react";
import { useTurmas, useEnrollInTurma } from "@/hooks/useTurmas";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TurmaEnrollmentCardProps {
  courseId: string;
  courseName: string;
}

export const TurmaEnrollmentCard = ({ courseId, courseName }: TurmaEnrollmentCardProps) => {
  const { data: turmas, isLoading } = useTurmas(courseId);
  const { data: currentUser } = useCurrentUser();
  const enrollInTurma = useEnrollInTurma();

  const handleEnroll = async (turmaId: string) => {
    if (!currentUser?.id) return;

    try {
      await enrollInTurma.mutateAsync({
        turmaId,
        studentId: currentUser.id,
        courseId
      });
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Carregando turmas disponíveis...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show only scheduled classes that are available for enrollment
  const availableTurmas = turmas?.filter(turma => turma.status === 'agendada') || [];

  if (availableTurmas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Turmas Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Não há turmas abertas para inscrição no momento.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Turmas Disponíveis - {courseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableTurmas.map((turma) => (
          <div key={turma.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {turma.name && (
                    <h4 className="font-medium">{turma.name}</h4>
                  )}
                  {turma.code && (
                    <Badge variant="outline">{turma.code}</Badge>
                  )}
                  <Badge variant="secondary">Agendada</Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{turma.responsavel_user?.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Prazo: {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {turma.enrollments_count || 0} inscritos
                      {turma.capacity && ` de ${turma.capacity}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handleEnroll(turma.id)}
                disabled={enrollInTurma.isPending}
                className="ml-4"
              >
                {enrollInTurma.isPending ? "Inscrevendo..." : "Inscrever-se"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};