'use client';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/utils';
import { IconCheck, IconUser } from '@tabler/icons-react';

export function ContactStatusBadge({
  isClient,
  className,
}: {
  isClient: boolean;
  className?: string;
}) {
  if (isClient) {
    return (
      <Badge
        variant='outline'
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-2xs whitespace-nowrap transition-colors',
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 hover:bg-emerald-500/15',
          className
        )}
      >
        <IconCheck className='h-3 w-3 stroke-[2.5] text-emerald-600 dark:text-emerald-400 shrink-0' />
        <span>Client</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border shadow-2xs whitespace-nowrap transition-colors',
        'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-300 hover:bg-slate-500/15',
        className
      )}
    >
      <IconUser className='h-3 w-3 stroke-[2] text-slate-500 dark:text-slate-400 shrink-0' />
      <span>Prospect</span>
    </Badge>
  );
}

