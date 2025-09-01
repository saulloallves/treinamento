import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Unidade {
  id: string;
  grupo?: string;
  codigo_grupo?: number;
  endereco?: string;
  telefone?: number;
  email?: string;
  cidade?: string;
  estado?: string;
  uf?: string;
  cep?: string;
  fase_loja?: string;
  etapa_loja?: string;
  modelo_loja?: string;
  created_at?: string;
  hasAccount?: boolean;
}

export const useUnidades = () => {
  return useQuery<(Unidade & { hasAccount: boolean })[]>({
    queryKey: ["unidades"],
    queryFn: async () => {
      // Buscar unidades e franqueados em paralelo para melhor performance
      const [unidadesResult, franqueadosResult] = await Promise.all([
        supabase
          .from("unidades")
          .select("*")
          .order("grupo", { ascending: true }),
        supabase
          .from("users")
          .select("unit_code")
          .eq("role", "Franqueado")
      ]);

      if (unidadesResult.error) {
        throw new Error(`Erro ao buscar unidades: ${unidadesResult.error.message}`);
      }

      if (franqueadosResult.error) {
        console.warn("Erro ao buscar franqueados:", franqueadosResult.error.message);
      }

      // Criar Set para busca otimizada de unit_codes
      const franqueadosUnitCodes = new Set(
        (franqueadosResult.data || []).map(f => f.unit_code)
      );

      // Mapear unidades com informação se tem conta criada
      const unidadesComStatus = (unidadesResult.data || []).map(unidade => ({
        ...unidade,
        hasAccount: franqueadosUnitCodes.has(unidade.codigo_grupo?.toString()) || false
      }));

      return unidadesComStatus as (Unidade & { hasAccount: boolean })[];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter cache por 10 minutos (era cacheTime)
  });
};

export const useUnidadeDetails = (id: string) => {
  return useQuery({
    queryKey: ["unidade", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unidades")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar detalhes da unidade: ${error.message}`);
      }

      return data as Unidade;
    },
    enabled: !!id,
  });
};

export const useUnidadeCollaborators = (codigo_grupo: number) => {
  return useQuery({
    queryKey: ["unidade-colaborators", codigo_grupo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, approval_status, created_at")
        .eq("unit_code", codigo_grupo.toString())
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar colaboradores: ${error.message}`);
      }

      return data;
    },
    enabled: !!codigo_grupo,
  });
};

export const useDeleteUnidade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("unidades")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao deletar unidade: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
    },
  });
};