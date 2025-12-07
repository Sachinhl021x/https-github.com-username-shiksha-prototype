declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      DDB_CONTENT_TABLE: string;
      DDB_CATEGORIES_TABLE: string;
      ENVIRONMENT: 'development' | 'production';
    }
  }