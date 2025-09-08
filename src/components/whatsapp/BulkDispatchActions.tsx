import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, ToggleLeft, ToggleRight } from 'lucide-react';

interface BulkDispatchActionsProps {
  selectedLessons: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkToggle1h: () => void;
  onBulkToggle10m: () => void;
  totalLessons: number;
}

export const BulkDispatchActions = ({
  selectedLessons,
  onSelectAll,
  onDeselectAll,
  onBulkToggle1h,
  onBulkToggle10m,
  totalLessons,
}: BulkDispatchActionsProps) => {
  const hasSelection = selectedLessons.length > 0;
  const isAllSelected = selectedLessons.length === totalLessons;

  if (!hasSelection && totalLessons === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2"
          >
            {isAllSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {isAllSelected ? 'Desmarcar todas' : 'Selecionar todas'}
          </Button>
          {hasSelection && (
            <Badge variant="outline">
              {selectedLessons.length} {selectedLessons.length === 1 ? 'aula selecionada' : 'aulas selecionadas'}
            </Badge>
          )}
        </div>

        {hasSelection && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkToggle1h}
              className="flex items-center gap-2"
            >
              <ToggleRight className="h-4 w-4" />
              Alternar disparos 1h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkToggle10m}
              className="flex items-center gap-2"
            >
              <ToggleLeft className="h-4 w-4" />
              Alternar disparos 10m
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};