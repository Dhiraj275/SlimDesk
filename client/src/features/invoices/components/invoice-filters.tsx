'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  IconSearch,
  IconPlus,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconX,
} from '@tabler/icons-react';
import { InvoiceStatus, PaymentStatus } from '../types/invoice.types';
import { cn } from '@/shared/utils/utils';

interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: InvoiceStatus | 'all';
  onStatusFilterChange: (status: InvoiceStatus | 'all') => void;
  paymentStatusFilter: PaymentStatus | 'all';
  onPaymentStatusFilterChange: (status: PaymentStatus | 'all') => void;
  statusCounts: Record<string, number>;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onResetFilters?: () => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  statusCounts,
  viewMode,
  onViewModeChange,
  onResetFilters,
}) => {
  const lifecycleTabs: Array<{ id: InvoiceStatus | 'all'; label: string }> = [
    { id: 'all', label: 'All Invoices' },
    { id: 'draft', label: 'Drafts' },
    { id: 'issued', label: 'Issued' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    paymentStatusFilter !== 'all';

  return (
    <div className='space-y-3 w-full'>
      {/* Top Filter Bar: Search, Payment Status Select, View Toggle, Create Button */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 items-center gap-2 max-w-lg'>
          {/* Search Input */}
          <div className='relative flex-1'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search by invoice #, client, or title...'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-9 h-9 text-xs sm:text-sm bg-card'
            />
            {search && (
              <button
                type='button'
                onClick={() => onSearchChange('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <IconX className='h-3.5 w-3.5' />
              </button>
            )}
          </div>

          {/* Payment Status Dropdown Filter */}
          <Select
            value={paymentStatusFilter}
            onValueChange={(val) =>
              onPaymentStatusFilterChange(val as PaymentStatus | 'all')
            }
          >
            <SelectTrigger className='w-[150px] h-9 text-xs bg-card shrink-0'>
              <div className='flex items-center gap-1.5 truncate'>
                <IconFilter className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                <SelectValue placeholder='Payment Status' />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Payments</SelectItem>
              <SelectItem value='unpaid'>Unpaid</SelectItem>
              <SelectItem value='partially_paid'>Partially Paid</SelectItem>
              <SelectItem value='paid'>Paid</SelectItem>
              <SelectItem value='overdue'>Overdue</SelectItem>
              <SelectItem value='refunded'>Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle and New Invoice Button */}
        <div className='flex items-center gap-2 self-end sm:self-auto'>
          {hasActiveFilters && onResetFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onResetFilters}
              className='h-9 text-xs text-muted-foreground hover:text-foreground gap-1'
            >
              <IconX className='h-3.5 w-3.5' />
              <span>Clear</span>
            </Button>
          )}

          {/* Table / Grid Toggle */}
          <div className='flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onViewModeChange('table')}
              className={cn(
                'h-7 w-7 rounded-md p-0',
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconList className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'h-7 w-7 rounded-md p-0',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconLayoutGrid className='h-4 w-4' />
            </Button>
          </div>

          {/* Create Invoice Button */}
          <Link href='/dashboard/invoices/new'>
            <Button size='sm' className='h-9 gap-1.5 font-medium text-xs sm:text-sm shadow-2xs'>
              <IconPlus className='h-4 w-4' />
              <span>Create Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Lifecycle Status Filter Tabs */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-border/40'>
        {lifecycleTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          const count = statusCounts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
