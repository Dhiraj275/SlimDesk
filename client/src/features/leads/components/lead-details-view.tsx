'use client';

import { useState } from 'react';
import { Lead, LeadActivity, LeadFollowUp, LeadStatus, ActivityType } from '../types/lead.types';
import { LeadQualificationBadge, LeadSourceBadge, LeadStatusBadge } from './lead-status-badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { leadsApi } from '../api/leads.api';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconCalendar,
  IconCalendarExclamation,
  IconPhone,
  IconMail,
  IconBuilding,
  IconPlus,
  IconCalendarPlus,
  IconArrowsExchange,
  IconTrash,
  IconChecklist,
  IconHistory,
  IconSparkles,
  IconNotes,
  IconCalendarEvent,
  IconFileInvoice,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/utils';
import { UpdateStatusDialog } from './update-status-dialog';
import { ConvertLeadDialog } from './convert-lead-dialog';
import { ScheduleFollowUpDialog } from './schedule-followup-dialog';
import { AddActivityDialog } from './add-activity-dialog';

const ACTIVITY_ICONS: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  [ActivityType.LEAD_CREATED]: { icon: IconSparkles, color: 'text-primary bg-primary/10' },
  [ActivityType.NOTE]: { icon: IconNotes, color: 'text-muted-foreground bg-muted' },
  [ActivityType.CALL]: { icon: IconPhone, color: 'text-sky-600 bg-sky-500/10 dark:text-sky-400' },
  [ActivityType.EMAIL]: { icon: IconMail, color: 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400' },
  [ActivityType.MEETING]: { icon: IconCalendarEvent, color: 'text-purple-600 bg-purple-500/10 dark:text-purple-400' },
  [ActivityType.STATUS_CHANGE]: { icon: IconArrowsExchange, color: 'text-amber-600 bg-amber-500/10 dark:text-amber-400' },
  [ActivityType.FOLLOW_UP]: { icon: IconCalendar, color: 'text-blue-600 bg-blue-500/10 dark:text-blue-400' },
  [ActivityType.QUOTATION]: { icon: IconFileInvoice, color: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' },
  [ActivityType.CONVERSION]: { icon: IconCheck, color: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' },
};

export function LeadDetailsView({
  initialLead,
}: {
  initialLead: Lead;
}) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead>(initialLead);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [togglingQualification, setTogglingQualification] = useState(false);

  const reloadLead = async () => {
    try {
      const refreshed = await leadsApi.getLeadById(lead.leadId);
      setLead(refreshed);
    } catch {
      // Keep current state if background refresh fails
    }
  };

  const handleToggleQualification = async () => {
    setTogglingQualification(true);
    try {
      const updated = await leadsApi.updateLead(lead.leadId, {
        isQualified: !lead.isQualified,
      });
      setLead(updated);
      toast.success(
        updated.isQualified
          ? 'Lead evaluated as Qualified'
          : 'Lead marked as Unqualified'
      );
      reloadLead();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update qualification');
    } finally {
      setTogglingQualification(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    try {
      await leadsApi.completeFollowUp(lead.leadId, followUpId);
      toast.success('Follow-up marked as completed');
      reloadLead();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete follow-up');
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm('Are you sure you want to delete this lead opportunity? Associated contact history will be preserved.')) {
      return;
    }

    try {
      await leadsApi.deleteLead(lead.leadId);
      toast.success('Lead deleted');
      router.push('/dashboard/leads');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete lead');
    }
  };

  const formattedBudget =
    lead.estimatedBudget !== undefined && lead.estimatedBudget !== null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: lead.currency || 'USD',
          maximumFractionDigits: 0,
        }).format(Number(lead.estimatedBudget))
      : null;

  const isOverdue =
    lead.nextFollowUpDate &&
    new Date(lead.nextFollowUpDate) <= new Date() &&
    lead.status !== LeadStatus.CONVERTED &&
    lead.status !== LeadStatus.LOST;

  const pendingFollowUps = (lead.followUps || []).filter((f) => !f.isCompleted);
  const completedFollowUps = (lead.followUps || []).filter((f) => f.isCompleted);

  return (
    <div className='space-y-6 pb-12'>
      {/* Top Navigation */}
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' asChild className='-ml-2 gap-1.5 text-muted-foreground hover:text-foreground'>
          <Link href='/dashboard/leads'>
            <IconArrowLeft className='h-4 w-4' />
            <span>Back to Leads</span>
          </Link>
        </Button>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            asChild
            className='gap-1.5'
          >
            <Link
              href={`/dashboard/quotations/new?leadId=${lead.leadId}&title=${encodeURIComponent(lead.title)}`}
            >
              <IconFileInvoice className='h-4 w-4' />
              <span>Create Quotation</span>
            </Link>
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setStatusDialogOpen(true)}
            className='gap-1.5'
          >
            <IconArrowsExchange className='h-4 w-4' />
            <span>Change Stage</span>
          </Button>

          {lead.status !== LeadStatus.CONVERTED && (
            <Button
              size='sm'
              onClick={() => setConvertDialogOpen(true)}
              className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600'
            >
              <IconCheck className='h-4 w-4 stroke-[2.5]' />
              <span>Convert to Client</span>
            </Button>
          )}

          <Button
            variant='ghost'
            size='icon'
            onClick={handleDeleteLead}
            className='h-9 w-9 text-muted-foreground hover:text-destructive'
            aria-label='Delete lead'
          >
            <IconTrash className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className='border-border/50'>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1.5'>
              <div className='flex flex-wrap items-center gap-2.5'>
                <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                  {lead.name}
                </h1>
                <LeadStatusBadge status={lead.status} />
                <button
                  type='button'
                  onClick={handleToggleQualification}
                  disabled={togglingQualification}
                  title='Click to toggle qualification status'
                  className='cursor-pointer transition-transform hover:scale-105 active:scale-95'
                >
                  <LeadQualificationBadge isQualified={lead.isQualified} />
                </button>
              </div>

              <p className='text-sm text-muted-foreground font-medium'>
                {lead.title || lead.interestedService || 'Sales Opportunity'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className='flex flex-wrap items-center gap-2 pt-2 md:pt-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setActivityDialogOpen(true)}
                className='gap-1.5 text-xs'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Log Interaction</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setFollowUpDialogOpen(true)}
                className='gap-1.5 text-xs'
              >
                <IconCalendarPlus className='h-3.5 w-3.5' />
                <span>Schedule Follow-up</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main 2-Column Content */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column (1/3): Contact & Opportunity Info */}
        <div className='space-y-6 lg:col-span-1'>
          {/* Contact Details */}
          <Card className='border-border/50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                  <IconBuilding className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-xs text-muted-foreground'>Company</div>
                  <div className='font-medium text-foreground truncate'>
                    {lead.company || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                  <IconMail className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-xs text-muted-foreground'>Email</div>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className='font-medium text-primary hover:underline truncate block'
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className='text-muted-foreground'>Not provided</span>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                  <IconPhone className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-xs text-muted-foreground'>Phone</div>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className='font-medium text-foreground hover:underline truncate block'
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <span className='text-muted-foreground'>Not provided</span>
                  )}
                </div>
              </div>

              {lead.contact && (
                <div className='mt-2 rounded-md border border-border/40 bg-muted/20 p-2.5 text-xs text-muted-foreground'>
                  <span className='font-medium text-foreground'>Linked Contact: </span>
                  {lead.contact.name} {lead.contact.isClient && '(Active Client)'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deal & Scope Details */}
          <Card className='border-border/50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                Opportunity Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div>
                <div className='text-xs text-muted-foreground'>Estimated Budget</div>
                <div className='text-lg font-bold tabular-nums text-foreground mt-0.5'>
                  {formattedBudget || 'Budget TBD'}
                </div>
              </div>

              <div>
                <div className='text-xs text-muted-foreground'>Interested Service</div>
                <div className='font-medium text-foreground mt-0.5'>
                  {lead.interestedService || 'General Inquiry'}
                </div>
              </div>

              <div>
                <div className='text-xs text-muted-foreground'>Acquisition Source</div>
                <div className='mt-1'>
                  <LeadSourceBadge source={lead.source} />
                </div>
              </div>

              <div>
                <div className='text-xs text-muted-foreground'>Captured On</div>
                <div className='text-xs text-foreground mt-0.5'>
                  {new Date(lead.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {lead.lastContactedDate && (
                <div>
                  <div className='text-xs text-muted-foreground'>Last Contacted</div>
                  <div className='text-xs text-foreground mt-0.5'>
                    {new Date(lead.lastContactedDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements Brief / Description */}
          {lead.description && (
            <Card className='border-border/50'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  Inquiry Notes & Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed'>
                  {lead.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Lost Reason Alert (if lost) */}
          {lead.status === LeadStatus.LOST && lead.lostReason && (
            <Card className='border-destructive/30 bg-destructive/5'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold text-destructive flex items-center gap-1.5'>
                  <IconAlertCircle className='h-4 w-4' />
                  Lost Opportunity Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-destructive/90'>{lead.lostReason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (2/3): Follow-ups & Activity Timeline */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Follow-up Section */}
          <Card className='border-border/50'>
            <CardHeader className='pb-3 flex flex-row items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>Follow-ups & Reminders</CardTitle>
                <CardDescription className='text-xs'>
                  Keep prospective deals moving and never miss a scheduled client check-in.
                </CardDescription>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setFollowUpDialogOpen(true)}
                className='h-8 text-xs gap-1'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Add Follow-up</span>
              </Button>
            </CardHeader>
            <CardContent className='space-y-3'>
              {/* Highlight next follow up */}
              {lead.nextFollowUpDate && lead.status !== LeadStatus.CONVERTED && lead.status !== LeadStatus.LOST ? (
                <div
                  className={cn(
                    'flex items-start justify-between rounded-lg border p-3 text-sm',
                    isOverdue
                      ? 'border-destructive/30 bg-destructive/10'
                      : 'border-blue-500/30 bg-blue-500/10'
                  )}
                >
                  <div className='flex items-start gap-2.5'>
                    {isOverdue ? (
                      <IconCalendarExclamation className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
                    ) : (
                      <IconClock className='h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
                    )}
                    <div>
                      <div className='font-semibold flex items-center gap-2'>
                        <span className={isOverdue ? 'text-destructive' : 'text-blue-600 dark:text-blue-400'}>
                          {isOverdue ? 'Follow-up Overdue' : 'Next Follow-up Due'}
                        </span>
                        <Badge variant='outline' className='text-xs font-normal'>
                          {new Date(lead.nextFollowUpDate).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Badge>
                      </div>
                      {pendingFollowUps[0]?.notes && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Note: {pendingFollowUps[0].notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {pendingFollowUps[0] && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleCompleteFollowUp(pendingFollowUps[0].followUpId)}
                      className='text-xs h-7 gap-1 bg-background'
                    >
                      <IconCheck className='h-3.5 w-3.5' />
                      <span>Complete</span>
                    </Button>
                  )}
                </div>
              ) : null}

              {/* Follow-up list */}
              {pendingFollowUps.length === 0 && completedFollowUps.length === 0 ? (
                <div className='py-6 text-center text-xs text-muted-foreground'>
                  No follow-ups scheduled yet. Add a reminder to schedule your next touchpoint.
                </div>
              ) : (
                <div className='divide-y divide-border/40 pt-1'>
                  {pendingFollowUps.map((item) => (
                    <div key={item.followUpId} className='flex items-center justify-between py-2.5 text-sm'>
                      <div className='space-y-0.5'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-foreground'>
                            {new Date(item.dueDate).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {new Date(item.dueDate) <= new Date() && (
                            <Badge
                              variant='outline'
                              className='border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 rounded-full text-[10px] px-2 py-0 font-medium'
                            >
                              Due
                            </Badge>
                          )}
                        </div>
                        {item.notes && <p className='text-xs text-muted-foreground'>{item.notes}</p>}
                      </div>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleCompleteFollowUp(item.followUpId)}
                        className='h-7 text-xs text-muted-foreground hover:text-foreground'
                      >
                        <IconCheck className='h-3.5 w-3.5 mr-1' />
                        Done
                      </Button>
                    </div>
                  ))}

                  {completedFollowUps.map((item) => (
                    <div key={item.followUpId} className='flex items-center justify-between py-2 text-xs opacity-60'>
                      <div className='space-y-0.5 line-through'>
                        <span className='font-medium text-muted-foreground'>
                          {new Date(item.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {item.notes && <p className='text-muted-foreground/80'>{item.notes}</p>}
                      </div>
                      <span className='text-[10px] text-muted-foreground'>Completed</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline Section */}
          <Card className='border-border/50'>
            <CardHeader className='pb-3 flex flex-row items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <IconHistory className='h-4 w-4' />
                  Activity Timeline
                </CardTitle>
                <CardDescription className='text-xs'>
                  Chronological history of interactions, notes, proposals, and pipeline events.
                </CardDescription>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setActivityDialogOpen(true)}
                className='h-8 text-xs gap-1'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Log Note</span>
              </Button>
            </CardHeader>
            <CardContent>
              {(!lead.activities || lead.activities.length === 0) ? (
                <div className='py-8 text-center text-xs text-muted-foreground'>
                  No activity logged yet.
                </div>
              ) : (
                <div className='relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60'>
                  {lead.activities.map((activity) => {
                    const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS[ActivityType.NOTE];
                    const Icon = config.icon;

                    return (
                      <div key={activity.activityId} className='relative group'>
                        {/* Dot / Icon */}
                        <div
                          className={cn(
                            'absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background text-xs',
                            config.color
                          )}
                        >
                          <Icon className='h-3 w-3' />
                        </div>

                        {/* Content */}
                        <div className='space-y-1'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-semibold text-foreground'>
                              {activity.title}
                            </span>
                            <span className='text-xs text-muted-foreground tabular-nums'>
                              {new Date(activity.performedAt || activity.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>

                          {activity.description && (
                            <p className='text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed'>
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <UpdateStatusDialog
        lead={lead}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={reloadLead}
      />

      <ConvertLeadDialog
        lead={lead}
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        onSuccess={reloadLead}
      />

      <ScheduleFollowUpDialog
        lead={lead}
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        onSuccess={reloadLead}
      />

      <AddActivityDialog
        lead={lead}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        onSuccess={reloadLead}
      />
    </div>
  );
}
