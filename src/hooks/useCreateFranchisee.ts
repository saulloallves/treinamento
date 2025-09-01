import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateFranchiseeData {
  email: string;
  name: string;
  phone?: string;
  unitCode: string;
  unitName: string;
}

export const useCreateFranchisee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFranchiseeData) => {
      // Usar a edge function específica para criar franqueados
      const { data: result, error } = await supabase.functions.invoke('create-franchisee', {
        body: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          unitCode: data.unitCode,
          unitName: data.unitName
        }
      });

      if (error) {
        throw new Error(`Erro ao criar franqueado: ${error.message}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar franqueado');
      }

      return result.user;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["unidade-colaborators"] });
      toast.success("Franqueado criado com sucesso!", {
        description: "Senha padrão definida: Trocar01"
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};