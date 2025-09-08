import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface AutomatedDispatchesFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCourse: string;
  onCourseChange: (course: string) => void;
  courses: string[];
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
}

export const AutomatedDispatchesFilters = ({
  searchTerm,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  courses,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
}: AutomatedDispatchesFiltersProps) => {
  const hasActiveFilters = searchTerm || (selectedCourse && selectedCourse !== 'all');

  const clearFilters = () => {
    onSearchChange('');
    onCourseChange('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aulas ou cursos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Course Filter */}
          <div className="w-full sm:w-60">
            <Select value={selectedCourse} onValueChange={onCourseChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrar por curso" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items per page */}
          <div className="w-full sm:w-32">
            <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="shrink-0">
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Active Filters and Results Count */}
      <div className="flex flex-wrap items-center gap-2">
        {searchTerm && (
          <Badge variant="secondary" className="gap-1">
            Busca: {searchTerm}
            <button
              onClick={() => onSearchChange('')}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {selectedCourse && selectedCourse !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            Curso: {selectedCourse}
            <button
              onClick={() => onCourseChange('all')}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        <span className="text-sm text-muted-foreground ml-auto">
          {totalItems} {totalItems === 1 ? 'aula encontrada' : 'aulas encontradas'}
        </span>
      </div>
    </div>
  );
};