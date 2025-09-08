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
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
            {isAllSelected ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5 text-blue-600" />}
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="p-0 h-auto font-semibold text-blue-700 hover:text-blue-800 hover:bg-transparent"
            >
              {isAllSelected ? 'Desmarcar todas as aulas' : 'Selecionar todas as aulas'}
            </Button>
            <div className="flex items-center gap-2 mt-1">
              {hasSelection && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
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
              onClick={onBulkToggle1h}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              <ToggleRight className="h-4 w-4 mr-2" />
              Alternar disparos 1h
            </Button>
            <Button
              size="sm"
              onClick={onBulkToggle10m}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md"
            >
              <ToggleLeft className="h-4 w-4 mr-2" />
              Alternar disparos 10m
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};