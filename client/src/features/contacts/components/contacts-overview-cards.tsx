'use client';

import { Badge } from '@/shared/components/ui/badge';
import { ContactMetrics } from '../types/contact.types';
import {
  IconAddressBook,
  IconUserCheck,
  IconUser,
  IconBriefcase,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

export function ContactsOverviewCards({
  metrics,
  activeFilter,
  onFilterClick,
}: {
  metrics: ContactMetrics;
  activeFilter?: string | null;
  onFilterClick?: (filterKey: string) => void;
}) {
  const cards = [
    {
      key: 'all',
      title: 'Total Contacts',
      value: metrics.totalContacts,
      icon: IconAddressBook,
      description: 'People and businesses in directory',
      badge: null,
      color: 'text-foreground',
    },
    {
      key: 'clients',
      title: 'Paying Clients',
      value: metrics.activeClients,
      icon: IconUserCheck,
      description: 'Active client accounts',
      badge: (
        <Badge
          variant='outline'
          className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold'
        >
          Clients
        </Badge>
      ),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'prospects',
      title: 'Prospects',
      value: metrics.prospects,
      icon: IconUser,
      description: 'Leads & future opportunities',
      badge: (
        <Badge
          variant='outline'
          className='border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-medium'
        >
          Prospects
        </Badge>
      ),
      color: 'text-sky-600 dark:text-sky-400',
    },
    {
      key: 'deals',
      title: 'Linked Deals',
      value: metrics.totalDeals,
      icon: IconBriefcase,
      description: metrics.totalValue > 0
        ? `$${metrics.totalValue.toLocaleString()} in opportunity value`
        : 'Total active deal pipeline',
      badge: metrics.totalDeals > 0 ? (
        <Badge
          variant='outline'
          className='border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium'
        >
          Pipeline
        </Badge>
      ) : null,
      color: 'text-indigo-600 dark:text-indigo-400',
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
                {card.value.toLocaleString()}
              </div>
              {card.badge}
            </div>

            {/* Bottom row: Subtitle description */}
            <p className='mt-1 text-xs text-muted-foreground truncate'>
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

