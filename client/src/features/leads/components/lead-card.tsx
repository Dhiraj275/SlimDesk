'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Lead, LeadStatus } from '../types/lead.types';
import { LeadSourceBadge, LeadStatusBadge } from './lead-status-badge';
import { cn } from '@/shared/utils/utils';
import {
  IconDotsVertical,
  IconCalendar,
  IconCalendarExclamation,
  IconCheck,
  IconChevronRight,
  IconPhone,
  IconMail,
  IconBuilding,
  IconArrowsExchange,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';

export function LeadCard({
  lead,
  onUpdateStatus,
  onConvert,
  onScheduleFollowUp,
  onDelete,
}: {
  lead: Lead;
  onUpdateStatus?: (lead: Lead) => void;
  onConvert?: (lead: Lead) => void;
  onScheduleFollowUp?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}) {
  const isOverdue =
    lead.nextFollowUpDate &&
    new Date(lead.nextFollowUpDate) <= new Date() &&
    lead.status !== LeadStatus.CONVERTED &&
    lead.status !== LeadStatus.LOST;

  const formattedBudget =
    lead.estimatedBudget !== undefined && lead.estimatedBudget !== null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: lead.currency || 'USD',
          maximumFractionDigits: 0,
        }).format(Number(lead.estimatedBudget))
      : null;

  return (
    <Card className='group relative border-border/50 bg-card hover:border-border transition-all duration-200 hover:shadow-xs'>
      <CardContent className='p-4 space-y-3'>
        {/* Top Header: Title & Actions */}
        <div className='flex items-start justify-between gap-2'>
          <div className='space-y-0.5 flex-1 min-w-0'>
            <Link
              href={`/dashboard/leads/${lead.leadId}`}
              className='font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1'
            >
              {lead.name}
            </Link>
            <p className='text-xs text-muted-foreground line-clamp-1'>
              {lead.title || lead.interestedService || 'General Opportunity'}
            </p>
          </div>

          <div className='flex items-center gap-1 shrink-0'>
            <LeadStatusBadge status={lead.status} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7 text-muted-foreground'>
                  <IconDotsVertical className='h-3.5 w-3.5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/leads/${lead.leadId}`}>
                    View Details
                  </Link>
                </DropdownMenuItem>
                {onUpdateStatus && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(lead)}>
                    <IconArrowsExchange className='mr-2 h-4 w-4' />
                    Change Stage
                  </DropdownMenuItem>
                )}
                {onScheduleFollowUp && lead.status !== LeadStatus.CONVERTED && (
                  <DropdownMenuItem onClick={() => onScheduleFollowUp(lead)}>
                    <IconCalendar className='mr-2 h-4 w-4' />
                    Schedule Follow-up
                  </DropdownMenuItem>
                )}
                {onConvert && lead.status !== LeadStatus.CONVERTED && (
                  <DropdownMenuItem
                    onClick={() => onConvert(lead)}
                    className='text-emerald-600 focus:text-emerald-600 dark:text-emerald-400 font-medium'
                  >
                    <IconCheck className='mr-2 h-4 w-4 stroke-[2.5]' />
                    Convert to Client
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(lead)}
                      className='text-destructive focus:text-destructive'
                    >
                      <IconTrash className='mr-2 h-4 w-4' />
                      Delete Lead
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Company & Source */}
        <div className='flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground'>
          {lead.company && (
            <span className='inline-flex items-center gap-1 truncate max-w-[150px]'>
              <IconBuilding className='h-3.5 w-3.5 opacity-60' />
              {lead.company}
            </span>
          )}
          <LeadSourceBadge source={lead.source} />
        </div>

        {/* Budget & Follow-up Footer */}
        <div className='pt-2 border-t border-border/40 flex items-center justify-between text-xs'>
          {formattedBudget ? (
            <span className='font-semibold tabular-nums text-foreground'>
              {formattedBudget}
            </span>
          ) : (
            <span className='text-muted-foreground/60'>Budget TBD</span>
          )}

          {/* Follow-up reminder indicator */}
          {lead.nextFollowUpDate && lead.status !== LeadStatus.CONVERTED && lead.status !== LeadStatus.LOST ? (
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
                isOverdue
                  ? 'border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300'
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              {isOverdue ? (
                <IconCalendarExclamation className='h-3 w-3 shrink-0' />
              ) : (
                <IconCalendar className='h-3 w-3 shrink-0' />
              )}
              <span>
                {new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          ) : (
            <Link
              href={`/dashboard/leads/${lead.leadId}`}
              className='text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors'
            >
              <span>View</span>
              <IconChevronRight className='h-3 w-3' />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
