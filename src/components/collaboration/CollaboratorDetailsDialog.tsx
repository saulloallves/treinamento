import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CollaborationApproval } from "@/hooks/useCollaborationApprovals";

const formSchema = z.object({
  admission_date: z.date({ required_error: "Data de admissão é obrigatória." }),
  instagram_profile: z.string().optional(),
  salary: z.string().min(1, { message: "Salário é obrigatório." }),
  meal_voucher_active: z.boolean().default(false),
  meal_voucher_value: z.string().optional(),
  transport_voucher_active: z.boolean().default(false),
  transport_voucher_value: z.string().optional(),
  health_plan: z.boolean().default(false),
  basic_food_basket_active: z.boolean().default(false),
  basic_food_basket_value: z.string().optional(),
  cost_assistance_active: z.boolean().default(false),
  cost_assistance_value: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CollaboratorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: CollaborationApproval | null;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

const CollaboratorDetailsDialog = ({ open, onOpenChange, collaborator, onSubmit, isSubmitting }: CollaboratorDetailsDialogProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admission_date: new Date(),
      instagram_profile: "",
      salary: "",
      meal_voucher_active: false,
      meal_voucher_value: "",
      transport_voucher_active: false,
      transport_voucher_value: "",
      health_plan: false,
      basic_food_basket_active: false,
      basic_food_basket_value: "",
      cost_assistance_active: false,
      cost_assistance_value: "",
    },
  });

  const watchMealVoucher = form.watch("meal_voucher_active");
  const watchTransportVoucher = form.watch("transport_voucher_active");
  const watchBasicBasket = form.watch("basic_food_basket_active");
  const watchCostAssistance = form.watch("cost_assistance_active");

  // Prevenir fechamento acidental
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    if (open) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [open]);

  if (!collaborator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl flex flex-col max-h-[90vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Completar Cadastro do Colaborador</DialogTitle>
          <DialogDescription>
            Preencha as informações de <strong>{collaborator.collaborator_name}</strong> para finalizar a aprovação.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 pl-1 -ml-1">
          <Form {...form}>
            <form id="collaborator-details-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admission_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Admissão *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Escolha uma data</span>
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
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="salary" render={({ field }) => (
                  <FormItem><FormLabel>Salário *</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="instagram_profile" render={({ field }) => (
                  <FormItem><FormLabel>Instagram (Opcional)</FormLabel><FormControl><Input placeholder="@perfil" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <h3 className="text-md font-medium border-t pt-4">Benefícios</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="health_plan" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Plano de Saúde</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )}/>
                <FormField control={form.control} name="meal_voucher_active" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Vale Refeição</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )}/>
                {watchMealVoucher && <FormField control={form.control} name="meal_voucher_value" render={({ field }) => (
                  <FormItem><FormLabel>Valor do Vale Refeição</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>}
                <FormField control={form.control} name="transport_voucher_active" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Vale Transporte</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )}/>
                {watchTransportVoucher && <FormField control={form.control} name="transport_voucher_value" render={({ field }) => (
                  <FormItem><FormLabel>Valor do Vale Transporte</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>}
                <FormField control={form.control} name="basic_food_basket_active" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Cesta Básica</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )}/>
                {watchBasicBasket && <FormField control={form.control} name="basic_food_basket_value" render={({ field }) => (
                  <FormItem><FormLabel>Valor da Cesta Básica</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>}
                <FormField control={form.control} name="cost_assistance_active" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Ajuda de Custo</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )}/>
                {watchCostAssistance && <FormField control={form.control} name="cost_assistance_value" render={({ field }) => (
                  <FormItem><FormLabel>Valor da Ajuda de Custo</FormLabel><FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>}
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="pt-4 border-t mt-4">
          <Button type="submit" form="collaborator-details-form" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar e Aprovar Colaborador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorDetailsDialog;