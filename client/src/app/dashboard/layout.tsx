'use client';

import { useAuth } from '@/features/auth/providers/auth-provider';
import KBar from '@/shared/components/kbar';
import AppSidebar from '@/shared/components/layout/app-sidebar';
import Header from '@/shared/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const defaultOpen = true;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen} className='h-svh max-h-svh overflow-hidden'>
        <AppSidebar />
        <SidebarInset className='h-full max-h-full overflow-hidden flex flex-col'>
          <Header />
          {/* page main content */}
          <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
            {children}
          </div>
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
