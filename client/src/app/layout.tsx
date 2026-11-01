import Providers from '@/shared/components/layout/providers';
import { fontVariables } from '@/shared/components/themes/font.config';
import ThemeProvider from '@/shared/components/themes/theme-provider';
import { DEFAULT_THEME } from '@/shared/components/themes/theme.config';
import { Toaster } from '@/shared/components/ui/sonner';
import { cn } from '@/shared/utils/utils';
import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '../styles/globals.css';
const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'SlimDesk — Lightweight CRM',
  description: 'A lightweight CRM for freelancers, agencies, and small businesses.',
  other: {
    'darkreader-lock': ''
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // const cookieStore = await cookies();
  // const activeThemeValue = cookieStore.get('active_theme')?.value;
  const themeToApply = DEFAULT_THEME;

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply} className={fontVariables}>
      <head>
        <meta name='darkreader-lock' content='' />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set meta theme color
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
