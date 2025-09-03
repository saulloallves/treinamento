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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateClass } from "@/hooks/useClasses";
import { useCourses } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const createClassSchema = z.object({
  course_id: z.string().min(1, "Selecione um curso"),
  responsible_id: z.string().min(1, "Selecione um responsável"),
  name: z.string().min(1, "Nome da turma é obrigatório"),
  description: z.string().optional(),
  deadline: z.date({
    required_error: "Data limite é obrigatória",
  }),
  max_students: z.number().min(1, "Número mínimo de alunos é 1").max(100, "Número máximo de alunos é 100"),
});

type CreateClassForm = z.infer<typeof createClassSchema>;

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateClassDialog = ({ open, onOpenChange }: CreateClassDialogProps) => {
  const { data: currentUser } = useCurrentUser();
  const { data: isAdmin = false } = useIsAdmin(currentUser?.id);
  const { data: courses = [] } = useCourses();
  const createClass = useCreateClass();

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

  const form = useForm<CreateClassForm>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      max_students: 30,
      responsible_id: currentUser?.id || "",
    },
  });

  const onSubmit = async (data: CreateClassForm) => {
    try {
      const classData = {
        course_id: data.course_id,
        responsible_id: data.responsible_id,
        name: data.name,
        deadline: format(data.deadline, 'yyyy-MM-dd'),
        max_students: data.max_students,
        ...(data.description && { description: data.description }),
      };
      
      await createClass.mutateAsync(classData);
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Turma</DialogTitle>
          <DialogDescription>
            Crie uma nova turma para organizar seus alunos e acompanhar o progresso.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {isAdmin && (
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
                disabled={createClass.isPending}
              >
                {createClass.isPending ? 'Criando...' : 'Criar Turma'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassDialog;