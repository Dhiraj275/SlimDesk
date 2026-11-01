export interface ApiErrorPayload {
  message?: string;
  statusCode?: number;
  errors?: Record<string, string[]>; // field-level errors
}

export class ApiError extends Error {
  status: number;
  code?: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload?.statusCode;
    this.errors = payload?.errors;
  }
}
