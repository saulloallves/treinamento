import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTest } from "@/hooks/useTests";
import { useTurmas } from "@/hooks/useTurmas";
import { useCourses } from "@/hooks/useCourses";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  turma_id: z.string().min(1, "Turma é obrigatória"),
  passing_percentage: z.number().min(1).max(100),
  max_attempts: z.number().min(1),
  time_limit_minutes: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTestDialog = ({ open, onOpenChange }: CreateTestDialogProps) => {
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
  const { data: turmas } = useTurmas();
  const { data: courses } = useCourses();
  const createTest = useCreateTest();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      turma_id: "",
      passing_percentage: 70,
      max_attempts: 1,
      time_limit_minutes: undefined,
    },
  });

  const selectedTurma = turmas?.find(t => t.id === selectedTurmaId);
  const selectedCourse = courses?.find(c => c.id === selectedTurma?.course_id);

  const onSubmit = async (data: FormData) => {
    try {
      await createTest.mutateAsync({
        ...data,
        course_id: selectedTurma?.course_id || "",
        status: 'draft',
      });
      form.reset();
      setSelectedTurmaId("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating test:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Teste</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Teste</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do teste" {...field} />
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
                      placeholder="Digite uma descrição para o teste"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="turma_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedTurmaId(value);
                  }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {turmas?.map((turma) => {
                        const course = courses?.find(c => c.id === turma.course_id);
                        return (
                          <SelectItem key={turma.id} value={turma.id}>
                            <div className="flex flex-col">
                              <span>{turma.name || `Turma ${turma.code}`}</span>
                              <span className="text-sm text-muted-foreground">
                                {course?.name}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCourse && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Curso:</strong> {selectedCourse.name}
                </p>
                {selectedTurma && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Turma:</strong> {selectedTurma.name || selectedTurma.code}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passing_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Aprovação (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_attempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Tentativas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="time_limit_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite de Tempo (minutos) - Opcional</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Deixe em branco para sem limite"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTest.isPending}>
                {createTest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Teste
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTestDialog;