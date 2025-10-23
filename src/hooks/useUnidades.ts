import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

const fetchUnidades = async () => {
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .order('group_name', { ascending: true })

  if (error) {
    console.error('Error fetching unidades:', error)
    throw new Error(error.message)
  }

  return data
}

export const useUnidades = () => {
  return useQuery({
    queryKey: ['unidades'],
    queryFn: fetchUnidades,
  })
}