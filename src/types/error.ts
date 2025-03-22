export interface AppError extends Error {
  message: string;
  status?: number;
  code?: string;
}
