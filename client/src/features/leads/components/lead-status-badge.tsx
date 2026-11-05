'use client';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/utils';
import { LeadSource, LeadStatus } from '../types/lead.types';
import {
  IconCheck,
  IconX,
  IconWorld,
  IconBrandLinkedin,
  IconBrandInstagram,
  IconUserCheck,
  IconBuildingStore,
  IconSend,
  IconHelpCircle,
} from '@tabler/icons-react';

export const STATUS_CONFIG: Record<
  LeadStatus,
  {
    label: string;
    className: string;
    dotColor: string;
    isTerminal?: boolean;
  }
> = {
  [LeadStatus.NEW]: {
    label: 'New',
    className:
      'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-300 hover:bg-slate-500/15',
    dotColor: 'bg-slate-500 dark:bg-slate-400',
  },
  [LeadStatus.CONTACTED]: {
    label: 'Contacted',
    className:
      'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300 hover:bg-sky-500/15',
    dotColor: 'bg-sky-500 dark:bg-sky-400',
  },
  [LeadStatus.QUALIFIED]: {
    label: 'Qualified',
    className:
      'border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300 hover:bg-indigo-500/15',
    dotColor: 'bg-indigo-500 dark:bg-indigo-400',
  },
  [LeadStatus.PROPOSAL_SENT]: {
    label: 'Proposal Sent',
    className:
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 hover:bg-amber-500/15',
    dotColor: 'bg-amber-500 dark:bg-amber-400',
  },
  [LeadStatus.NEGOTIATION]: {
    label: 'Negotiation',
    className:
      'border-purple-500/25 bg-purple-500/10 text-purple-700 dark:border-purple-400/25 dark:bg-purple-400/10 dark:text-purple-300 hover:bg-purple-500/15',
    dotColor: 'bg-purple-500 dark:bg-purple-400',
  },
  [LeadStatus.CONVERTED]: {
    label: 'Converted',
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 font-semibold hover:bg-emerald-500/15',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    isTerminal: true,
  },
  [LeadStatus.LOST]: {
    label: 'Lost',
    className:
      'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 hover:bg-rose-500/15',
    dotColor: 'bg-rose-500 dark:bg-rose-400',
    isTerminal: true,
  },
};

export const SOURCE_CONFIG: Record<
  LeadSource,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  [LeadSource.WEBSITE]: { label: 'Website', icon: IconWorld },
  [LeadSource.LINKEDIN]: { label: 'LinkedIn', icon: IconBrandLinkedin },
  [LeadSource.INSTAGRAM]: { label: 'Instagram', icon: IconBrandInstagram },
  [LeadSource.REFERRAL]: { label: 'Referral', icon: IconUserCheck },
  [LeadSource.MARKETPLACE]: { label: 'Marketplace', icon: IconBuildingStore },
  [LeadSource.COLD_OUTREACH]: { label: 'Cold Outreach', icon: IconSend },
  [LeadSource.OTHER]: { label: 'Other', icon: IconHelpCircle },
};

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[LeadStatus.NEW];

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-normal border shadow-2xs whitespace-nowrap transition-colors',
        config.className,
        className
      )}
    >
      {status === LeadStatus.CONVERTED ? (
        <IconCheck className='h-3 w-3 stroke-[2.5] text-emerald-600 dark:text-emerald-400 shrink-0' />
      ) : status === LeadStatus.LOST ? (
        <IconX className='h-3 w-3 stroke-[2.5] text-rose-600 dark:text-rose-400 shrink-0' />
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)} />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}

export function LeadQualificationBadge({
  isQualified,
  className,
}: {
  isQualified: boolean;
  className?: string;
}) {
  if (isQualified) {
    return (
      <Badge
        variant='outline'
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300 shadow-2xs',
          className
        )}
      >
        <IconCheck className='h-3 w-3 stroke-[2.5] text-emerald-600 dark:text-emerald-400' />
        Qualified
      </Badge>
    );
  }

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-normal border-border/60 bg-muted/40 text-muted-foreground shadow-2xs',
        className
      )}
    >
      Unqualified
    </Badge>
  );
}

export function LeadSourceBadge({
  source,
  className,
}: {
  source: LeadSource;
  className?: string;
}) {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG[LeadSource.OTHER];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-muted-foreground',
        className
      )}
    >
      <Icon className='h-3.5 w-3.5 shrink-0 opacity-70' />
      <span>{config.label}</span>
    </span>
  );
}
