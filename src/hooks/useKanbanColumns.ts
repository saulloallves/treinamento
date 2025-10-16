import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  headerColor: string;
  order: number;
  isDefault: boolean;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  {
    id: 'agendada',
    title: 'Planejadas',
    status: 'agendada',
    color: 'bg-primary/5 border-primary/20',
    headerColor: 'bg-primary',
    order: 1,
    isDefault: true,
  },
  {
    id: 'em_andamento',
    title: 'Em Andamento',
    status: 'em_andamento',
    color: 'bg-accent/5 border-accent/20',
    headerColor: 'bg-accent',
    order: 2,
    isDefault: true,
  },
  {
    id: 'transformar_treinamento',
    title: 'Transformar em Treinamento',
    status: 'transformar_treinamento',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-500',
    order: 3,
    isDefault: false,
  },
  {
    id: 'encerrada',
    title: 'Finalizadas',
    status: 'encerrada',
    color: 'bg-status-active/5 border-status-active/20',
    headerColor: 'bg-status-active',
    order: 4,
    isDefault: true,
  },
];

export const useKanbanColumns = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);

  // Fetch columns from database
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const { data, error } = await supabase
          .from('kanban_columns')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedColumns: KanbanColumn[] = data.map(col => ({
            id: col.id,
            title: col.title,
            status: col.status,
            color: col.color,
            headerColor: col.header_color,
            order: col.order,
            isDefault: col.is_default,
          }));
          setColumns(mappedColumns);
        }
      } catch (error) {
        console.error('Error fetching kanban columns:', error);
        toast.error('Erro ao carregar configuração das colunas');
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, []);

  // Add new column
  const addColumn = useCallback(async (columnData: Omit<KanbanColumn, 'id' | 'order'>) => {
    const newColumn: KanbanColumn = {
      ...columnData,
      id: `custom_${Date.now()}`,
      order: Math.max(...columns.map(c => c.order), 0) + 1,
    };
    
    try {
      const { error } = await supabase
        .from('kanban_columns')
        .insert({
          id: newColumn.id,
          title: newColumn.title,
          status: newColumn.status,
          color: newColumn.color,
          header_color: newColumn.headerColor,
          order: newColumn.order,
          is_default: newColumn.isDefault,
        });

      if (error) throw error;

      setColumns(prev => [...prev, newColumn]);
      toast.success('Coluna criada com sucesso');
      return newColumn.id;
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Erro ao criar coluna');
      return null;
    }
  }, [columns]);

  // Update existing column
  const updateColumn = useCallback(async (id: string, updates: Partial<KanbanColumn>) => {
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.headerColor !== undefined) dbUpdates.header_color = updates.headerColor;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { error } = await supabase
        .from('kanban_columns')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setColumns(prev => 
        prev.map(col => 
          col.id === id ? { ...col, ...updates } : col
        )
      );
      toast.success('Coluna atualizada com sucesso');
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Erro ao atualizar coluna');
    }
  }, []);

  // Delete column (only non-default columns)
  const deleteColumn = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('kanban_columns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setColumns(prev => prev.filter(col => col.id !== id));
      toast.success('Coluna excluída com sucesso');
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Erro ao excluir coluna');
    }
  }, []);

  // Reorder columns
  const reorderColumns = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    const newColumns = Array.from(columns);
    const [removed] = newColumns.splice(sourceIndex, 1);
    newColumns.splice(destinationIndex, 0, removed);
    
    // Update order values
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1
    }));

    try {
      // Update all columns order in database
      const updates = reorderedColumns.map(col => ({
        id: col.id,
        order: col.order,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('kanban_columns')
          .update({ order: update.order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setColumns(reorderedColumns);
      toast.success('Ordem das colunas atualizada');
    } catch (error) {
      console.error('Error reordering columns:', error);
      toast.error('Erro ao reordenar colunas');
    }
  }, [columns]);

  // Reset to default columns
  const resetToDefault = useCallback(async () => {
    try {
      // Delete all columns
      const { error: deleteError } = await supabase
        .from('kanban_columns')
        .delete()
        .neq('id', '');

      if (deleteError) throw deleteError;

      // Insert default columns
      const { error: insertError } = await supabase
        .from('kanban_columns')
        .insert(
          DEFAULT_COLUMNS.map(col => ({
            id: col.id,
            title: col.title,
            status: col.status,
            color: col.color,
            header_color: col.headerColor,
            order: col.order,
            is_default: col.isDefault,
          }))
        );

      if (insertError) throw insertError;

      setColumns(DEFAULT_COLUMNS);
      toast.success('Colunas resetadas para o padrão');
    } catch (error) {
      console.error('Error resetting columns:', error);
      toast.error('Erro ao resetar colunas');
    }
  }, []);

  // Get sorted columns
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return {
    columns: sortedColumns,
    loading,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    resetToDefault,
  };
};