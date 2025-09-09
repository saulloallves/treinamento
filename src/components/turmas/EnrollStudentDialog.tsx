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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
    } else {
      console.log('EnrollStudentDialog opened with:', { turmaId, courseId });
    }
  }, [open, turmaId, courseId]);

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
      
      // Remove duplicates based on email to avoid key conflicts
      const uniqueStudents = data?.reduce((acc: any[], current: any) => {
        const exists = acc.find(student => student.email === current.email);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      return uniqueStudents || [];
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

  // Add UUID validation function
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EnrollStudentDialog - handleSubmit called with:', {
      selectedStudentId,
      turmaId,
      courseId
    });
    
    // Validate UUIDs
    if (!isValidUUID(selectedStudentId)) {
      console.error('Invalid selectedStudentId UUID:', selectedStudentId);
      toast({
        title: "Erro de validação",
        description: "ID do estudante inválido",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidUUID(turmaId)) {
      console.error('Invalid turmaId UUID:', turmaId);
      toast({
        title: "Erro de validação", 
        description: "ID da turma inválido",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidUUID(courseId)) {
      console.error('Invalid courseId UUID:', courseId);
      toast({
        title: "Erro de validação",
        description: "ID do curso inválido", 
        variant: "destructive",
      });
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
      <DialogContent className="sm:max-w-lg w-full mx-4">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl">Inscrever Aluno na Turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="student" className="text-base font-medium">Selecionar Aluno</Label>
            <div className="relative" ref={dropdownRef}>
              <div 
                className={cn(
                  "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base cursor-pointer",
                  "ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "hover:border-ring transition-colors",
                  isDropdownOpen && "ring-2 ring-ring ring-offset-2"
                )}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedStudent ? (
                  <div className="flex flex-col justify-center min-h-0">
                    <span className="font-medium text-sm leading-tight">{selectedStudent.name}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{selectedStudent.email}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground flex items-center">Selecione um aluno</span>
                )}
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="max-h-72">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        {availableStudents.length === 0 
                          ? "Todos os alunos já estão inscritos nesta turma"
                          : "Nenhum aluno encontrado"
                        }
                      </div>
                    ) : (
                      <div className="p-2">
                        {filteredStudents.map((student, index) => (
                          <div
                            key={`student-${student.id}-${index}`}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-md px-3 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                              selectedStudentId === student.id && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => handleStudentSelect(student.id)}
                          >
                            <Check
                              className={cn(
                                "mr-3 h-4 w-4 flex-shrink-0",
                                selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium truncate">{student.name}</span>
                              <span className="text-xs text-muted-foreground truncate">{student.email}</span>
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 h-10"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={enrollInTurma.isPending || !selectedStudentId || availableStudents.length === 0}
              className="px-6 py-2 h-10"
            >
              {enrollInTurma.isPending ? "Inscrevendo..." : "Inscrever"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};