export type ApiResult<T> = {
  success: boolean;
  data: T | null;
  message?: string;
  error?: string;
};
