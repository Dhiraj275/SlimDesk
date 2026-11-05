'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { QuotationMetrics } from '../types/quotation.types';
import {
  IconFileInvoice,
  IconSend,
  IconCheck,
  IconReceipt,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface QuotationsOverviewCardsProps {
  metrics: QuotationMetrics | null;
  isLoading?: boolean;
  activeFilter?: string | null;
  onFilterClick?: (filterKey: string) => void;
}

export const QuotationsOverviewCards: React.FC<QuotationsOverviewCardsProps> = ({
  metrics,
  isLoading = false,
  activeFilter,
  onFilterClick,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const cards = [
    {
      key: 'all',
      title: 'Total Quotations',
      value: isLoading ? '...' : (metrics?.total ?? 0).toLocaleString(),
      icon: IconFileInvoice,
      description: `${metrics?.draft ?? 0} drafts in progress`,
      badge: null,
      color: 'text-foreground',
    },
    {
      key: 'sent',
      title: 'Sent & In Review',
      value: isLoading
        ? '...'
        : ((metrics?.sent ?? 0) + (metrics?.viewed ?? 0)).toLocaleString(),
      icon: IconSend,
      description: `${metrics?.viewed ?? 0} viewed by clients`,
      badge: (
        <Badge
          variant='outline'
          className='border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-medium'
        >
          Active
        </Badge>
      ),
      color: 'text-sky-600 dark:text-sky-400',
    },
    {
      key: 'accepted',
      title: 'Accepted Value',
      value: isLoading
        ? '...'
        : formatCurrency(metrics?.acceptedValue ?? 0),
      icon: IconCheck,
      description: `${(metrics?.accepted ?? 0) + (metrics?.converted ?? 0)} deals won`,
      badge: (
        <Badge
          variant='outline'
          className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium'
        >
          Won
        </Badge>
      ),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'converted',
      title: 'Invoiced & Converted',
      value: isLoading ? '...' : (metrics?.converted ?? 0).toLocaleString(),
      icon: IconReceipt,
      description: `${metrics?.rejected ?? 0} declined offers`,
      badge: (
        <Badge
          variant='outline'
          className='border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium'
        >
          Billed
        </Badge>
      ),
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0'>
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onFilterClick && onFilterClick(card.key)}
            className={cn(
              'group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 cursor-pointer hover:border-border hover:shadow-xs shadow-xs',
              isActive && 'ring-2 ring-primary border-primary/50'
            )}
          >
            {/* Top row: Title on left, Icon box on right */}
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                {card.title}
              </span>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-muted/30 text-muted-foreground group-hover:text-foreground transition-colors'>
                <Icon className='h-4 w-4' />
              </div>
            </div>

            {/* Middle row: Big metric number on left, Badge on right */}
            <div className='mt-3 flex items-baseline justify-between'>
              <div
                className={cn(
                  'text-3xl font-bold tracking-tight tabular-nums',
                  card.color
                )}
              >
                {card.value}
              </div>
              {card.badge}
            </div>

            {/* Bottom row: Subtitle description */}
            <p className='mt-1 text-xs text-muted-foreground'>
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
