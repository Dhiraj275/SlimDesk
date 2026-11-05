'use client';

import Image from 'next/image';

export function AuthIllustration({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className='relative hidden h-full flex-col overflow-hidden lg:flex'>
      {/* Background gradient with subtle reddish aura */}
      <div className='absolute inset-0 bg-gradient-to-br from-rose-500/10 via-background to-rose-950/20' />

      {/* Atmospheric reddish accent glow centered around the text area */}
      <div className='pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/20 dark:bg-rose-500/25 blur-[140px]' />
      <div className='pointer-events-none absolute left-1/4 top-2/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-rose-600/15 dark:bg-rose-600/20 blur-[110px]' />

      {/* Subtle grid pattern overlay */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(to right, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className='relative z-10 flex h-full flex-col justify-between p-10'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <Image
            src='/assets/logo.png'
            alt='SlimDesk'
            width={75}
            height={24}
            className='h-8 w-auto object-contain'
            priority
            suppressHydrationWarning
          />
        </div>

        {/* Center text */}
        <div className='space-y-4'>
          <h2 className='text-4xl font-bold leading-tight tracking-tight text-foreground'>
            {title}
          </h2>
          <p className='max-w-sm text-lg text-muted-foreground'>{subtitle}</p>
        </div>

        {/* Bottom copyright / info */}
        <div>
          <p className='text-xs text-muted-foreground'>
            MIT Licensed · Self-hostable · Built by{' '}
            <a
              href='https://github.com/Dhiraj275'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              Dhiraj
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
