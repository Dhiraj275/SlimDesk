import { Metadata } from 'next';
import LoginView from '@/features/auth/components/login-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function Page() {
  return <LoginView />;
}
