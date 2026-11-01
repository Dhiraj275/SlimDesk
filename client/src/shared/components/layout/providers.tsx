'use client';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import { AuthProvider } from '@/features/auth/providers/auth-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthProvider>
        <ActiveThemeProvider initialTheme={activeThemeValue}>
          {children}
        </ActiveThemeProvider>
      </AuthProvider>
    </>
  );
}
