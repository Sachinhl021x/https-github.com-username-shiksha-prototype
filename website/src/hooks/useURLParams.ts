// src/hooks/useURLParams.ts

'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type Route } from 'next';

export function useURLParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateURLParams = useCallback((params: Record<string, string | undefined>) => {
    // Create new URLSearchParams instance
    const newParams = new URLSearchParams(searchParams);
    
    // Update parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });

    // Convert to string
    const search = newParams.toString();
    const query = search ? `?${search}` : '';
    
    // Use router.push with path as a template literal
    router.replace(`${pathname}${query}` as Route);
  }, [pathname, router, searchParams]);

  const getURLParams = useCallback(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    updateURLParams,
    getURLParams
  };
}