'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { InvoiceMetrics } from '../types/invoice.types';
import {
  IconReceipt2,
  IconCircleCheck,
  IconClock,
  IconAlertCircle,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface InvoicesOverviewCardsProps {
  metrics: InvoiceMetrics | null;
  isLoading?: boolean;
  activeFilter?: string | null;
  onFilterClick?: (filterKey: string) => void;
}

export const InvoicesOverviewCards: React.FC<InvoicesOverviewCardsProps> = ({
  metrics,
  isLoading = false,
  activeFilter,
  onFilterClick,
}) => {
  const formatCompactCurrency = (val: number) => {
    const num = Number(val) || 0;
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')} K`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const cards = [
    {
      key: 'invoiced',
      title: 'Total Invoiced',
      value: isLoading ? '...' : formatCompactCurrency(metrics?.totalInvoiced ?? 0),
      icon: IconReceipt2,
      description: `${metrics?.issuedCount ?? 0} issued · ${metrics?.draftCount ?? 0} drafts`,
      badge: (
        <Badge
          variant='outline'
          className='border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium'
        >
          {metrics?.totalCount ?? 0} Total
        </Badge>
      ),
      color: 'text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      key: 'received',
      title: 'Received',
      value: isLoading ? '...' : formatCompactCurrency(metrics?.totalReceived ?? 0),
      icon: IconCircleCheck,
      description: `${metrics?.paidCount ?? 0} fully paid · ${metrics?.partiallyPaidCount ?? 0} partial`,
      badge: (
        <Badge
          variant='outline'
          className='border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium'
        >
          Collected
        </Badge>
      ),
      color: 'text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      key: 'outstanding',
      title: 'Outstanding',
      value: isLoading ? '...' : formatCompactCurrency(metrics?.totalOutstanding ?? 0),
      icon: IconClock,
      description: `${metrics?.unpaidCount ?? 0} unpaid · ${metrics?.partiallyPaidCount ?? 0} partial balance`,
      badge: (
        <Badge
          variant='outline'
          className='border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium'
        >
          Receivable
        </Badge>
      ),
      color: 'text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
    {
      key: 'overdue',
      title: 'Overdue',
      value: isLoading ? '...' : formatCompactCurrency(metrics?.totalOverdue ?? 0),
      icon: IconAlertCircle,
      description: `${metrics?.overdueCount ?? 0} invoices past payment deadline`,
      badge: (
        <Badge
          variant='outline'
          className='border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-medium'
        >
          Urgent
        </Badge>
      ),
      color: 'text-rose-600 dark:text-rose-400',
      borderHover: 'hover:border-rose-500/40',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0'>
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onFilterClick && onFilterClick(card.key)}
            className={cn(
              'relative rounded-xl border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between',
              'hover:shadow-md hover:-translate-y-0.5',
              card.borderHover,
              isSelected
                ? 'ring-2 ring-primary border-primary bg-accent/20'
                : 'border-border/60 hover:border-border'
            )}
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='flex items-center gap-2.5'>
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg bg-muted/80',
                    card.color
                  )}
                >
                  <Icon className='h-5 w-5' />
                </div>
                <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
                  {card.title}
                </span>
              </div>
              {card.badge}
            </div>

            <div className='mt-4 space-y-1'>
              <div className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
                {card.value}
              </div>
              <p className='text-xs text-muted-foreground line-clamp-1'>
                {card.description}
              </p>
            </div>

            {isSelected && (
              <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
            )}
          </div>
        );
      })}
    </div>
  );
};
