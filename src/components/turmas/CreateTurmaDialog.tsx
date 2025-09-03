import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateTurma } from "@/hooks/useTurmas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateTurmaDialogProps {
  courseId: string;
}

export const CreateTurmaDialog = ({ courseId }: CreateTurmaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    responsavel_user_id: "",
    completion_deadline: "",
    capacity: ""
  });

  const createTurma = useCreateTurma();

  // Fetch professors for the dropdown
  const { data: professors } = useQuery({
    queryKey: ['professors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('user_type', 'Professor')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.responsavel_user_id || !formData.completion_deadline) {
      return;
    }

    try {
      await createTurma.mutateAsync({
        course_id: courseId,
        name: formData.name || undefined,
        code: formData.code || undefined,
        responsavel_user_id: formData.responsavel_user_id,
        completion_deadline: formData.completion_deadline,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      });
      
      setFormData({
        name: "",
        code: "",
        responsavel_user_id: "",
        completion_deadline: "",
        capacity: ""
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating turma:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Turma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Turma (opcional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Turma Janeiro 2024"
            />
          </div>
          
          <div>
            <Label htmlFor="code">Código (opcional)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ex: T001"
            />
          </div>

          <div>
            <Label htmlFor="responsavel">Responsável (Professor) *</Label>
            <Select
              value={formData.responsavel_user_id}
              onValueChange={(value) => setFormData({ ...formData, responsavel_user_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um professor" />
              </SelectTrigger>
              <SelectContent>
                {professors?.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.name} ({professor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="completion_deadline">Prazo de Conclusão *</Label>
            <Input
              id="completion_deadline"
              type="date"
              value={formData.completion_deadline}
              onChange={(e) => setFormData({ ...formData, completion_deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="capacity">Capacidade (opcional)</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="Ex: 30"
              min="1"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createTurma.isPending || !formData.responsavel_user_id || !formData.completion_deadline}
            >
              {createTurma.isPending ? "Criando..." : "Criar Turma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};