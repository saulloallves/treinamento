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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUpdateClass, type Class } from "@/hooks/useClasses";
import { useCourses } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useEffect } from "react";

const editClassSchema = z.object({
  course_id: z.string().min(1, "Selecione um curso"),
  responsible_id: z.string().min(1, "Selecione um responsável"),
  name: z.string().min(1, "Nome da turma é obrigatório"),
  description: z.string().optional(),
  deadline: z.date({
    required_error: "Data limite é obrigatória",
  }),
  max_students: z.number().min(1, "Número mínimo de alunos é 1").max(100, "Número máximo de alunos é 100"),
});

type EditClassForm = z.infer<typeof editClassSchema>;

interface EditClassDialogProps {
  classData: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditClassDialog = ({ classData, open, onOpenChange }: EditClassDialogProps) => {
  const { data: currentUser } = useCurrentUser();
  const { data: isAdmin = false } = useIsAdmin(currentUser?.id);
  const { data: courses = [] } = useCourses();
  const updateClass = useUpdateClass();

  // Buscar usuários que podem ser responsáveis (Professores e Admins)
  const { data: responsibleUsers = [] } = useQuery({
    queryKey: ['responsible-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, user_type')
        .in('user_type', ['Professor', 'Admin'])
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const form = useForm<EditClassForm>({
    resolver: zodResolver(editClassSchema),
  });

  // Resetar o form quando classData mudar
  useEffect(() => {
    if (classData && open) {
      form.reset({
        course_id: classData.course_id,
        responsible_id: classData.responsible_id,
        name: classData.name,
        description: classData.description || "",
        deadline: parseISO(classData.deadline),
        max_students: classData.max_students,
      });
    }
  }, [classData, open, form]);

  const onSubmit = async (data: EditClassForm) => {
    try {
      await updateClass.mutateAsync({
        id: classData.id,
        course_id: data.course_id,
        responsible_id: data.responsible_id,
        name: data.name,
        description: data.description,
        deadline: format(data.deadline, 'yyyy-MM-dd'),
        max_students: data.max_students,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const canEditResponsible = isAdmin;
  const canEditDeadline = isAdmin || classData.status === 'criada';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Turma</DialogTitle>
          <DialogDescription>
            Altere as informações da turma. Algumas configurações podem ter restrições.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={classData.status !== 'criada'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses
                        .filter(course => course.status === 'Ativo')
                        .map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.tipo === 'ao_vivo' ? 'Ao Vivo' : 'Gravado'})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {classData.status !== 'criada' && (
                    <p className="text-xs text-muted-foreground">
                      Curso não pode ser alterado após o início da turma
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Turma</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Turma Janeiro 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição adicional sobre a turma"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canEditResponsible && (
              <FormField
                control={form.control}
                name="responsible_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {responsibleUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.user_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Limite</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            disabled={!canEditDeadline}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {!canEditDeadline && (
                      <p className="text-xs text-muted-foreground">
                        Apenas admins podem alterar o prazo
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_students"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Alunos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                type="submit" 
                disabled={updateClass.isPending}
              >
                {updateClass.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClassDialog;