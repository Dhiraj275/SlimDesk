'use client';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import { AuthProvider } from '@/features/auth/providers/auth-provider';
import { SettingsProvider } from '@/features/settings/context/settings-context';

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
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ActiveThemeProvider>
      </AuthProvider>
    </>
  );
}
