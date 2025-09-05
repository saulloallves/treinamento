import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MyTurmaCardProps {
  turma: {
    id: string;
    name?: string;
    code?: string;
    status: string;
    completion_deadline: string;
    start_at?: string;
    end_at?: string;
    responsavel_name?: string;
    responsavel_user?: {
      name: string;
      email: string;
    };
  };
  courseName: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'agendada':
      return <Badge variant="secondary">Agendada</Badge>;
    case 'em_andamento':
      return <Badge variant="default">Em Andamento</Badge>;
    case 'encerrada':
      return <Badge variant="outline">Encerrada</Badge>;
    case 'cancelada':
      return <Badge variant="destructive">Cancelada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const MyTurmaCard = ({ turma, courseName }: MyTurmaCardProps) => {
  // Format professor name: prioritize responsavel_name, fallback to responsavel_user.name
  const formatProfessorName = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length <= 2) return name;
    
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return `${firstName} ${lastName}`;
  };

  const professorName = turma.responsavel_name 
    ? formatProfessorName(turma.responsavel_name)
    : turma.responsavel_user?.name 
      ? formatProfessorName(turma.responsavel_user.name)
      : 'Professor';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Minha Turma - {courseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {turma.name && (
              <h4 className="font-medium">{turma.name}</h4>
            )}
          </div>
          {getStatusBadge(turma.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Professor: {professorName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              Prazo: {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          
          {turma.start_at && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                Iniciada: {format(new Date(turma.start_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>Turma em andamento</span>
          </div>
        </div>
        
        {turma.status === 'em_andamento' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✅ Turma em andamento! Acompanhe as aulas e marque sua presença.
            </p>
          </div>
        )}
        
        {turma.status === 'encerrada' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">
              🎓 Turma encerrada! Verifique se você tem direito ao certificado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};