'use client';

import { useMemo } from 'react';
import { Lead, LeadStatus } from '../types/lead.types';
import { LeadCard } from './lead-card';
import { STATUS_CONFIG } from './lead-status-badge';
import { cn } from '@/shared/utils/utils';
import { IconCheck, IconX } from '@tabler/icons-react';

const PIPELINE_COLUMNS: { status: LeadStatus; label: string; isTerminal?: boolean }[] = [
  { status: LeadStatus.NEW, label: 'New' },
  { status: LeadStatus.CONTACTED, label: 'Contacted' },
  { status: LeadStatus.QUALIFIED, label: 'Qualified' },
  { status: LeadStatus.PROPOSAL_SENT, label: 'Proposal Sent' },
  { status: LeadStatus.NEGOTIATION, label: 'Negotiation' },
  { status: LeadStatus.CONVERTED, label: 'Converted', isTerminal: true },
  { status: LeadStatus.LOST, label: 'Lost', isTerminal: true },
];

export function LeadKanbanView({
  leads,
  onUpdateStatus,
  onConvert,
  onScheduleFollowUp,
  onDelete,
}: {
  leads: Lead[];
  onUpdateStatus: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const totalPipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.status !== LeadStatus.LOST)
      .reduce((sum, l) => sum + (Number(l.estimatedBudget) || 0), 0);
  }, [leads]);

  return (
    <div className='w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border/50 bg-muted/10 p-3 sm:p-4'>
      {/* Board Summary Header */}
      <div className='mb-3 flex items-center justify-between border-b border-border/40 pb-2.5 px-1'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Pipeline Stages
          </span>
          <span className='rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground'>
            {PIPELINE_COLUMNS.length} Stages
          </span>
          {totalPipelineValue > 0 && (
            <span className='hidden sm:inline-flex rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold'>
              ${totalPipelineValue.toLocaleString()} Active Value
            </span>
          )}
        </div>
      </div>

      {/* Pure CSS Native Horizontal Scroll with Custom Scrollbar */}
      <div className='pipeline-scrollbar w-full min-w-0 max-w-full overflow-x-auto pb-3 pt-1'>
        <div className='flex gap-4 min-w-max pb-1'>
          {PIPELINE_COLUMNS.map((col) => {
            const columnLeads = leads.filter((lead) => lead.status === col.status);
            const totalStageBudget = columnLeads.reduce(
              (sum, l) => sum + (Number(l.estimatedBudget) || 0),
              0
            );

            return (
              <div
                key={col.status}
                className={cn(
                  'flex w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-card/90 p-3 shadow-2xs transition-colors',
                  col.status === LeadStatus.CONVERTED && 'border-emerald-500/30 bg-emerald-500/5',
                  col.status === LeadStatus.LOST && 'border-rose-500/25 bg-rose-500/5'
                )}
              >
                {/* Column Header */}
                <div className='mb-3 flex items-center justify-between px-1'>
                  <div className='flex items-center gap-2'>
                    {col.status === LeadStatus.CONVERTED && (
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'>
                        <IconCheck className='h-3 w-3 stroke-[2.5]' />
                      </div>
                    )}
                    {col.status === LeadStatus.LOST && (
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400'>
                        <IconX className='h-3 w-3 stroke-[2.5]' />
                      </div>
                    )}
                    <h4 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
                      {col.label}
                    </h4>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    {totalStageBudget > 0 && (
                      <span className='text-[10px] text-muted-foreground font-mono'>
                        ${totalStageBudget.toLocaleString()}
                      </span>
                    )}
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                        columnLeads.length > 0
                          ? 'bg-muted text-foreground'
                          : 'bg-muted/40 text-muted-foreground/60'
                      )}
                    >
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column Lead Cards with vertical column-scrollbar */}
                <div className='column-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[160px] pr-1'>
                  {columnLeads.length === 0 ? (
                    <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/40 p-4 text-center'>
                      <span className='text-xs text-muted-foreground/60'>No leads</span>
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <LeadCard
                        key={lead.leadId}
                        lead={lead}
                        onUpdateStatus={onUpdateStatus}
                        onConvert={onConvert}
                        onScheduleFollowUp={onScheduleFollowUp}
                        onDelete={onDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


