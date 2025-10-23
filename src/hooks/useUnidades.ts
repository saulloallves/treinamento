import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'
import { toast } from 'sonner'

// Tipos para clareza
type Unidade = Tables<'unidades'>
type NewUnidade = TablesInsert<'unidades'>
type UpdatedUnidade = TablesUpdate<'unidades'>
type User = Tables<'users'>

// =================================
// QUERIES (Read operations)
// =================================

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

const fetchUnidadeById = async (id: string): Promise<Unidade | null> => {
  if (!id) return null

  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
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

// =================================
// MUTATIONS (Write operations)
// =================================

const createUnidade = async (newUnidade: NewUnidade): Promise<Unidade> => {
  const { data, error } = await supabase
    .from('unidades')
    .insert(newUnidade)
    .select()
    .single()

  if (error) {
    console.error('Error creating unidade:', error)
    throw new Error(error.message)
  }
  return data
}

export const useCreateUnidade = () => {
  const queryClient = useQueryClient()
  return useMutation<Unidade, Error, NewUnidade>({
    mutationFn: createUnidade,
    onSuccess: () => {
      toast.success('Unidade criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
    },
    onError: (error) => {
      toast.error(`Erro ao criar unidade: ${error.message}`)
    },
  })
}

const updateUnidade = async ({ id, ...updateData }: UpdatedUnidade & { id: string }): Promise<Unidade> => {
  const { data, error } = await supabase
    .from('unidades')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating unidade:', error)
    throw new Error(error.message)
  }
  return data
}

export const useUpdateUnidade = () => {
  const queryClient = useQueryClient()
  return useMutation<Unidade, Error, UpdatedUnidade & { id: string }>({
    mutationFn: updateUnidade,
    onSuccess: (data) => {
      toast.success('Unidade atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
      queryClient.invalidateQueries({ queryKey: ['unidade', data.id] })
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar unidade: ${error.message}`)
    },
  })
}

const deleteUnidade = async (id: string): Promise<void> => {
  const { error } = await supabase.from('unidades').delete().eq('id', id)

  if (error) {
    console.error('Error deleting unidade:', error)
    throw new Error(error.message)
  }
}

export const useDeleteUnidade = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: deleteUnidade,
    onSuccess: () => {
      toast.success('Unidade removida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
    },
    onError: (error) => {
      toast.error(`Erro ao remover unidade: ${error.message}`)
    },
  })
}