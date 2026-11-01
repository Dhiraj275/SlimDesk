import { Metadata } from 'next';
import RegisterView from '@/features/auth/components/register-view';

export const metadata: Metadata = {
  title: 'Authentication | Create Account',
  description: 'Create a new account to get started.'
};

export default function Page() {
  return <RegisterView />;
}
