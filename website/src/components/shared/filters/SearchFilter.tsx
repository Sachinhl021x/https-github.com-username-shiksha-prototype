'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
}

export function SearchFilter({
  onSearch,
  placeholder = 'Search...',
  disabled,
  initialValue = ''
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50"
      />
    </div>
  );
}