import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUpdateTurma } from "@/hooks/useTurmas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EditTurmaDialogProps {
  turma: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTurmaDialog = ({ turma, open, onOpenChange }: EditTurmaDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    responsavel_user_id: "",
    completion_deadline: "",
    enrollment_open_at: "",
    enrollment_close_at: "",
    capacity: ""
  });

  const updateTurma = useUpdateTurma();

  // Fetch professors/teachers
  const { data: professors = [] } = useQuery({
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

  // Populate form when turma data changes
  useEffect(() => {
    if (turma) {
      const formatDateTime = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format for datetime-local input
      };

      setFormData({
        name: turma.name || "",
        responsavel_user_id: turma.responsavel_user_id || "",
        completion_deadline: turma.completion_deadline ? new Date(turma.completion_deadline).toISOString().split('T')[0] : "",
        enrollment_open_at: formatDateTime(turma.enrollment_open_at),
        enrollment_close_at: formatDateTime(turma.enrollment_close_at),
        capacity: turma.capacity?.toString() || ""
      });
    }
  }, [turma]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.completion_deadline) {
      return;
    }

    const selectedProfessor = professors.find(p => p.id === formData.responsavel_user_id);
    
    const updateData = {
      id: turma.id,
      name: formData.name,
      responsavel_user_id: formData.responsavel_user_id || null,
      responsavel_name: selectedProfessor?.name || null,
      completion_deadline: formData.completion_deadline,
      enrollment_open_at: formData.enrollment_open_at ? new Date(formData.enrollment_open_at).toISOString() : null,
      enrollment_close_at: formData.enrollment_close_at ? new Date(formData.enrollment_close_at).toISOString() : null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
    };

    updateTurma.mutate(updateData, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      responsavel_user_id: "",
      completion_deadline: "",
      enrollment_open_at: "",
      enrollment_close_at: "",
      capacity: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Turma</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="turma-name">Nome da Turma *</Label>
              <Input
                id="turma-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Turma Janeiro 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel-user">Professor Responsável</Label>
              <Select
                value={formData.responsavel_user_id}
                onValueChange={(value) => setFormData({...formData, responsavel_user_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade Máxima</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                placeholder="Ex: 30"
                min="1"
              />
            </div>
          </div>

          <Separator />

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuração de Datas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="completion-deadline">Prazo de Conclusão *</Label>
              <Input
                id="completion-deadline"
                type="date"
                value={formData.completion_deadline}
                onChange={(e) => setFormData({...formData, completion_deadline: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment-open">Abertura das Inscrições</Label>
                <Input
                  id="enrollment-open"
                  type="datetime-local"
                  value={formData.enrollment_open_at}
                  onChange={(e) => setFormData({...formData, enrollment_open_at: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment-close">Encerramento das Inscrições</Label>
                <Input
                  id="enrollment-close"
                  type="datetime-local"
                  value={formData.enrollment_close_at}
                  onChange={(e) => setFormData({...formData, enrollment_close_at: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTurma.isPending}>
              {updateTurma.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};