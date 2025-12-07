export const CONTENT_CONFIG = {
    types: {
      update: 'ai-updates',
      engineering: 'ai-engineering',
      thoughts: 'ai-thoughts'
    },
    limits: {
      preview: 3,
      pageSize: 12,
      maxPages: 100
    },
    sorting: {
      latest: 'latest',
      popular: 'popular',
      priority: 'priority'
    },
    defaults: {
      sort: 'latest',
      limit: 12
    }
  } as const;