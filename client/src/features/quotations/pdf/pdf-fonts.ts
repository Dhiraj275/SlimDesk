import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

export const registerPdfFonts = () => {
  if (fontsRegistered) return;

  const baseUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';

  try {
    const interFonts = [
      {
        src: `${baseUrl}/fonts/inter/Inter-Light.ttf`,
        fontWeight: 'light' as const,
      },
      {
        src: `${baseUrl}/fonts/inter/Inter-Regular.ttf`,
        fontWeight: 'normal' as const,
      },
      {
        src: `${baseUrl}/fonts/inter/Inter-Medium.ttf`,
        fontWeight: 'medium' as const,
      },
      {
        src: `${baseUrl}/fonts/inter/Inter-SemiBold.ttf`,
        fontWeight: 'semibold' as const,
      },
      {
        src: `${baseUrl}/fonts/inter/Inter-Bold.ttf`,
        fontWeight: 'bold' as const,
      },
    ];

    const geistMonoFonts = [
      {
        src: `${baseUrl}/fonts/geistmono/GeistMono-Light.ttf`,
        fontWeight: 'light' as const,
      },
      {
        src: `${baseUrl}/fonts/geistmono/GeistMono-Regular.ttf`,
        fontWeight: 'normal' as const,
      },
      {
        src: `${baseUrl}/fonts/geistmono/GeistMono-Medium.ttf`,
        fontWeight: 'medium' as const,
      },
      {
        src: `${baseUrl}/fonts/geistmono/GeistMono-SemiBold.ttf`,
        fontWeight: 'semibold' as const,
      },
      {
        src: `${baseUrl}/fonts/geistmono/GeistMono-Bold.ttf`,
        fontWeight: 'bold' as const,
      },
    ];

    const jetbrainsMonoFonts = [
      {
        src: `${baseUrl}/fonts/jetbrains/JetBrainsMono-Light.ttf`,
        fontWeight: 'light' as const,
      },
      {
        src: `${baseUrl}/fonts/jetbrains/JetBrainsMono-Regular.ttf`,
        fontWeight: 'normal' as const,
      },
    ];

    Font.register({
      family: 'Inter',
      fonts: interFonts,
    });

    Font.register({
      family: 'ui-sans-serif',
      fonts: interFonts,
    });

    Font.register({
      family: 'sans-serif',
      fonts: interFonts,
    });

    Font.register({
      family: 'GeistMono',
      fonts: geistMonoFonts,
    });

    // Tailwind default font-mono resolves to 'ui-monospace' and 'monospace'
    Font.register({
      family: 'ui-monospace',
      fonts: geistMonoFonts,
    });

    Font.register({
      family: 'monospace',
      fonts: geistMonoFonts,
    });

    Font.register({
      family: 'JetBrainsMono',
      fonts: jetbrainsMonoFonts,
    });

    fontsRegistered = true;
  } catch (err) {
    console.warn('Failed to register PDF fonts:', err);
  }
};

