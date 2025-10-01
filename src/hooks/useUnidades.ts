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
  grupo_colaborador?: string;
  created_at?: string;
  hasUsers?: boolean;
}

export const useUnidades = () => {
  return useQuery<(Unidade & { hasUsers: boolean })[]>({
    queryKey: ["unidades"],
    queryFn: async () => {
      // Buscar unidades e usuários (franqueados e colaboradores) em paralelo
      const [unidadesResult, usersResult] = await Promise.all([
        supabase
          .from("unidades")
          .select("*")
          .order("grupo", { ascending: true }),
        supabase
          .from("users")
          .select("unit_code, unit_codes, role")
          .in("role", ["Franqueado", "Colaborador"])
      ]);

      if (unidadesResult.error) {
        throw new Error(`Erro ao buscar unidades: ${unidadesResult.error.message}`);
      }

      if (usersResult.error) {
        console.warn("Erro ao buscar usuários:", usersResult.error.message);
      }

      // Criar Set para busca otimizada de unit_codes (incluindo arrays)
      const unitCodesWithUsers = new Set<string>();
      (usersResult.data || []).forEach(user => {
        // Adicionar unit_code individual
        if (user.unit_code) {
          unitCodesWithUsers.add(user.unit_code);
        }
        // Adicionar todos os códigos do array unit_codes (para franqueados multi-unidade)
        if (user.unit_codes && Array.isArray(user.unit_codes)) {
          user.unit_codes.forEach(code => {
            if (code) unitCodesWithUsers.add(code);
          });
        }
      });

      // Mapear unidades com informação se tem usuários vinculados
      const unidadesComStatus = (unidadesResult.data || []).map(unidade => ({
        ...unidade,
        hasUsers: unitCodesWithUsers.has(unidade.codigo_grupo?.toString()) || false
      }));

      return unidadesComStatus as (Unidade & { hasUsers: boolean })[];
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
        .select("id, name, email, phone, role, approval_status, created_at")
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