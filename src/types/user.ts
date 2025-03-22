export interface User {
  id: string;
  email?: string;
  app_metadata?: {
    provider?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    [key: string]: unknown;
  };
  aud?: string;
  created_at?: string;
}

export type UserResponse = {
  user: User | null;
};
