// src/constants/routes.ts

import { type Route } from 'next';

export const ROUTES = {
    home: '/' as Route,
    updates: {
      index: '/updates' as Route,
      detail: (slug: string) => `/updates/${slug}` as Route,
    },
    engineering: {
      index: '/engineering' as Route,
      detail: (slug: string) => `/engineering/${slug}` as Route,
    },
    research: {
      index: '/research' as Route,
      detail: (slug: string) => `/research/${slug}` as Route,
    }
} as const;