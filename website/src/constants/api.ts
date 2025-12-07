export const API_ENDPOINTS = {
    content: {
      list: '/api/content',
      detail: (slug: string) => `/api/content/${slug}`,
      search: '/api/search'
    }
  } as const;
  
  export const API_ERROR_MESSAGES = {
    notFound: 'Resource not found',
    invalidRequest: 'Invalid request',
    serverError: 'Internal server error'
  } as const;