import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Users, BookOpen } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import CreateClassDialog from "./CreateClassDialog";
import ClassDetailsDialog from "./ClassDetailsDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClassesList = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: currentUser } = useCurrentUser();
  const { data: isAdmin = false } = useIsAdmin(currentUser?.id);
  
  const filters = {
    ...(statusFilter && { status: statusFilter as 'criada' | 'iniciada' | 'encerrada' }),
    ...(!isAdmin && currentUser?.id && { responsible_id: currentUser.id })
  };
  
  const { data: classes = [], isLoading } = useClasses(filters);

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'criada': return 'outline';
      case 'iniciada': return 'default';
      case 'encerrada': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'criada': return 'Criada';
      case 'iniciada': return 'Em Andamento';
      case 'encerrada': return 'Encerrada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Turmas</h2>
          <p className="text-muted-foreground">
            Gerencie turmas de cursos e acompanhe o progresso dos alunos
          </p>
        </div>
        {(isAdmin || currentUser?.user_type === 'Professor') && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        )}
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da turma ou curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Status</SelectItem>
            <SelectItem value="criada">Criada</SelectItem>
            <SelectItem value="iniciada">Em Andamento</SelectItem>
            <SelectItem value="encerrada">Encerrada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter 
                ? "Não há turmas que correspondam aos filtros aplicados."
                : "Ainda não há turmas criadas. Crie a primeira turma para começar."
              }
            </p>
            {(isAdmin || currentUser?.user_type === 'Professor') && !searchTerm && !statusFilter && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Turma
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <Card 
              key={cls.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedClassId(cls.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{cls.name}</CardTitle>
                  <Badge variant={getStatusVariant(cls.status)}>
                    {getStatusLabel(cls.status)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {cls.course?.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {cls.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {cls.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{cls.student_count || 0}/{cls.max_students}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(cls.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Responsável: </span>
                  <span className="font-medium">{cls.responsible?.name}</span>
                </div>

                {cls.status === 'iniciada' && cls.started_at && (
                  <div className="text-sm text-green-600">
                    Iniciada em {format(new Date(cls.started_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}

                {cls.status === 'encerrada' && cls.ended_at && (
                  <div className="text-sm text-muted-foreground">
                    Encerrada em {format(new Date(cls.ended_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateClassDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />

      {selectedClassId && (
        <ClassDetailsDialog
          classId={selectedClassId}
          open={!!selectedClassId}
          onOpenChange={(open) => !open && setSelectedClassId(null)}
        />
      )}
    </div>
  );
};

export default ClassesList;