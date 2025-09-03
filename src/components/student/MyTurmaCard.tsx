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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Minha Turma - {courseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {turma.name && (
              <h4 className="font-medium">{turma.name}</h4>
            )}
            {turma.code && (
              <div className="text-sm text-muted-foreground">
                Código: {turma.code}
              </div>
            )}
          </div>
          {getStatusBadge(turma.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Professor: {turma.responsavel_user?.name}</span>
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