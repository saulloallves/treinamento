import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matriz, treinamento } from "@/integrations/supabase/helpers";

export interface Unidade {
  id: string;
  group_name: string;
  group_code: number;
  ai_agent_id?: string;
  notion_page_id?: string;
  phone?: string;
  email?: string;
  operation_mon?: string;
  operation_tue?: string;
  operation_wed?: string;
  operation_thu?: string;
  operation_fri?: string;
  operation_sat?: string;
  operation_sun?: string;
  operation_hol?: string;
  drive_folder_id?: string;
  drive_folder_link?: string;
  docs_folder_id?: string;
  docs_folder_link?: string;
  store_model: string;
  store_phase: string;
  store_imp_phase?: string;
  address?: string;
  number_address?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  uf?: string;
  postal_code?: string;
  instagram_profile?: string;
  has_parking?: boolean;
  parking_spots?: number;
  has_partner_parking?: boolean;
  partner_parking_address?: string;
  purchases_active?: boolean;
  sales_active?: boolean;
  cnpj?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  fantasy_name?: string;
  user_instagram?: string;
  id_unidade?: string;
  password_instagram?: string;
  bearer?: string;
  hasUsers?: boolean;
}

export const useUnidades = () => {
  return useQuery<(Unidade & { hasUsers: boolean })[]>({
    queryKey: ["unidades"],
    queryFn: async () => {
      // Buscar unidades e usuários (franqueados e colaboradores) em paralelo
      const [unidadesResult, usersResult] = await Promise.all([
        matriz.unidades() // <-- Use o helper matriz para buscar unidades do schema public
          .select("*")
          .order("group_name", { ascending: true }),
        treinamento.users() // <-- Use o helper treinamento para buscar usuários do schema treinamento
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
        hasUsers: unitCodesWithUsers.has(unidade.group_code.toString()) || false
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
      const { data, error } = await matriz.unidades() // <-- Use o helper matriz
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
      const { data, error } = await treinamento.users()
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
      const { error } = await matriz.unidades() // <-- Use o helper matriz
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