'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/shared/components/layout/page-container';
import { leadsApi } from '../api/leads.api';
import { Lead, LeadMetrics, LeadSource, LeadStatus } from '../types/lead.types';
import { LeadsOverviewCards } from './leads-overview-cards';
import { LeadFilters } from './lead-filters';
import { LeadListView } from './lead-list-view';
import { LeadKanbanView } from './lead-kanban-view';
import { CreateLeadDialog } from './create-lead-dialog';
import { UpdateStatusDialog } from './update-status-dialog';
import { ConvertLeadDialog } from './convert-lead-dialog';
import { ScheduleFollowUpDialog } from './schedule-followup-dialog';
import { toast } from 'sonner';
import { IconLoader2 } from '@tabler/icons-react';

export function LeadsPage() {
  const [metrics, setMetrics] = useState<LeadMetrics | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const [metricsRes, leadsRes] = await Promise.all([
        leadsApi.getMetrics(),
        leadsApi.getLeads({
          search: search.trim() || undefined,
          source: sourceFilter !== 'all' && sourceFilter ? (sourceFilter as LeadSource) : undefined,
          overdueOnly: overdueOnly ? true : undefined,
          limit: 100,
        }),
      ]);

      setMetrics(metricsRes);
      setAllLeads(leadsRes.items || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load leads data');
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, overdueOnly]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Compute live stage counts for the filter tabs
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allLeads.length,
    };
    allLeads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [allLeads]);

  // Filter leads based on selected stage
  const displayedLeads = useMemo(() => {
    if (statusFilter === 'all') return allLeads;
    return allLeads.filter((l) => l.status === statusFilter);
  }, [allLeads, statusFilter]);

  // Handle metric card quick filtering
  const handleMetricFilterClick = (key: string) => {
    if (activeMetricFilter === key) {
      // Toggle off
      setActiveMetricFilter(null);
      setStatusFilter('all');
      setOverdueOnly(false);
      return;
    }

    setActiveMetricFilter(key);
    if (key === 'all') {
      setStatusFilter('all');
      setOverdueOnly(false);
    } else if (key === 'in_progress') {
      setStatusFilter('all');
      setOverdueOnly(false);
    } else if (key === 'follow_ups_due') {
      setOverdueOnly(true);
      setStatusFilter('all');
    } else if (key === 'converted') {
      setStatusFilter(LeadStatus.CONVERTED);
      setOverdueOnly(false);
    }
  };

  const handleUpdateStatusClick = (lead: Lead) => {
    setSelectedLead(lead);
    setStatusDialogOpen(true);
  };

  const handleConvertClick = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertDialogOpen(true);
  };

  const handleScheduleFollowUpClick = (lead: Lead) => {
    setSelectedLead(lead);
    setFollowUpDialogOpen(true);
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      return;
    }

    try {
      await leadsApi.deleteLead(lead.leadId);
      toast.success('Lead deleted');
      fetchLeads();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete lead');
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6 min-w-0 w-full max-w-full overflow-x-hidden'>
        {/* Header */}
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Lead Management
            </h1>
            <p className='text-sm text-muted-foreground'>
              Capture, track, qualify, and convert freelance opportunities into paying clients.
            </p>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <LeadsOverviewCards
          metrics={metrics}
          activeFilter={activeMetricFilter}
          onFilterClick={handleMetricFilterClick}
        />

        {/* Toolbar & Filters */}
        <LeadFilters
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setActiveMetricFilter(null);
          }}
          source={sourceFilter}
          onSourceChange={setSourceFilter}
          overdueOnly={overdueOnly}
          onOverdueToggle={() => {
            setOverdueOnly((prev) => !prev);
            setActiveMetricFilter(null);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewLeadClick={() => setCreateDialogOpen(true)}
          stageCounts={stageCounts}
        />

        {/* Content: List or Kanban */}
        {loading ? (
          <div className='flex min-h-[300px] items-center justify-center'>
            <div className='flex flex-col items-center gap-2 text-muted-foreground text-sm'>
              <IconLoader2 className='h-6 w-6 animate-spin text-primary' />
              <span>Loading pipeline...</span>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <LeadListView
            leads={displayedLeads}
            onUpdateStatus={handleUpdateStatusClick}
            onConvert={handleConvertClick}
            onScheduleFollowUp={handleScheduleFollowUpClick}
            onDelete={handleDeleteLead}
            onNewLeadClick={() => setCreateDialogOpen(true)}
          />
        ) : (
          <LeadKanbanView
            leads={statusFilter === 'all' ? allLeads : displayedLeads}
            onUpdateStatus={handleUpdateStatusClick}
            onConvert={handleConvertClick}
            onScheduleFollowUp={handleScheduleFollowUpClick}
            onDelete={handleDeleteLead}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateLeadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => fetchLeads()}
      />

      <UpdateStatusDialog
        lead={selectedLead}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={() => fetchLeads()}
      />

      <ConvertLeadDialog
        lead={selectedLead}
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        onSuccess={() => fetchLeads()}
      />

      <ScheduleFollowUpDialog
        lead={selectedLead}
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        onSuccess={() => fetchLeads()}
      />
    </PageContainer>
  );
}
