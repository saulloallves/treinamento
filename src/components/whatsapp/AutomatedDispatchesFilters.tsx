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
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
          <Filter className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Filtros e Busca</h3>
          <p className="text-sm text-gray-600">Encontre as aulas que deseja configurar</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar aulas ou cursos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Course Filter */}
          <div>
            <Select value={selectedCourse} onValueChange={onCourseChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
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
          <div>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
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

        {/* Active Filters and Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 border-blue-200">
                Busca: {searchTerm}
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCourse && selectedCourse !== 'all' && (
              <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 border-purple-200">
                Curso: {selectedCourse}
                <button
                  onClick={() => onCourseChange('all')}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
              {totalItems} {totalItems === 1 ? 'aula encontrada' : 'aulas encontradas'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};