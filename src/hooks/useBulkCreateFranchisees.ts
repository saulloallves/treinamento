import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkCreateResult {
  email: string;
  unitCode: string;
  unitName: string;
  success: boolean;
  error?: string;
}

interface BulkCreateResponse {
  message: string;
  summary: {
    total: number;
    success: number;
    errors: number;
  };
  results: BulkCreateResult[];
}

export const useBulkCreateFranchisees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<BulkCreateResponse> => {
      const { data, error } = await supabase.functions.invoke('bulk-create-franchisees', {
        body: {}
      });

      if (error) {
        throw new Error(`Erro ao criar franqueados: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["unidade-colaborators"] });
      
      toast.success(
        `${data.summary.success} franqueados criados com sucesso!`,
        {
          description: data.summary.errors > 0 
            ? `${data.summary.errors} erros encontrados. Verifique os detalhes.`
            : "Todos os franqueados foram criados com a senha padrão: Trocar01"
        }
      );

      if (data.summary.errors > 0) {
        const errors = data.results.filter(r => !r.success);
        console.log("Erros encontrados:", errors);
      }
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar franqueados", {
        description: error.message
      });
    },
  });
};