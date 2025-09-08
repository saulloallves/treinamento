import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useProfessorPermissions, 
  useBulkUpdateProfessorPermissions,
  SYSTEM_MODULES,
  MODULE_FIELDS 
} from "@/hooks/useProfessorPermissions";
import { useProfessors } from "@/hooks/useProfessors";
import { useProfessorTurmaPermissions, useBulkUpdateProfessorTurmaPermissions } from "@/hooks/useProfessorTurmaPermissions";
import ProfessorTurmaPermissions from "./ProfessorTurmaPermissions";

interface ProfessorPermissionsDialogProps {
  professorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModulePermissions = {
  [moduleName: string]: {
    canView: boolean;
    canEdit: boolean;
    enabledFields: Record<string, boolean>;
  };
};

type TurmaPermission = {
  turmaId: string;
  turmaName: string;
  canView: boolean;
  canEdit: boolean;
  canManageStudents: boolean;
};

const ProfessorPermissionsDialog = ({ 
  professorId, 
  open, 
  onOpenChange 
}: ProfessorPermissionsDialogProps) => {
  const [permissions, setPermissions] = useState<ModulePermissions>({});
  const [turmaPermissions, setTurmaPermissions] = useState<TurmaPermission[]>([]);
  
  const { data: professors = [] } = useProfessors();
  const { data: existingPermissions = [] } = useProfessorPermissions(professorId);
  const { data: existingTurmaPermissions = [] } = useProfessorTurmaPermissions(professorId);
  const bulkUpdateMutation = useBulkUpdateProfessorPermissions();
  const turmaUpdateMutation = useBulkUpdateProfessorTurmaPermissions();

  const professor = professors.find(p => p.id === professorId);

  const queryClient = useQueryClient();
  useEffect(() => {
    if (open && professorId) {
      queryClient.invalidateQueries({ queryKey: ["professor-permissions", professorId] });
      queryClient.invalidateQueries({ queryKey: ["professor-turma-permissions", professorId] });
    }
  }, [open, professorId, queryClient]);

  // Helpers to normalize legacy/translated module names
  const normalizeModuleName = (name: string): string => {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, string> = {
      // Portuguese -> English canonical keys
      'dashboard': 'dashboard',
      'painel': 'dashboard',
      'cursos': 'courses',
      'curso': 'courses',
      'courses': 'courses',
      'aulas': 'lessons',
      'lessons': 'lessons',
      'turmas': 'turmas',
      'classes': 'turmas',
      'inscricoes': 'enrollments',
      'inscricoes_': 'enrollments',
      'enrollments': 'enrollments',
      'presenca': 'attendance',
      'attendance': 'attendance',
      'progresso': 'progress',
      'progress': 'progress',
      'quiz': 'quiz',
      'certificados': 'certificates',
      'certificado': 'certificates',
      'certificates': 'certificates',
      'comunicacao': 'communication',
      'communication': 'communication',
      'configuracoes': 'settings',
      'settings': 'settings',
    };
    return map[base] || base;
  };

  // Load existing module permissions
  useEffect(() => {
    console.log('Loading professor permissions for:', professorId);
    console.log('Existing permissions:', existingPermissions);

    // Start with defaults for all modules so UI always has a defined object
    const defaults: ModulePermissions = {};
    const defaultEnabledModules = new Set([
      'courses', 'lessons', 'turmas', 'enrollments', 'attendance', 'quiz', 'certificates', 'communication'
    ]);
    SYSTEM_MODULES.forEach((m) => {
      const enabledByDefault = defaultEnabledModules.has(m.value);
      defaults[m.value] = { canView: enabledByDefault, canEdit: enabledByDefault, enabledFields: {} };
    });

    if (existingPermissions.length > 0) {
      const permissionsMap: ModulePermissions = { ...defaults };

      existingPermissions.forEach((perm) => {
        const key = normalizeModuleName(perm.module_name);
        if (!permissionsMap[key]) {
          permissionsMap[key] = { canView: false, canEdit: false, enabledFields: {} };
        }
        permissionsMap[key] = {
          canView: !!perm.can_view,
          canEdit: !!perm.can_edit,
          enabledFields: perm.enabled_fields || {},
        };
      });

      setPermissions(permissionsMap);
    } else {
      setPermissions(defaults);
    }
  }, [existingPermissions, professorId]);

  // Load existing turma permissions and merge with responsible turmas
  useEffect(() => {
    const loadTurmaPermissions = async () => {
      console.log('Loading turma permissions for:', professorId);
      console.log('Existing turma permissions:', existingTurmaPermissions);

      // Start from existing saved permissions
      let turmaPerms: TurmaPermission[] = (existingTurmaPermissions || []).map(perm => ({
        turmaId: perm.turma_id,
        turmaName: '', // Will be filled by ProfessorTurmaPermissions component
        canView: !!perm.can_view,
        canEdit: !!perm.can_edit,
        canManageStudents: !!perm.can_manage_students,
      }));

      // Merge with turmas where the professor is responsible
      try {
        if (professorId) {
          const { data: responsibleTurmas, error } = await supabase
            .from('turmas')
            .select('id,name')
            .eq('responsavel_user_id', professorId);

          if (error) {
            console.error('Error fetching responsible turmas:', error);
          } else if (responsibleTurmas) {
            const existingIds = new Set(turmaPerms.map(tp => tp.turmaId));
            responsibleTurmas.forEach((t: any) => {
              if (!existingIds.has(t.id)) {
                turmaPerms.push({
                  turmaId: t.id,
                  turmaName: t.name || '',
                  canView: true,
                  canEdit: true,
                  canManageStudents: true,
                });
              } else {
                turmaPerms = turmaPerms.map(tp =>
                  tp.turmaId === t.id
                    ? { ...tp, turmaName: tp.turmaName || t.name || '', canView: true, canEdit: true, canManageStudents: true }
                    : tp
                );
              }
            });
          }
        }
      } catch (e) {
        console.error('Unexpected error loading responsible turmas:', e);
      }

      setTurmaPermissions(turmaPerms);
    };

    loadTurmaPermissions();
  }, [existingTurmaPermissions, professorId]);

  const handleModuleToggle = (moduleName: string, type: 'view' | 'edit', value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        canView: type === 'view' ? value : prev[moduleName]?.canView || false,
        canEdit: type === 'edit' ? value : prev[moduleName]?.canEdit || false,
        enabledFields: prev[moduleName]?.enabledFields || {}
      }
    }));

    // If disabling view, also disable edit
    if (type === 'view' && !value) {
      setPermissions(prev => ({
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          canView: false,
          canEdit: false,
          enabledFields: {}
        }
      }));
    }
  };

  const handleFieldToggle = (moduleName: string, fieldName: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        enabledFields: {
          ...prev[moduleName]?.enabledFields,
          [fieldName]: value
        }
      }
    }));
  };

  const handleTurmaPermissionChange = (turmaId: string, permission: keyof TurmaPermission, value: boolean) => {
    setTurmaPermissions(prev => {
      const existing = prev.find(p => p.turmaId === turmaId);
      
      if (existing) {
        return prev.map(p => 
          p.turmaId === turmaId 
            ? { ...p, [permission]: value }
            : p
        );
      } else {
        return [...prev, {
          turmaId,
          turmaName: '',
          canView: permission === 'canView' ? value : false,
          canEdit: permission === 'canEdit' ? value : false,
          canManageStudents: permission === 'canManageStudents' ? value : false,
        }];
      }
    });

    // If disabling view, also disable edit and manage
    if (permission === 'canView' && !value) {
      setTurmaPermissions(prev => 
        prev.map(p => 
          p.turmaId === turmaId 
            ? { ...p, canView: false, canEdit: false, canManageStudents: false }
            : p
        )
      );
    }
  };

  const handleSave = async () => {
    if (!professorId) return;

    const permissionsArray = Object.entries(permissions).map(([moduleName, modulePerms]) => ({
      moduleName,
      canView: modulePerms.canView,
      canEdit: modulePerms.canEdit,
      enabledFields: modulePerms.enabledFields
    }));

    try {
      await bulkUpdateMutation.mutateAsync({
        professorId,
        permissions: permissionsArray
      });
      
      // Save turma permissions
      if (turmaPermissions.length > 0) {
        await turmaUpdateMutation.mutateAsync({
          professorId,
          permissions: turmaPermissions.map(tp => ({
            turmaId: tp.turmaId,
            canView: tp.canView,
            canEdit: tp.canEdit,
            canManageStudents: tp.canManageStudents,
          }))
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (!professor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Configure as permissões de acesso para <strong>{professor.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Módulos do Sistema</TabsTrigger>
            <TabsTrigger value="turmas">Turmas Específicas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="space-y-4">
            {SYSTEM_MODULES.map((module) => {
              const modulePerms = permissions[module.value] || { canView: false, canEdit: false, enabledFields: {} };
              const moduleFields = MODULE_FIELDS[module.value] || [];

              return (
                <Card key={module.value}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {module.label}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${module.value}-view`}
                            checked={modulePerms.canView}
                            onCheckedChange={(checked) => 
                              handleModuleToggle(module.value, 'view', checked)
                            }
                          />
                          <Label htmlFor={`${module.value}-view`}>Visualizar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${module.value}-edit`}
                            checked={modulePerms.canEdit}
                            disabled={!modulePerms.canView}
                            onCheckedChange={(checked) => 
                              handleModuleToggle(module.value, 'edit', checked)
                            }
                          />
                          <Label htmlFor={`${module.value}-edit`}>Editar</Label>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  {modulePerms.canView && moduleFields.length > 0 && (
                    <CardContent>
                      <Separator className="mb-4" />
                      <div>
                        <Label className="text-sm font-medium">Campos Habilitados:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {moduleFields.map((field) => (
                            <Badge
                              key={field}
                              variant={modulePerms.enabledFields[field] ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => 
                                handleFieldToggle(module.value, field, !modulePerms.enabledFields[field])
                              }
                            >
                              {field.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="turmas">
            <ProfessorTurmaPermissions
              professorId={professorId || ''}
              permissions={turmaPermissions}
              onPermissionChange={handleTurmaPermissionChange}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={bulkUpdateMutation.isPending}
          >
            {bulkUpdateMutation.isPending ? "Salvando..." : "Salvar Permissões"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessorPermissionsDialog;