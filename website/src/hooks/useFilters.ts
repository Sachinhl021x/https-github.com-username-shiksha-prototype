// src/hooks/useFilters.ts

'use client';

import { useState, useCallback } from 'react';
import { useURLParams } from './useURLParams';
import { ContentFilters } from '@/lib/types/content';

const defaultFilters: ContentFilters = {
  category: undefined,
  timeframe: undefined,
  searchQuery: undefined,
  isApplied: false
};

export function useFilters(initialFilters: ContentFilters = defaultFilters) {
  const { updateURLParams, getURLParams } = useURLParams();
  const [filters, setFilters] = useState<ContentFilters>(() => ({
    ...defaultFilters,
    ...initialFilters,
    ...getURLParams()
  }));

  const updateFilters = useCallback((updates: Partial<ContentFilters>) => {
    setFilters((current: ContentFilters) => {
      const newFilters = { ...current, ...updates, isApplied: true };
      // Convert filters to string values for URL
      const urlParams: Record<string, string | undefined> = {};
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          urlParams[key] = String(value);
        }
      });
      updateURLParams(urlParams);
      return newFilters;
    });
  }, [updateURLParams]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    updateURLParams({});
  }, [updateURLParams]);

  return {
    filters,
    updateFilters,
    resetFilters
  };
}