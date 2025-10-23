"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Schema para os dados complementares
const approvalFormSchema = z.object({
  email: z.string().email(),
  admission_date: z.string().min(1, "Data de admissão é obrigatória."),
  salary: z.string().optional(),
  instagram_profile: z.string().optional(),
  meal_voucher_active: z.boolean().default(false),
  meal_voucher_value: z.string().optional(),
  transport_voucher_active: z.boolean().default(false),
  transport_voucher_value: z.string().optional(),
  health_plan: z.boolean().default(false),
  basic_food_basket_active: z.boolean().default(false),
  basic_food_basket_value: z.string().optional(),
  cost_assistance_active: z.boolean().default(false),
  cost_assistance_value: z.string().optional(),
})

type Collaborator = {
  email: string;
  // outras propriedades do colaborador
};

interface CollaboratorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Collaborator | null;
}

// Hook de mutação para chamar a Edge Function
const useApproveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: z.infer<typeof approvalFormSchema>) => {
      const { data, error } = await supabase.functions.invoke(
        'update-collaborator-details',
        { body: details }
      );

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error); // Erro vindo da lógica da função

      return data;
    },
    onSuccess: () => {
      toast.success("Colaborador aprovado e dados sincronizados com sucesso!");
      // Invalida a query que busca os colaboradores para atualizar a lista na tela
      queryClient.invalidateQueries({ queryKey: ['pendingCollaborators'] });
    },
    onError: (error: Error) => {
      toast.error(`Falha na aprovação: ${error.message}`);
    }
  });
};

export function CollaboratorApprovalModal({ isOpen, onClose, collaborator }: CollaboratorApprovalModalProps) {
  const form = useForm<z.infer<typeof approvalFormSchema>>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      email: collaborator?.email || '',
      // ... outros valores padrão
    },
  });

  const { mutate: approveCollaborator, isPending } = useApproveCollaborator();

  const onSubmit = (values: z.infer<typeof approvalFormSchema>) => {
    approveCollaborator(values, {
      onSuccess: () => {
        onClose(); // Fecha o modal apenas se a mutação for bem-sucedida
      }
    });
  };

  if (!collaborator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Completar Dados e Aprovar Colaborador</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para sincronizar com a Matriz e aprovar o acesso.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Aqui iriam todos os FormFields para os dados do schema */}
            <FormField
              control={form.control}
              name="admission_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Admissão</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ... outros campos do formulário ... */}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar e Aprovar Colaborador
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}