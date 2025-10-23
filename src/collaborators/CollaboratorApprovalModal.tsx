"use client"

import { useEffect } from "react"
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
import { Tables } from "@/integrations/supabase/types"

// Supondo que o tipo do colaborador venha da tabela 'users' do schema 'treinamento'
type Collaborator = Pick<Tables<'users'>, 'email' | 'full_name'>;

interface CollaboratorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Collaborator | null;
}

// Schema de validação Zod completo e robusto
const approvalFormSchema = z.object({
  email: z.string().email("Email inválido."),
  admission_date: z.date({ required_error: "Data de admissão é obrigatória." }),
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
}).refine(data => !data.meal_voucher_active || (data.meal_voucher_active && data.meal_voucher_value), {
  message: "Valor é obrigatório se o benefício estiver ativo.",
  path: ["meal_voucher_value"],
}).refine(data => !data.transport_voucher_active || (data.transport_voucher_active && data.transport_voucher_value), {
  message: "Valor é obrigatório se o benefício estiver ativo.",
  path: ["transport_voucher_value"],
}).refine(data => !data.basic_food_basket_active || (data.basic_food_basket_active && data.basic_food_basket_value), {
  message: "Valor é obrigatório se o benefício estiver ativo.",
  path: ["basic_food_basket_value"],
}).refine(data => !data.cost_assistance_active || (data.cost_assistance_active && data.cost_assistance_value), {
  message: "Valor é obrigatório se o benefício estiver ativo.",
  path: ["cost_assistance_value"],
});

type ApprovalFormData = z.infer<typeof approvalFormSchema>;

// Hook de mutação CORRIGIDO para chamar a Edge Function
const useApproveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: ApprovalFormData) => {
      // A única responsabilidade é chamar a Edge Function
      const { data, error } = await supabase.functions.invoke(
        'update-collaborator-details',
        { body: { ...details, admission_date: details.admission_date.toISOString() } }
      );

      if (error) throw new Error(`Erro de rede: ${error.message}`);
      // Verifica se a própria Edge Function retornou um erro de lógica interna
      if (data && data.error) throw new Error(data.error);

      return data;
    },
    // A callback onSuccess está LIMPA. Sem chamadas `supabase` aqui.
    onSuccess: (data) => {
      toast.success(data.message || "Colaborador aprovado e dados sincronizados!");
      // Invalida a query da lista de colaboradores para forçar a atualização da UI
      queryClient.invalidateQueries({ queryKey: ['collaboration_approvals'] });
    },
    onError: (error: Error) => {
      toast.error(`Falha na aprovação: ${error.message}`);
    }
  });
};

export function CollaboratorApprovalModal({ isOpen, onClose, collaborator }: CollaboratorApprovalModalProps) {
  const form = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      email: '',
      salary: '',
      instagram_profile: '',
      meal_voucher_active: false,
      meal_voucher_value: '',
      transport_voucher_active: false,
      transport_voucher_value: '',
      health_plan: false,
      basic_food_basket_active: false,
      basic_food_basket_value: '',
      cost_assistance_active: false,
      cost_assistance_value: '',
    },
  });

  // Sincroniza o formulário quando o colaborador selecionado muda
  useEffect(() => {
    if (collaborator) {
      form.reset({
        email: collaborator.email,
        admission_date: new Date(), // Valor padrão
      });
    }
  }, [collaborator, form]);

  const { mutate: approveCollaborator, isPending } = useApproveCollaborator();

  const onSubmit = (values: ApprovalFormData) => {
    approveCollaborator(values, {
      onSuccess: () => {
        onClose(); // Fecha o modal
        form.reset(); // Limpa o formulário
      }
    });
  };

  if (!collaborator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprovar Colaborador: {collaborator.full_name}</DialogTitle>
          <DialogDescription>
            Preencha os dados complementares para sincronizar com a Matriz e aprovar o acesso.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="admission_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Admissão *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salário</FormLabel>
                  <FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram_profile"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Perfil do Instagram</FormLabel>
                  <FormControl><Input placeholder="@usuario" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="col-span-1 space-y-4">
                <FormField control={form.control} name="meal_voucher_active" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Vale Refeição</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                {form.watch('meal_voucher_active') && <FormField control={form.control} name="meal_voucher_value" render={({ field }) => (<FormItem><FormLabel>Valor (diário)</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>)} />}
            </div>
            
            <div className="col-span-1 space-y-4">
                <FormField control={form.control} name="transport_voucher_active" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Vale Transporte</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                {form.watch('transport_voucher_active') && <FormField control={form.control} name="transport_voucher_value" render={({ field }) => (<FormItem><FormLabel>Valor (diário)</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>)} />}
            </div>

            <div className="col-span-1 space-y-4">
                <FormField control={form.control} name="basic_food_basket_active" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Cesta Básica</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                {form.watch('basic_food_basket_active') && <FormField control={form.control} name="basic_food_basket_value" render={({ field }) => (<FormItem><FormLabel>Valor (mensal)</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>)} />}
            </div>

            <div className="col-span-1 space-y-4">
                <FormField control={form.control} name="cost_assistance_active" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Ajuda de Custo</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                {form.watch('cost_assistance_active') && <FormField control={form.control} name="cost_assistance_value" render={({ field }) => (<FormItem><FormLabel>Valor (mensal)</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>)} />}
            </div>

            <FormField control={form.control} name="health_plan" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2"><FormLabel>Plano de Saúde</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />

            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
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