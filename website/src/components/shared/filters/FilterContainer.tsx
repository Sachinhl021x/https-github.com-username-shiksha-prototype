// src/components/shared/filters/FilterContainer.tsx

'use client';

import { Search, Filter, ArrowUpDown } from 'lucide-react';

export interface ContentFilters {
  category?: string;
  timeframe?: string;
  searchQuery?: string;
  type?: string;
}

interface FilterContainerProps {
  categories: string[];
  filters: ContentFilters;
  onFilterChange: (filters: ContentFilters) => void;
  isLoading?: boolean;
}

export function FilterContainer({
  categories,
  filters,
  onFilterChange,
  isLoading
}: FilterContainerProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50"
          />
        </div>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center gap-2 bg-white disabled:opacity-50"
            disabled={isLoading}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button 
            className="px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center gap-2 bg-white disabled:opacity-50"
            disabled={isLoading}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onFilterChange({ 
              ...filters, 
              category: filters.category === category ? undefined : category 
            })}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              filters.category === category
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}