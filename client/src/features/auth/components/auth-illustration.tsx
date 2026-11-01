'use client';

import { cn } from '@/shared/utils/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'circle' | 'square' | 'triangle' | 'ring';
  delay: number;
  duration: number;
}

function generateShapes(count: number): FloatingShape[] {
  const types: FloatingShape['type'][] = ['circle', 'square', 'triangle', 'ring'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 60,
    rotation: Math.random() * 360,
    type: types[i % types.length],
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 20,
  }));
}

function Shape({ shape }: { shape: FloatingShape }) {
  const style: React.CSSProperties = {
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    width: shape.size,
    height: shape.size,
    animationDelay: `${shape.delay}s`,
    animationDuration: `${shape.duration}s`,
  };

  const baseClass =
    'absolute opacity-[0.07] animate-[float_linear_infinite_alternate]';

  switch (shape.type) {
    case 'circle':
      return (
        <div
          className={cn(baseClass, 'rounded-full bg-primary')}
          style={style}
        />
      );
    case 'square':
      return (
        <div
          className={cn(baseClass, 'rounded-lg border-2 border-primary')}
          style={{
            ...style,
            transform: `rotate(${shape.rotation}deg)`,
          }}
        />
      );
    case 'triangle':
      return (
        <div
          className={cn(baseClass)}
          style={{
            ...style,
            width: 0,
            height: 0,
            borderLeft: `${shape.size / 2}px solid transparent`,
            borderRight: `${shape.size / 2}px solid transparent`,
            borderBottom: `${shape.size}px solid var(--primary)`,
            transform: `rotate(${shape.rotation}deg)`,
            background: 'none',
          }}
        />
      );
    case 'ring':
      return (
        <div
          className={cn(
            baseClass,
            'rounded-full border-2 border-primary bg-transparent'
          )}
          style={style}
        />
      );
  }
}

export function AuthIllustration({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [shapes, setShapes] = useState<FloatingShape[]>([]);

  useEffect(() => {
    setShapes(generateShapes(12));
  }, []);

  return (
    <div className='relative hidden h-full flex-col overflow-hidden lg:flex'>
      {/* Gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5' />

      {/* Radial glow */}
      <div className='absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl' />

      {/* Floating shapes */}
      <div className='absolute inset-0'>
        {shapes.map((shape) => (
          <Shape key={shape.id} shape={shape} />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div
        className='absolute inset-0 opacity-[0.03]'
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
