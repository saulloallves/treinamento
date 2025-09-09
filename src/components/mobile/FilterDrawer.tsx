import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterOption {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface FilterDrawerProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  children?: React.ReactNode;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  activeFiltersCount = 0,
  onClearFilters,
  children
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Filtros e Busca</span>
            {onClearFilters && activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Digite sua busca..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-sm font-medium mb-2">
                {filter.label}
              </label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecionar ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Filtros Ativos</span>
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) =>
                  filter.value !== 'todos' && filter.value ? (
                    <Badge key={filter.key} variant="outline" className="text-xs">
                      {filter.label}: {filter.options.find(opt => opt.value === filter.value)?.label}
                    </Badge>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;