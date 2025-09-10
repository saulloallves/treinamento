import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { useCreateQuestion } from "@/hooks/useTestQuestions";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";

const formSchema = z.object({
  question_text: z.string().min(1, "Pergunta é obrigatória"),
  question_order: z.number().min(0),
  image_urls: z.array(z.string()).optional(),
  options: z.array(z.object({
    option_text: z.string().min(1, "Texto da opção é obrigatório"),
    score_value: z.number().min(0).max(2),
    option_order: z.number().min(0),
  })).length(3, "Deve ter exatamente 3 opções"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateQuestionDialogProps {
  testId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateQuestionDialog = ({ testId, open, onOpenChange }: CreateQuestionDialogProps) => {
  const createQuestion = useCreateQuestion();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_text: "",
      question_order: 0,
      image_urls: [],
      options: [
        { option_text: "", score_value: 0, option_order: 0 },
        { option_text: "", score_value: 1, option_order: 1 },
        { option_text: "", score_value: 2, option_order: 2 },
      ],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createQuestion.mutateAsync({
        test_id: testId,
        ...data,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating question:", error);
    }
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-red-100 text-red-800 border-red-200';
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreText = (score: number) => {
    switch (score) {
      case 0:
        return 'Errada (0 pontos)';
      case 1:
        return 'Média (1 ponto)';
      case 2:
        return 'Melhor (2 pontos)';
      default:
        return `${score} pontos`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Pergunta</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pergunta</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite a pergunta"
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
              name="question_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem da Pergunta</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Section - Simplified for now */}
            <div className="space-y-2">
              <FormLabel>Imagens (Opcional)</FormLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload de imagens será implementado em breve
                </p>
                <Button type="button" variant="outline" size="sm" disabled>
                  Selecionar Imagens
                </Button>
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-4">
              <FormLabel>Opções de Resposta</FormLabel>
              <p className="text-sm text-muted-foreground">
                Configure as 3 opções: Errada (0 pontos), Média (1 ponto) e Melhor (2 pontos)
              </p>
              
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Opção {String.fromCharCode(65 + index)}</h4>
                    <Badge variant="outline" className={getScoreColor(form.watch(`options.${index}.score_value`))}>
                      {getScoreText(form.watch(`options.${index}.score_value`))}
                    </Badge>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`options.${index}.option_text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto da Opção</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite o texto da opção"
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`options.${index}.score_value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pontuação</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Errada (0 pontos)</SelectItem>
                            <SelectItem value="1">Média (1 ponto)</SelectItem>
                            <SelectItem value="2">Melhor (2 pontos)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createQuestion.isPending}>
                {createQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Pergunta
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionDialog;