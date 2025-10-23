import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

// Tipos para clareza
type Unidade = Tables<'unidades'>
type User = Tables<'users'>

// 1. Hook para buscar TODAS as unidades (CORRIGIDO)
const fetchUnidades = async (): Promise<Unidade[]> => {
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .order('group_name', { ascending: true })

  if (error) {
    console.error('Error fetching unidades:', error)
    throw new Error(error.message)
  }

  return data || []
}

export const useUnidades = () => {
  return useQuery<Unidade[], Error>({
    queryKey: ['unidades'],
    queryFn: fetchUnidades,
  })
}

// 2. Hook para buscar UMA unidade por ID (ADICIONADO)
const fetchUnidadeById = async (id: string): Promise<Unidade | null> => {
  if (!id) return null

  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // It's okay if no row is found, single() will throw an error for that
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching unidade by id:', error)
    throw new Error(error.message)
  }

  return data
}

export const useUnidade = (id: string) => {
  return useQuery<Unidade | null, Error>({
    queryKey: ['unidade', id],
    queryFn: () => fetchUnidadeById(id),
    enabled: !!id,
  })
}

// 3. Hook para buscar colaboradores de uma unidade (RESTAURADO)
const fetchUnidadeCollaborators = async (unitCode: string | number): Promise<Partial<User>[]> => {
  if (!unitCode) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, position, approval_status')
    .eq('unit_code', String(unitCode))
    .eq('role', 'Colaborador')

  if (error) {
    console.error('Error fetching collaborators for unit:', error)
    throw new Error(error.message)
  }

  return data || []
}

export const useUnidadeCollaborators = (unitCode: string | number) => {
  return useQuery<Partial<User>[], Error>({
    queryKey: ['collaborators', unitCode],
    queryFn: () => fetchUnidadeCollaborators(unitCode),
    enabled: !!unitCode,
  })
}