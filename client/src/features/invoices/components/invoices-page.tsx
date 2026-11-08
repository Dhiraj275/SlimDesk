'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/shared/components/layout/page-container';
import { Button } from '@/shared/components/ui/button';
import { InvoicesOverviewCards } from './invoices-overview-cards';
import { InvoiceFilters } from './invoice-filters';
import { InvoiceCard } from './invoice-card';
import { InvoiceListView } from './invoice-list-view';
import { RecordPaymentDialog } from './record-payment-dialog';
import { SendInvoiceDialog } from './send-invoice-dialog';
import { SendReminderDialog } from './send-reminder-dialog';
import { CancelInvoiceDialog } from './cancel-invoice-dialog';
import { invoicesApi } from '../api/invoices.api';
import {
  Invoice,
  InvoiceMetrics,
  InvoiceStatus,
  PaymentStatus,
} from '../types/invoice.types';
import { toast } from 'sonner';
import {
  IconPlus,
  IconRefresh,
  IconLoader2,
  IconReceipt2,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Selected invoice for modals
  const [selectedForPayment, setSelectedForPayment] = useState<Invoice | null>(null);
  const [selectedForSend, setSelectedForSend] = useState<Invoice | null>(null);
  const [selectedForReminder, setSelectedForReminder] = useState<Invoice | null>(null);
  const [selectedForCancel, setSelectedForCancel] = useState<Invoice | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, listRes] = await Promise.all([
        invoicesApi.getMetrics(),
        invoicesApi.getInvoices({ limit: 100 }),
      ]);
      setMetrics(metricsRes);
      setInvoices(listRes.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load invoices');
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
      all: invoices.length,
      draft: 0,
      issued: 0,
      cancelled: 0,
    };
    invoices.forEach((inv) => {
      counts[inv.status] = (counts[inv.status] || 0) + 1;
    });
    return counts;
  }, [invoices]);

  // Handle metric card quick filtering
  const handleMetricFilterClick = (key: string) => {
    if (activeMetricFilter === key) {
      setActiveMetricFilter(null);
      setStatusFilter('all');
      setPaymentStatusFilter('all');
      return;
    }

    setActiveMetricFilter(key);
    switch (key) {
      case 'invoiced':
        setStatusFilter('issued');
        setPaymentStatusFilter('all');
        break;
      case 'received':
        setStatusFilter('all');
        setPaymentStatusFilter('paid');
        break;
      case 'outstanding':
        setStatusFilter('issued');
        setPaymentStatusFilter('unpaid');
        break;
      case 'overdue':
        setStatusFilter('issued');
        setPaymentStatusFilter('overdue');
        break;
      default:
        setStatusFilter('all');
        setPaymentStatusFilter('all');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setActiveMetricFilter(null);
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) {
        return false;
      }

      if (paymentStatusFilter !== 'all') {
        if (paymentStatusFilter === 'overdue') {
          if (!inv.isOverdue || inv.paymentStatus === 'paid') return false;
        } else if (inv.paymentStatus !== paymentStatusFilter) {
          return false;
        }
      }

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = inv.title?.toLowerCase().includes(query);
        const matchesNumber = inv.invoiceNumber?.toLowerCase().includes(query);
        const matchesClient = inv.clientInfo?.name?.toLowerCase().includes(query);
        const matchesCompany = inv.clientInfo?.company?.toLowerCase().includes(query);
        return matchesTitle || matchesNumber || matchesClient || matchesCompany;
      }

      return true;
    });
  }, [invoices, statusFilter, paymentStatusFilter, search]);

  const handleInvoiceUpdated = (updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((i) => (i.invoiceId === updated.invoiceId ? updated : i))
    );
    // Refresh metrics in background
    invoicesApi.getMetrics().then((m) => setMetrics(m)).catch(() => {});
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6 pb-12 w-full'>
        {/* Header Title & Quick Actions */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
                Invoices
              </h1>
              <span className='rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20'>
                Receivables & Billing
              </span>
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
              Generate professional invoices, track payments, manage outstanding balances, and maintain earnings records.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className='h-9 text-xs gap-1.5'
              title='Refresh Data'
            >
              <IconRefresh
                className={cn('h-3.5 w-3.5', (isRefreshing || isLoading) && 'animate-spin')}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            <Link href='/dashboard/invoices/new'>
              <Button size='sm' className='h-9 gap-1.5 font-medium text-xs shadow-2xs'>
                <IconPlus className='h-4 w-4' />
                <span>New Invoice</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        <InvoicesOverviewCards
          metrics={metrics}
          isLoading={isLoading}
          activeFilter={activeMetricFilter}
          onFilterClick={handleMetricFilterClick}
        />

        {/* Filter Controls Bar */}
        <InvoiceFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setActiveMetricFilter(null);
          }}
          paymentStatusFilter={paymentStatusFilter}
          onPaymentStatusFilterChange={(val) => {
            setPaymentStatusFilter(val);
            setActiveMetricFilter(null);
          }}
          statusCounts={statusCounts}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* List / Grid Content */}
        {isLoading ? (
          <div className='rounded-xl border border-border/60 bg-card p-12 text-center'>
            <IconLoader2 className='mx-auto h-8 w-8 animate-spin text-primary' />
            <p className='text-xs text-muted-foreground mt-2'>
              Loading invoices and payment ledger...
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <InvoiceListView
            invoices={filteredInvoices}
            onRecordPayment={(inv) => setSelectedForPayment(inv)}
            onSendInvoice={(inv) => setSelectedForSend(inv)}
            onSendReminder={(inv) => setSelectedForReminder(inv)}
            onCancelInvoice={(inv) => setSelectedForCancel(inv)}
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredInvoices.map((inv) => (
              <InvoiceCard
                key={inv.invoiceId}
                invoice={inv}
                onRecordPayment={(inv) => setSelectedForPayment(inv)}
                onSendInvoice={(inv) => setSelectedForSend(inv)}
                onSendReminder={(inv) => setSelectedForReminder(inv)}
                onCancelInvoice={(inv) => setSelectedForCancel(inv)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <RecordPaymentDialog
          invoice={selectedForPayment}
          isOpen={Boolean(selectedForPayment)}
          onClose={() => setSelectedForPayment(null)}
          onSuccess={handleInvoiceUpdated}
        />

        <SendInvoiceDialog
          invoice={selectedForSend}
          isOpen={Boolean(selectedForSend)}
          onClose={() => setSelectedForSend(null)}
          onSuccess={handleInvoiceUpdated}
        />

        <SendReminderDialog
          invoice={selectedForReminder}
          isOpen={Boolean(selectedForReminder)}
          onClose={() => setSelectedForReminder(null)}
          onSuccess={handleInvoiceUpdated}
        />

        <CancelInvoiceDialog
          invoice={selectedForCancel}
          isOpen={Boolean(selectedForCancel)}
          onClose={() => setSelectedForCancel(null)}
          onSuccess={handleInvoiceUpdated}
        />
      </div>
    </PageContainer>
  );
};
