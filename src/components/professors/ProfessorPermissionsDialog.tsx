import { useEffect, useState } from "react";
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
import { 
  useProfessorPermissions, 
  useBulkUpdateProfessorPermissions,
  SYSTEM_MODULES,
  MODULE_FIELDS 
} from "@/hooks/useProfessorPermissions";
import { useProfessors } from "@/hooks/useProfessors";

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

const ProfessorPermissionsDialog = ({ 
  professorId, 
  open, 
  onOpenChange 
}: ProfessorPermissionsDialogProps) => {
  const [permissions, setPermissions] = useState<ModulePermissions>({});
  
  const { data: professors = [] } = useProfessors();
  const { data: existingPermissions = [] } = useProfessorPermissions(professorId);
  const bulkUpdateMutation = useBulkUpdateProfessorPermissions();

  const professor = professors.find(p => p.id === professorId);

  useEffect(() => {
    if (existingPermissions.length > 0) {
      const permissionsMap: ModulePermissions = {};
      
      existingPermissions.forEach(perm => {
        permissionsMap[perm.module_name] = {
          canView: perm.can_view,
          canEdit: perm.can_edit,
          enabledFields: perm.enabled_fields || {}
        };
      });
      
      setPermissions(permissionsMap);
    } else {
      // Initialize with default permissions (all false)
      const defaultPermissions: ModulePermissions = {};
      SYSTEM_MODULES.forEach(module => {
        defaultPermissions[module.value] = {
          canView: false,
          canEdit: false,
          enabledFields: {}
        };
      });
      setPermissions(defaultPermissions);
    }
  }, [existingPermissions]);

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

        <div className="space-y-4">
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
        </div>

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