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
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    className: string;
    isTerminal?: boolean;
  }
> = {
  [LeadStatus.NEW]: {
    label: 'New',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border/50 hover:bg-muted',
  },
  [LeadStatus.CONTACTED]: {
    label: 'Contacted',
    variant: 'outline',
    className: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/15',
  },
  [LeadStatus.QUALIFIED]: {
    label: 'Qualified',
    variant: 'outline',
    className: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15',
  },
  [LeadStatus.PROPOSAL_SENT]: {
    label: 'Proposal Sent',
    variant: 'outline',
    className: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15',
  },
  [LeadStatus.NEGOTIATION]: {
    label: 'Negotiation',
    variant: 'outline',
    className: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/15',
  },
  [LeadStatus.CONVERTED]: {
    label: 'Converted',
    variant: 'outline',
    className: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold hover:bg-emerald-500/15',
    isTerminal: true,
  },
  [LeadStatus.LOST]: {
    label: 'Lost',
    variant: 'destructive',
    className: 'border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/15',
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
      variant={config.variant}
      className={cn('text-xs px-2 py-0.5 font-medium tracking-tight whitespace-nowrap', config.className, className)}
    >
      {status === LeadStatus.CONVERTED && <IconCheck className='mr-1 h-3 w-3 stroke-[2.5]' />}
      {status === LeadStatus.LOST && <IconX className='mr-1 h-3 w-3 stroke-[2.5]' />}
      {config.label}
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
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 font-medium',
          className
        )}
      >
        <IconCheck className='mr-1 h-3 w-3 stroke-[2.5]' />
        Qualified
      </Badge>
    );
  }

  return (
    <Badge
      variant='outline'
      className={cn(
        'border-border/50 bg-muted/50 text-muted-foreground text-xs px-2 py-0.5 font-normal',
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
