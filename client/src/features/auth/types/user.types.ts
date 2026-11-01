export type User = {
  userId: string;
  email: string;
  displayName: string;
  name?: string;
  createdAt?: string | Date;
  role?: string;
  isAuthenticated: boolean;
};
