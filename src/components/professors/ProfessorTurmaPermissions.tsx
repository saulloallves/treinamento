import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfessorTurmaPermissionsProps {
  professorId: string;
  permissions: TurmaPermission[];
  onPermissionChange: (turmaId: string, permission: keyof TurmaPermission, value: boolean) => void;
}

type TurmaPermission = {
  turmaId: string;
  turmaName: string;
  canView: boolean;
  canEdit: boolean;
  canManageStudents: boolean;
};

const ProfessorTurmaPermissions = ({ 
  professorId, 
  permissions = [], 
  onPermissionChange 
}: ProfessorTurmaPermissionsProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all turmas
  const { data: turmas = [], isLoading } = useQuery({
    queryKey: ["turmas-for-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turmas")
        .select(`
          id,
          name,
          code,
          status,
          course_id,
          courses(name)
        `)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Filter turmas based on search
  const filteredTurmas = turmas.filter(turma => 
    turma.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.courses?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTurmaPermission = (turmaId: string): TurmaPermission => {
    const existing = permissions.find(p => p.turmaId === turmaId);
    const turma = turmas.find(t => t.id === turmaId);
    
    return {
      turmaId,
      turmaName: turma?.name || '',
      canView: existing?.canView || false,
      canEdit: existing?.canEdit || false,
      canManageStudents: existing?.canManageStudents || false,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome da turma, código ou curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Turmas List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTurmas.map((turma) => {
          const permission = getTurmaPermission(turma.id);
          
          return (
            <Card key={turma.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{turma.name || turma.code}</h4>
                    <Badge variant="outline" className="text-xs">
                      {turma.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Curso: {turma.courses?.name}
                  </p>
                  {turma.code && (
                    <p className="text-xs text-muted-foreground">
                      Código: {turma.code}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${turma.id}-view`}
                      checked={permission.canView}
                      onCheckedChange={(checked) => 
                        onPermissionChange(turma.id, 'canView', checked)
                      }
                    />
                    <Label htmlFor={`${turma.id}-view`} className="text-xs">
                      Visualizar
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${turma.id}-edit`}
                      checked={permission.canEdit}
                      disabled={!permission.canView}
                      onCheckedChange={(checked) => 
                        onPermissionChange(turma.id, 'canEdit', checked)
                      }
                    />
                    <Label htmlFor={`${turma.id}-edit`} className="text-xs">
                      Editar
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${turma.id}-manage`}
                      checked={permission.canManageStudents}
                      disabled={!permission.canView}
                      onCheckedChange={(checked) => 
                        onPermissionChange(turma.id, 'canManageStudents', checked)
                      }
                    />
                    <Label htmlFor={`${turma.id}-manage`} className="text-xs">
                      Gerenciar Alunos
                    </Label>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTurmas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhuma turma encontrada com esse termo" : "Nenhuma turma disponível"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessorTurmaPermissions;