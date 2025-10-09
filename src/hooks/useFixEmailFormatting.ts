import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FixEmailResult {
  id: string;
  grupo: string;
  originalEmail: string;
  fixedEmail: string;
  fixed: boolean;
}

interface FixEmailResponse {
  message: string;
  summary: {
    total: number;
    fixed: number;
    unchanged: number;
  };
  results: FixEmailResult[];
}

export const useFixEmailFormatting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<FixEmailResponse> => {
      const { data, error } = await supabase.functions.invoke('fix-email-formatting', {
        body: {}
      });

      if (error) {
        throw new Error(`Erro ao corrigir emails: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      
      if (data.summary.fixed > 0) {
        toast.success(
          `${data.summary.fixed} emails corrigidos com sucesso!`,
          {
            description: `De ${data.summary.total} unidades verificadas, ${data.summary.fixed} tiveram emails corrigidos.`
          }
        );
      } else {
        toast.info("Nenhum email precisou ser corrigido", {
          description: "Todos os emails já estão com formatação correta."
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Erro ao corrigir emails", {
        description: error.message
      });
    },
  });
};