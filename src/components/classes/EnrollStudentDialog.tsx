import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useEnrollStudent, type Class } from "@/hooks/useClasses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const enrollStudentSchema = z.object({
  student_id: z.string().min(1, "Selecione um aluno"),
});

type EnrollStudentForm = z.infer<typeof enrollStudentSchema>;

interface EnrollStudentDialogProps {
  classId: string;
  classData: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnrollStudentDialog = ({ classId, classData, open, onOpenChange }: EnrollStudentDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const enrollStudent = useEnrollStudent();

  // Buscar alunos disponíveis (que não estão inscritos nesta turma)
  const { data: availableStudents = [], isLoading } = useQuery({
    queryKey: ['available-students', classId, searchTerm],
    queryFn: async () => {
      // Primeiro buscar todos os usuários que podem ser alunos
      let userQuery = supabase
        .from('users')
        .select('id, name, email, user_type, unit_code')
        .eq('active', true)
        .in('user_type', ['Aluno', 'Franqueado', 'Colaborador'])
        .order('name');

      if (searchTerm) {
        userQuery = userQuery.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data: users, error: usersError } = await userQuery;
      
      if (usersError) throw usersError;

      // Buscar alunos já inscritos nesta turma
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('student_classes')
        .select('student_id')
        .eq('class_id', classId);

      if (enrolledError) throw enrolledError;

      const enrolledIds = enrolledStudents.map(e => e.student_id);
      
      // Filtrar usuários que não estão inscritos
      return users.filter(user => !enrolledIds.includes(user.id));
    },
    enabled: open
  });

  const form = useForm<EnrollStudentForm>({
    resolver: zodResolver(enrollStudentSchema),
  });

  const onSubmit = async (data: EnrollStudentForm) => {
    try {
      await enrollStudent.mutateAsync({
        classId,
        studentId: data.student_id,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  };

  const selectedStudent = availableStudents.find(
    student => student.id === form.watch('student_id')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inscrever Aluno</DialogTitle>
          <DialogDescription>
            Selecione um aluno para inscrever na turma "{classData.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aluno</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um aluno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="" disabled>
                            Carregando alunos...
                          </SelectItem>
                        ) : availableStudents.length === 0 ? (
                          <SelectItem value="" disabled>
                            {searchTerm ? 'Nenhum aluno encontrado' : 'Todos os alunos já estão inscritos'}
                          </SelectItem>
                        ) : (
                          availableStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span>{student.name}</span>
                                  <span className="text-xs text-muted-foreground">{student.email}</span>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {student.user_type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedStudent && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Aluno Selecionado</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome: </span>
                      <span>{selectedStudent.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo: </span>
                      <Badge variant="outline">{selectedStudent.user_type}</Badge>
                    </div>
                    {selectedStudent.unit_code && (
                      <div>
                        <span className="text-muted-foreground">Unidade: </span>
                        <span>{selectedStudent.unit_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={enrollStudent.isPending || !form.watch('student_id')}
                >
                  {enrollStudent.isPending ? 'Inscrevendo...' : 'Inscrever Aluno'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollStudentDialog;