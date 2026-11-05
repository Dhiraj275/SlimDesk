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
import { QuotationStatus } from '../types/quotation.types';
import { QUOTATION_STATUS_CONFIG } from './quotation-status-badge';
import {
  IconSearch,
  IconLayoutList,
  IconLayoutGrid,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface QuotationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: QuotationStatus | 'all';
  onStatusChange: (status: QuotationStatus | 'all') => void;
  onReset: () => void;
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  onNewQuotationClick?: () => void;
  statusCounts?: Record<string, number>;
  totalResults?: number;
}

export const QuotationFilters: React.FC<QuotationFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset,
  viewMode = 'table',
  onViewModeChange,
  onNewQuotationClick,
  statusCounts,
  totalResults,
}) => {
  const hasActiveFilters = Boolean(search) || status !== 'all';

  return (
    <div className='flex flex-col gap-3 w-full min-w-0'>
      {/* Quotation Status Quick Tabs */}
      <div className='custom-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1.5 max-w-full text-xs'>
        <button
          type='button'
          onClick={() => onStatusChange('all')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors shrink-0',
            status === 'all'
              ? 'bg-foreground text-background shadow-2xs font-semibold'
              : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <span>All Proposals</span>
          {statusCounts && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                status === 'all'
                  ? 'bg-background/20 text-background'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {statusCounts.all ?? 0}
            </span>
          )}
        </button>

        {Object.entries(QUOTATION_STATUS_CONFIG).map(([key, config]) => {
          const isSelected = status === key;
          const count = statusCounts ? statusCounts[key] || 0 : undefined;
          return (
            <button
              key={key}
              type='button'
              onClick={() => onStatusChange(key as QuotationStatus)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors shrink-0',
                isSelected
                  ? 'bg-foreground text-background shadow-2xs font-semibold'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{config.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                    isSelected
                      ? 'bg-background/20 text-background'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Filter & Action Toolbar */}
      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          {/* Search Input */}
          <div className='relative flex-1 min-w-[200px] max-w-md'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Search by client, title, quote #...'
              className='pl-9 pr-8 h-9 text-xs sm:text-sm'
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

          {/* Status Dropdown */}
          <Select
            value={status}
            onValueChange={(val) => onStatusChange(val as QuotationStatus | 'all')}
          >
            <SelectTrigger className='w-[140px] h-9 text-xs'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              {Object.entries(QUOTATION_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key} className='text-xs'>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onReset}
              className='h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1'
            >
              <IconX className='h-3.5 w-3.5' />
              <span>Reset</span>
            </Button>
          )}

          {totalResults !== undefined && (
            <span className='text-xs text-muted-foreground ml-1 hidden md:inline'>
              {totalResults} {totalResults === 1 ? 'proposal' : 'proposals'}
            </span>
          )}
        </div>

        {/* Right side: View mode toggle & Create Button */}
        <div className='flex items-center gap-2 shrink-0'>
          {onViewModeChange && (
            <div className='flex items-center rounded-lg border border-border/50 bg-muted/40 p-0.5'>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size='icon'
                onClick={() => onViewModeChange('table')}
                className='h-7 w-7'
                aria-label='Table view'
              >
                <IconLayoutList className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size='icon'
                onClick={() => onViewModeChange('grid')}
                className='h-7 w-7'
                aria-label='Grid view'
              >
                <IconLayoutGrid className='h-4 w-4' />
              </Button>
            </div>
          )}

          <Button asChild size='sm' className='h-9 gap-1.5 text-xs font-semibold'>
            <Link href='/dashboard/quotations/new'>
              <IconPlus className='h-4 w-4' />
              <span>New Quotation</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
