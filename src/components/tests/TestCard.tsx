import { useState } from "react";
import { FileText, Users, Calendar, Settings, Trash2, Eye, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Test, useDeleteTest, useUpdateTest } from "@/hooks/useTests";
import { formatDate } from "@/lib/dateUtils";

interface TestCardProps {
  test: Test;
  onViewDashboard: () => void;
}

const TestCard = ({ test, onViewDashboard }: TestCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteTest = useDeleteTest();
  const updateTest = useUpdateTest();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivado';
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'archived') => {
    try {
      await updateTest.mutateAsync({
        id: test.id,
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating test status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTest.mutateAsync(test.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <Badge variant="outline" className={getStatusColor(test.status)}>
                {getStatusText(test.status)}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDashboard}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Dashboard
                </DropdownMenuItem>
                {test.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Ativar Teste
                  </DropdownMenuItem>
                )}
                {test.status === 'active' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-lg">{test.name}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {test.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {test.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Curso:</span>
              <span className="font-medium">{test.courses?.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Turma:</span>
              <span className="font-medium">{test.turmas?.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Criado em:</span>
              <span className="font-medium">{formatDate(test.created_at)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {test.passing_percentage}%
              </div>
              <div className="text-xs text-muted-foreground">Taxa Aprovação</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {test._count?.test_questions || 0}
              </div>
              <div className="text-xs text-muted-foreground">Perguntas</div>
            </div>
          </div>

          <Button 
            onClick={onViewDashboard} 
            className="w-full" 
            variant="outline"
          >
            Ver Dashboard
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o teste "{test.name}"? Esta ação não pode ser desfeita.
              Todos os dados relacionados (perguntas, respostas e resultados) serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTest.isPending}
            >
              {deleteTest.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TestCard;