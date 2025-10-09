import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface SelectFilter {
  placeholder: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}

interface PageFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: SelectFilter[];
  className?: string;
}

export const PageFilters: React.FC<PageFiltersProps> = ({
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  filters = [],
  className = ''
}) => {
  return (
    <div className={`page-filters ${className}`}>
      {onSearchChange && (
        <div className="filter-search-wrapper">
          <Search className="filter-search-icon" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-search-input"
          />
        </div>
      )}
      
      {filters.map((filter, index) => (
        <Select key={index} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className={`filter-select ${filter.className || ''}`}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};
