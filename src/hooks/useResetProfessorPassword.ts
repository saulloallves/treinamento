import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResetProfessorPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ professorId, newPassword }: { professorId: string; newPassword: string }) => {
      const { data, error } = await supabase.auth.admin.updateUserById(professorId, {
        password: newPassword
      });

      if (error) {
        throw new Error(`Erro ao redefinir senha: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Senha alterada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao alterar senha", {
        description: error.message
      });
    },
  });
};