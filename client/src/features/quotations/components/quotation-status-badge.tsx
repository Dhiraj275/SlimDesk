'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/utils';
import { QuotationStatus } from '../types/quotation.types';
import { IconCheck, IconX, IconClock, IconReceipt } from '@tabler/icons-react';

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  className?: string;
}

export const QUOTATION_STATUS_CONFIG: Record<
  QuotationStatus,
  {
    label: string;
    className: string;
    dotColor: string;
    isTerminal?: boolean;
  }
> = {
  draft: {
    label: 'Draft',
    className:
      'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-300 hover:bg-slate-500/15',
    dotColor: 'bg-slate-500 dark:bg-slate-400',
  },
  sent: {
    label: 'Sent',
    className:
      'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300 hover:bg-sky-500/15',
    dotColor: 'bg-sky-500 dark:bg-sky-400',
  },
  viewed: {
    label: 'Viewed',
    className:
      'border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300 hover:bg-indigo-500/15',
    dotColor: 'bg-indigo-500 dark:bg-indigo-400',
  },
  accepted: {
    label: 'Accepted',
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 font-semibold hover:bg-emerald-500/15',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    isTerminal: true,
  },
  converted: {
    label: 'Invoiced',
    className:
      'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:border-purple-400/30 dark:bg-purple-400/10 dark:text-purple-300 font-semibold hover:bg-purple-500/15',
    dotColor: 'bg-purple-500 dark:bg-purple-400',
    isTerminal: true,
  },
  rejected: {
    label: 'Declined',
    className:
      'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 hover:bg-rose-500/15',
    dotColor: 'bg-rose-500 dark:bg-rose-400',
    isTerminal: true,
  },
  expired: {
    label: 'Expired',
    className:
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 hover:bg-amber-500/15',
    dotColor: 'bg-amber-500 dark:bg-amber-400',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'border-slate-500/20 bg-slate-500/5 text-slate-500 dark:border-slate-500/25 dark:bg-slate-500/10 dark:text-slate-400 line-through',
    dotColor: 'bg-slate-400',
  },
};

export const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = QUOTATION_STATUS_CONFIG[status] || QUOTATION_STATUS_CONFIG.draft;

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-normal border shadow-2xs whitespace-nowrap transition-colors',
        config.className,
        className
      )}
    >
      {status === 'accepted' ? (
        <IconCheck className='h-3 w-3 stroke-[3]' />
      ) : status === 'converted' ? (
        <IconReceipt className='h-3 w-3 stroke-[2.5]' />
      ) : status === 'rejected' ? (
        <IconX className='h-3 w-3 stroke-[2.5]' />
      ) : status === 'expired' ? (
        <IconClock className='h-3 w-3' />
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)} />
      )}
      <span>{config.label}</span>
    </Badge>
  );
};
