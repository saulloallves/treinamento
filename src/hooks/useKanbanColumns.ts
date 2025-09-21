import { useState, useEffect, useCallback } from 'react';

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
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-500',
    order: 1,
    isDefault: true,
  },
  {
    id: 'em_andamento',
    title: 'Em Andamento',
    status: 'em_andamento',
    color: 'bg-orange-50 border-orange-200',
    headerColor: 'bg-orange-500',
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
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-500',
    order: 4,
    isDefault: true,
  },
];

const STORAGE_KEY = 'kanban-columns-config';

export const useKanbanColumns = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_COLUMNS;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : DEFAULT_COLUMNS;
      } catch {
        return DEFAULT_COLUMNS;
      }
    }
    return DEFAULT_COLUMNS;
  });

  // Save to localStorage whenever columns change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    }
  }, [columns]);

  // Add new column
  const addColumn = useCallback((columnData: Omit<KanbanColumn, 'id' | 'order'>) => {
    const newColumn: KanbanColumn = {
      ...columnData,
      id: `custom_${Date.now()}`,
      order: Math.max(...columns.map(c => c.order), 0) + 1,
    };
    
    setColumns(prev => [...prev, newColumn]);
    return newColumn.id;
  }, [columns]);

  // Update existing column
  const updateColumn = useCallback((id: string, updates: Partial<KanbanColumn>) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === id ? { ...col, ...updates } : col
      )
    );
  }, []);

  // Delete column (only non-default columns)
  const deleteColumn = useCallback((id: string) => {
    setColumns(prev => prev.filter(col => col.id !== id || col.isDefault));
  }, []);

  // Reorder columns
  const reorderColumns = useCallback((sourceIndex: number, destinationIndex: number) => {
    setColumns(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      
      // Update order values
      return result.map((col, index) => ({
        ...col,
        order: index + 1
      }));
    });
  }, []);

  // Reset to default columns
  const resetToDefault = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
  }, []);

  // Get sorted columns
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return {
    columns: sortedColumns,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    resetToDefault,
  };
};