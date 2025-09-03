import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnrollInTurma } from "@/hooks/useTurmas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string;
  courseId: string;
}

export const EnrollStudentDialog = ({ open, onOpenChange, turmaId, courseId }: EnrollStudentDialogProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const enrollInTurma = useEnrollInTurma();

  // Fetch students (users that are not admin/professor)
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .neq('user_type', 'Professor')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  // Fetch already enrolled students in this turma
  const { data: enrolledStudents } = useQuery({
    queryKey: ['enrolled-students', turmaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('turma_id', turmaId);

      if (error) throw error;
      return data.map(e => e.user_id);
    },
    enabled: open && !!turmaId
  });

  // Filter out already enrolled students
  const availableStudents = students?.filter(
    student => !enrolledStudents?.includes(student.id)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudentId || !turmaId) {
      return;
    }

    try {
      await enrollInTurma.mutateAsync({
        turmaId,
        studentId: selectedStudentId,
        courseId
      });
      
      setSelectedStudentId("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscrever Aluno na Turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student">Selecionar Aluno</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Todos os alunos já estão inscritos nesta turma
                  </div>
                ) : (
                  availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={enrollInTurma.isPending || !selectedStudentId || availableStudents.length === 0}
            >
              {enrollInTurma.isPending ? "Inscrevendo..." : "Inscrever"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};