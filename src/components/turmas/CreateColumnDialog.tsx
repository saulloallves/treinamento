import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KanbanColumn } from "@/hooks/useKanbanColumns";

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateColumn: (column: Omit<KanbanColumn, 'id' | 'order'>) => void;
  editingColumn?: KanbanColumn | null;
  onUpdateColumn?: (id: string, updates: Partial<KanbanColumn>) => void;
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-50 border-blue-200', header: 'bg-blue-500', name: 'Azul' },
  { value: 'bg-orange-50 border-orange-200', header: 'bg-orange-500', name: 'Laranja' },
  { value: 'bg-purple-50 border-purple-200', header: 'bg-purple-500', name: 'Roxo' },
  { value: 'bg-green-50 border-green-200', header: 'bg-green-500', name: 'Verde' },
  { value: 'bg-red-50 border-red-200', header: 'bg-red-500', name: 'Vermelho' },
  { value: 'bg-yellow-50 border-yellow-200', header: 'bg-yellow-500', name: 'Amarelo' },
  { value: 'bg-indigo-50 border-indigo-200', header: 'bg-indigo-500', name: 'Índigo' },
  { value: 'bg-pink-50 border-pink-200', header: 'bg-pink-500', name: 'Rosa' },
  { value: 'bg-gray-50 border-gray-200', header: 'bg-gray-500', name: 'Cinza' },
];

export const CreateColumnDialog = ({
  open,
  onOpenChange,
  onCreateColumn,
  editingColumn,
  onUpdateColumn,
}: CreateColumnDialogProps) => {
  const [title, setTitle] = useState(editingColumn?.title || "");
  const [status, setStatus] = useState(editingColumn?.status || "");
  const [selectedColor, setSelectedColor] = useState(
    editingColumn?.color || COLOR_OPTIONS[0].value
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !status.trim()) return;

    const colorOption = COLOR_OPTIONS.find(c => c.value === selectedColor) || COLOR_OPTIONS[0];
    
    const columnData = {
      title: title.trim(),
      status: status.toLowerCase().replace(/\s+/g, '_'),
      color: colorOption.value,
      headerColor: colorOption.header,
      isDefault: false,
    };

    if (editingColumn && onUpdateColumn) {
      onUpdateColumn(editingColumn.id, columnData);
    } else {
      onCreateColumn(columnData);
    }

    // Reset form
    setTitle("");
    setStatus("");
    setSelectedColor(COLOR_OPTIONS[0].value);
    onOpenChange(false);
  };

  const handleClose = () => {
    setTitle(editingColumn?.title || "");
    setStatus(editingColumn?.status || "");
    setSelectedColor(editingColumn?.color || COLOR_OPTIONS[0].value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingColumn ? 'Editar Coluna' : 'Nova Coluna'}
          </DialogTitle>
          <DialogDescription>
            {editingColumn 
              ? 'Edite as informações da coluna do Kanban.'
              : 'Crie uma nova coluna para organizar suas turmas no Kanban.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Coluna</Label>
            <Input
              id="title"
              placeholder="Ex: Aguardando Aprovação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status (Identificador)</Label>
            <Input
              id="status"
              placeholder="Ex: aguardando_aprovacao"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              disabled={editingColumn?.isDefault}
            />
            <p className="text-xs text-muted-foreground">
              Usado internamente para identificar o status das turmas
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cor da Coluna</Label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.header}`} />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingColumn ? 'Salvar Alterações' : 'Criar Coluna'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};