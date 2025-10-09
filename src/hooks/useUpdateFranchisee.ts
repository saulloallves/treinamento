import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateFranchiseeData {
  unitCode: string;
  email?: string;
  name?: string;
  phone?: string;
  password?: string;
}

export const useUpdateFranchisee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateFranchiseeData) => {
      const { data: result, error } = await supabase.functions.invoke('update-franchisee', {
        body: {
          unitCode: data.unitCode,
          email: data.email,
          name: data.name,
          phone: data.phone,
          password: data.password,
        }
      });

      if (error) {
        throw new Error(`Erro ao atualizar franqueado: ${error.message}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar franqueado');
      }

      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["unidade-colaborators"] });
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
