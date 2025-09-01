import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Unidade {
  id: string;
  grupo: string;
  codigo_grupo: number;
  endereco: string;
  telefone: number;
  email: string;
  cidade: string;
  estado: string;
  uf: string;
  cep: string;
  fase_loja: string;
  etapa_loja: string;
  modelo_loja: string;
  created_at: string;
}

export const useUnidades = () => {
  return useQuery({
    queryKey: ["unidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unidades")
        .select("*")
        .order("grupo", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar unidades: ${error.message}`);
      }

      return data as Unidade[];
    },
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