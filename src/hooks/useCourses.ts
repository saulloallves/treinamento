import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'
import { toast } from 'sonner'

type Course = Tables<'courses'>
type NewCourse = TablesInsert<'courses'>
type UpdateCourse = TablesUpdate<'courses'>

const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .neq('status', 'arquivado')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export const useCourses = () => {
  return useQuery<Course[], Error>({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  })
}

// Função para arquivar um curso (a lógica é a mesma, mas o nome muda)
const deleteCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .update({ status: 'arquivado' })
    .eq('id', courseId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Hook renomeado para useDeleteCourse
export const useDeleteCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      toast.success('Curso arquivado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (error) => {
      toast.error(`Erro ao arquivar o curso: ${error.message}`)
    },
  })
}

const createCourse = async (newCourse: NewCourse) => {
  const { data, error } = await supabase.from('courses').insert(newCourse).select().single()
  if (error) throw new Error(error.message)
  return data
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success('Curso criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (error) => {
      toast.error(`Erro ao criar curso: ${error.message}`)
    },
  })
}

const updateCourse = async ({ id, ...updates }: UpdateCourse & { id: string }) => {
  const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      toast.success('Curso atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar curso: ${error.message}`)
    },
  })
}