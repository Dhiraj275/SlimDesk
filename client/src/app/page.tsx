'use client';

import { useAuth } from '@/features/auth/providers/auth-provider';
import { redirect } from 'next/navigation';
import LandingPage from '@/features/landing/components/landing-page';

export default function Page() {
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) return null;
  // if (isAuthenticated) redirect('/dashboard/overview');

  return <LandingPage />;
}
