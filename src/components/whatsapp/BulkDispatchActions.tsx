import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, ToggleLeft, ToggleRight } from 'lucide-react';

interface BulkDispatchActionsProps {
  selectedLessons: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkToggle2h: () => void;
  onBulkToggle30m: () => void;
  totalLessons: number;
}

export const BulkDispatchActions = ({
  selectedLessons,
  onSelectAll,
  onDeselectAll,
  onBulkToggle2h,
  onBulkToggle30m,
  totalLessons,
}: BulkDispatchActionsProps) => {
  const hasSelection = selectedLessons.length > 0;
  const isAllSelected = selectedLessons.length === totalLessons;

  if (!hasSelection && totalLessons === 0) {
    return null;
  }

  return (
    <div className="bg-secondary/50 rounded-xl p-6 border shadow-clean">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="inline-flex items-center justify-center w-10 h-10 bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            role="button"
            tabIndex={0}
            aria-label={isAllSelected ? 'Desmarcar todas as aulas' : 'Selecionar todas as aulas'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                isAllSelected ? onDeselectAll() : onSelectAll();
              }
            }}
          >
            {isAllSelected ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="p-0 h-auto font-semibold text-primary hover:text-primary/80 hover:bg-transparent"
            >
              {isAllSelected ? 'Desmarcar todas as aulas' : 'Selecionar todas as aulas'}
            </Button>
            <div className="flex items-center gap-2 mt-1">
              {hasSelection && (
                <Badge variant="secondary">
                  {selectedLessons.length} {selectedLessons.length === 1 ? 'aula selecionada' : 'aulas selecionadas'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {hasSelection && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={onBulkToggle2h}
              className="shadow-clean"
            >
              <ToggleRight className="h-4 w-4 mr-2" />
              Alternar disparos 2h
            </Button>
            <Button
              size="sm"
              onClick={onBulkToggle30m}
              className="shadow-clean"
            >
              <ToggleRight className="h-4 w-4 mr-2" />
              Alternar disparos 30m
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};