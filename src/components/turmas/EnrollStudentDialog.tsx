import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Search } from "lucide-react";
import { useEnrollInTurma } from "@/hooks/useTurmas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string;
  courseId: string;
}

export const EnrollStudentDialog = ({ open, onOpenChange, turmaId, courseId }: EnrollStudentDialogProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const enrollInTurma = useEnrollInTurma();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedStudentId("");
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  }, [open]);

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

  // Filter out already enrolled students and apply search filter
  const availableStudents = students?.filter(
    student => !enrolledStudents?.includes(student.id)
  ) || [];

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = availableStudents.find(s => s.id === selectedStudentId);

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
      setSearchTerm("");
      setIsDropdownOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscrever Aluno na Turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Selecionar Aluno</Label>
            <div className="relative" ref={dropdownRef}>
              <div 
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
                  "ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isDropdownOpen && "ring-2 ring-ring ring-offset-2"
                )}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedStudent ? (
                  <span>{selectedStudent.name} ({selectedStudent.email})</span>
                ) : (
                  <span className="text-muted-foreground">Selecione um aluno</span>
                )}
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="max-h-60">
                    {filteredStudents.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {availableStudents.length === 0 
                          ? "Todos os alunos já estão inscritos nesta turma"
                          : "Nenhum aluno encontrado"
                        }
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                              selectedStudentId === student.id && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => handleStudentSelect(student.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{student.name}</span>
                              <span className="text-xs text-muted-foreground">{student.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
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