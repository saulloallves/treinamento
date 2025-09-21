import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  GripVertical,
  RotateCcw
} from "lucide-react";
import { useKanbanColumns, KanbanColumn } from "@/hooks/useKanbanColumns";
import { CreateColumnDialog } from "./CreateColumnDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface KanbanColumnManagerProps {
  onColumnsChange?: (columns: KanbanColumn[]) => void;
}

export const KanbanColumnManager = ({ onColumnsChange }: KanbanColumnManagerProps) => {
  const { 
    columns, 
    addColumn, 
    updateColumn, 
    deleteColumn, 
    reorderColumns, 
    resetToDefault 
  } = useKanbanColumns();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<KanbanColumn | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<KanbanColumn | null>(null);

  // Notify parent component of changes
  React.useEffect(() => {
    onColumnsChange?.(columns);
  }, [columns, onColumnsChange]);

  const handleCreateColumn = (columnData: Omit<KanbanColumn, 'id' | 'order'>) => {
    addColumn(columnData);
  };

  const handleUpdateColumn = (id: string, updates: Partial<KanbanColumn>) => {
    updateColumn(id, updates);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (column: KanbanColumn) => {
    if (column.isDefault) return;
    setColumnToDelete(column);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (columnToDelete) {
      deleteColumn(columnToDelete.id);
      setColumnToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, column: KanbanColumn) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn.id === targetColumn.id) return;

    const sourceIndex = columns.findIndex(c => c.id === draggedColumn.id);
    const targetIndex = columns.findIndex(c => c.id === targetColumn.id);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      reorderColumns(sourceIndex, targetIndex);
    }

    setDraggedColumn(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Gerenciar Colunas do Kanban</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Coluna
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {columns.map((column) => (
              <div
                key={column.id}
                draggable
                onDragStart={(e) => handleDragStart(e, column)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-move"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                
                <div className={`w-4 h-4 rounded ${column.headerColor}`} />
                
                <div className="flex-1">
                  <div className="font-medium">{column.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: {column.status}
                  </div>
                </div>

                {column.isDefault && (
                  <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                    Padrão
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingColumn(column)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {!column.isDefault && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteColumn(column)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateColumnDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateColumn={handleCreateColumn}
      />

      <CreateColumnDialog
        open={!!editingColumn}
        onOpenChange={(open) => !open && setEditingColumn(null)}
        onCreateColumn={handleCreateColumn}
        editingColumn={editingColumn}
        onUpdateColumn={handleUpdateColumn}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Coluna</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a coluna "{columnToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};