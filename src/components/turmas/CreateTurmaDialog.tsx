import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTurma } from "@/hooks/useTurmas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateTurmaDialogProps {
  courseId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTurmaDialog = ({ courseId, open, onOpenChange }: CreateTurmaDialogProps) => {
  const [formData, setFormData] = useState({
    course_id: courseId || "",
    name: "",
    code: "",
    responsavel_name: "",
    completion_deadline: "",
    enrollment_open_at: "",
    enrollment_close_at: "",
    capacity: ""
  });

  const createTurma = useCreateTurma();

  // Fetch courses segmented by type
  const { data: cursos } = useQuery({
    queryKey: ['courses-ao-vivo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, tipo')
        .eq('tipo', 'ao_vivo')
        .eq('status', 'Ativo')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const { data: treinamentos } = useQuery({
    queryKey: ['courses-gravado'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, tipo')
        .eq('tipo', 'gravado')
        .eq('status', 'Ativo')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.responsavel_name || !formData.completion_deadline || !formData.enrollment_open_at || !formData.enrollment_close_at) {
      return;
    }

    try {
      await createTurma.mutateAsync({
        course_id: formData.course_id,
        name: formData.name || undefined,
        code: formData.code || undefined,
        responsavel_name: formData.responsavel_name,
        completion_deadline: formData.completion_deadline,
        enrollment_open_at: formData.enrollment_open_at,
        enrollment_close_at: formData.enrollment_close_at,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      });
      
      setFormData({
        course_id: courseId || "",
        name: "",
        code: "",
        responsavel_name: "",
        completion_deadline: "",
        enrollment_open_at: "",
        enrollment_close_at: "",
        capacity: ""
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating turma:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          {!courseId && (
            <div>
              <Label htmlFor="course">Curso *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso ou treinamento" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">Cursos (Ao Vivo)</div>
                  {cursos?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-sm font-semibold text-muted-foreground mt-2">Treinamentos (Online)</div>
                  {treinamentos?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
            <Label htmlFor="responsavel">Nome do Responsável (Professor) *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel_name}
              onChange={(e) => setFormData({ ...formData, responsavel_name: e.target.value })}
              placeholder="Digite o nome completo do professor"
              required
            />
          </div>

          <div>
            <Label htmlFor="enrollment_open_at">Abertura das Inscrições *</Label>
            <Input
              id="enrollment_open_at"
              type="datetime-local"
              value={formData.enrollment_open_at}
              onChange={(e) => setFormData({ ...formData, enrollment_open_at: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="enrollment_close_at">Fechamento das Inscrições *</Label>
            <Input
              id="enrollment_close_at"
              type="datetime-local"
              value={formData.enrollment_close_at}
              onChange={(e) => setFormData({ ...formData, enrollment_close_at: e.target.value })}
              required
            />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createTurma.isPending || !formData.responsavel_name || !formData.completion_deadline || !formData.enrollment_open_at || !formData.enrollment_close_at || (!courseId && !formData.course_id)}
            >
              {createTurma.isPending ? "Criando..." : "Criar Turma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};