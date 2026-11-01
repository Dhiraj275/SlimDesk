'use client';

import { Lead, LeadStatus } from '../types/lead.types';
import { LeadSourceBadge, LeadStatusBadge } from './lead-status-badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconCalendar,
  IconCalendarExclamation,
  IconCheck,
  IconBuilding,
  IconArrowsExchange,
  IconTrash,
  IconPlus,
  IconInbox,
  IconChevronRight,
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/utils';

export function LeadListView({
  leads,
  onUpdateStatus,
  onConvert,
  onScheduleFollowUp,
  onDelete,
  onNewLeadClick,
}: {
  leads: Lead[];
  onUpdateStatus: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onNewLeadClick: () => void;
}) {
  if (leads.length === 0) {
    return (
      <div className='flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-8 text-center bg-card/40'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4'>
          <IconInbox className='h-6 w-6 opacity-60' />
        </div>
        <h3 className='text-base font-semibold text-foreground'>No leads found</h3>
        <p className='text-sm text-muted-foreground max-w-sm mt-1 mb-4'>
          No opportunities match your current filter criteria or you haven't captured any leads yet.
        </p>
        <Button onClick={onNewLeadClick} size='sm' className='gap-1.5'>
          <IconPlus className='h-4 w-4' />
          Capture First Lead
        </Button>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs w-full min-w-0 max-w-full'>
      <div className='overflow-x-auto custom-scrollbar pb-1'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground'>
              <th className='py-3.5 pl-4 pr-3 sm:pl-6'>Lead / Opportunity</th>
              <th className='px-3 py-3.5'>Stage</th>
              <th className='px-3 py-3.5'>Source</th>
              <th className='px-3 py-3.5'>Estimated Budget</th>
              <th className='px-3 py-3.5'>Next Follow-up</th>
              <th className='py-3.5 pl-3 pr-4 text-right sm:pr-6'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40'>
            {leads.map((lead) => {
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
                  : '—';

              return (
                <tr
                  key={lead.leadId}
                  className='hover:bg-muted/30 transition-colors group'
                >
                  {/* Lead Info */}
                  <td className='py-3.5 pl-4 pr-3 sm:pl-6'>
                    <div className='flex flex-col'>
                      <Link
                        href={`/dashboard/leads/${lead.leadId}`}
                        className='font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5'
                      >
                        <span>{lead.name}</span>
                        <IconChevronRight className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                      </Link>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground mt-0.5'>
                        <span>{lead.title || lead.interestedService || 'General Opportunity'}</span>
                        {lead.company && (
                          <>
                            <span>·</span>
                            <span className='inline-flex items-center gap-0.5'>
                              <IconBuilding className='h-3 w-3 opacity-50' />
                              {lead.company}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Stage */}
                  <td className='px-3 py-3.5'>
                    <LeadStatusBadge status={lead.status} />
                  </td>

                  {/* Source */}
                  <td className='px-3 py-3.5'>
                    <LeadSourceBadge source={lead.source} />
                  </td>

                  {/* Budget */}
                  <td className='px-3 py-3.5 font-medium tabular-nums'>
                    {formattedBudget}
                  </td>

                  {/* Next Follow-up */}
                  <td className='px-3 py-3.5'>
                    {lead.nextFollowUpDate && lead.status !== LeadStatus.CONVERTED && lead.status !== LeadStatus.LOST ? (
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
                          isOverdue
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {isOverdue ? (
                          <IconCalendarExclamation className='h-3.5 w-3.5 shrink-0' />
                        ) : (
                          <IconCalendar className='h-3.5 w-3.5 shrink-0' />
                        )}
                        <span>
                          {new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground/50'>None</span>
                    )}
                  </td>

                  {/* Quick Actions */}
                  <td className='py-3.5 pl-3 pr-4 text-right sm:pr-6'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        >
                          <IconDotsVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48'>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/leads/${lead.leadId}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(lead)}>
                          <IconArrowsExchange className='mr-2 h-4 w-4' />
                          Change Stage
                        </DropdownMenuItem>
                        {lead.status !== LeadStatus.CONVERTED && (
                          <DropdownMenuItem onClick={() => onScheduleFollowUp(lead)}>
                            <IconCalendar className='mr-2 h-4 w-4' />
                            Schedule Follow-up
                          </DropdownMenuItem>
                        )}
                        {lead.status !== LeadStatus.CONVERTED && (
                          <DropdownMenuItem
                            onClick={() => onConvert(lead)}
                            className='text-emerald-600 focus:text-emerald-600 dark:text-emerald-400 font-medium'
                          >
                            <IconCheck className='mr-2 h-4 w-4 stroke-[2.5]' />
                            Convert to Client
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(lead)}
                          className='text-destructive focus:text-destructive'
                        >
                          <IconTrash className='mr-2 h-4 w-4' />
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
