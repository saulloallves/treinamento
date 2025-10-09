import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JobPosition {
  id: string;
  code: string;
  name: string;
  category: 'franqueado' | 'colaborador';
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useJobPositions = (category?: 'franqueado' | 'colaborador') => {
  return useQuery({
    queryKey: ['job-positions', category],
    queryFn: async () => {
      let query = supabase
        .from('job_positions')
        .select('*')
        .eq('active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching job positions:', error);
        throw error;
      }

      return data as JobPosition[];
    }
  });
};

export const useJobPositionByCode = (code: string) => {
  return useQuery({
    queryKey: ['job-position', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching job position:', error);
        throw error;
      }

      return data as JobPosition | null;
    },
    enabled: !!code
  });
};