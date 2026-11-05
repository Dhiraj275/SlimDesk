'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/shared/components/layout/page-container';
import { Button } from '@/shared/components/ui/button';
import { QuotationsOverviewCards } from './quotations-overview-cards';
import { QuotationFilters } from './quotation-filters';
import { QuotationCard } from './quotation-card';
import { QuotationListView } from './quotation-list-view';
import { SendQuotationDialog } from './send-quotation-dialog';
import { ConvertToInvoiceDialog } from './convert-to-invoice-dialog';
import { quotationsApi } from '../api/quotations.api';
import {
  Quotation,
  QuotationMetrics,
  QuotationStatus,
} from '../types/quotation.types';
import { toast } from 'sonner';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
} from '@tabler/icons-react';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [metrics, setMetrics] = useState<QuotationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Dialog states
  const [selectedForSend, setSelectedForSend] = useState<Quotation | null>(null);
  const [selectedForConvert, setSelectedForConvert] = useState<Quotation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, listRes] = await Promise.all([
        quotationsApi.getMetrics(),
        quotationsApi.getQuotations(),
      ]);
      setMetrics(metricsRes);
      setQuotations(listRes.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load quotations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Compute live stage counts for the filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: quotations.length,
    };
    quotations.forEach((q) => {
      counts[q.status] = (counts[q.status] || 0) + 1;
    });
    return counts;
  }, [quotations]);

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (statusFilter !== 'all' && q.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = q.title?.toLowerCase().includes(query);
        const matchesNumber = q.quotationNumber?.toLowerCase().includes(query);
        const matchesClient = q.clientInfo?.name?.toLowerCase().includes(query);
        const matchesCompany = q.clientInfo?.company?.toLowerCase().includes(query);
        return matchesTitle || matchesNumber || matchesClient || matchesCompany;
      }
      return true;
    });
  }, [quotations, statusFilter, search]);

  // Handle metric card quick filtering
  const handleMetricFilterClick = (key: string) => {
    if (activeMetricFilter === key) {
      setActiveMetricFilter(null);
      setStatusFilter('all');
      return;
    }

    setActiveMetricFilter(key);
    if (key === 'all') {
      setStatusFilter('all');
    } else if (key === 'sent') {
      setStatusFilter('sent');
    } else if (key === 'accepted') {
      setStatusFilter('accepted');
    } else if (key === 'converted') {
      setStatusFilter('converted');
    }
  };

  const handleDuplicate = async (quotation: Quotation) => {
    try {
      const cloned = await quotationsApi.duplicateQuotation(quotation.quotationId);
      toast.success(`Duplicated as ${cloned.quotationNumber}`);
      setQuotations((prev) => [cloned, ...prev]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to duplicate quotation');
    }
  };

  const handleDelete = async (quotation: Quotation) => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.quotationNumber}?`)) {
      return;
    }
    try {
      await quotationsApi.deleteQuotation(quotation.quotationId);
      toast.success('Quotation deleted');
      setQuotations((prev) => prev.filter((q) => q.quotationId !== quotation.quotationId));
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete quotation');
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6 min-w-0 w-full max-w-full overflow-x-hidden'>
        {/* Page Top Header */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Quotations
            </h1>
            <p className='text-sm text-muted-foreground'>
              Create commercial proposals, track views, and convert accepted offers into invoices.
            </p>
          </div>

          <div className='flex items-center gap-2 self-stretch sm:self-auto'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='h-9 text-xs gap-1.5'
            >
              <IconRefresh className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button asChild size='sm' className='h-9 text-xs font-semibold gap-1.5'>
              <Link href='/dashboard/quotations/new'>
                <IconPlus className='h-4 w-4' />
                <span>New Quotation</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <QuotationsOverviewCards
          metrics={metrics}
          isLoading={isLoading}
          activeFilter={activeMetricFilter}
          onFilterClick={handleMetricFilterClick}
        />

        {/* Filters and View Switcher Bar */}
        <QuotationFilters
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setActiveMetricFilter(null);
          }}
          onReset={() => {
            setSearch('');
            setStatusFilter('all');
            setActiveMetricFilter(null);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statusCounts={statusCounts}
          totalResults={filteredQuotations.length}
        />

        {/* Content View: Table or Grid */}
        {isLoading ? (
          <div className='flex min-h-[300px] items-center justify-center'>
            <div className='flex flex-col items-center gap-2 text-muted-foreground text-sm'>
              <IconLoader2 className='h-6 w-6 animate-spin text-primary' />
              <span>Loading quotations...</span>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <QuotationListView
            quotations={filteredQuotations}
            onSend={(q) => setSelectedForSend(q)}
            onConvert={(q) => setSelectedForConvert(q)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredQuotations.map((q) => (
              <QuotationCard
                key={q.quotationId}
                quotation={q}
                onSend={(item) => setSelectedForSend(item)}
                onConvert={(item) => setSelectedForConvert(item)}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedForSend && (
        <SendQuotationDialog
          quotation={selectedForSend}
          open={Boolean(selectedForSend)}
          onOpenChange={(open) => !open && setSelectedForSend(null)}
          onSuccess={() => {
            fetchData();
            setSelectedForSend(null);
          }}
        />
      )}

      {selectedForConvert && (
        <ConvertToInvoiceDialog
          quotation={selectedForConvert}
          open={Boolean(selectedForConvert)}
          onOpenChange={(open) => !open && setSelectedForConvert(null)}
          onSuccess={() => {
            fetchData();
            setSelectedForConvert(null);
          }}
        />
      )}
    </PageContainer>
  );
};
