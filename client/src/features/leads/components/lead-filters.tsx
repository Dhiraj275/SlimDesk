'use client';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { LeadSource, LeadStatus } from '../types/lead.types';
import { SOURCE_CONFIG, STATUS_CONFIG } from './lead-status-badge';
import {
  IconSearch,
  IconLayoutList,
  IconLayoutKanban,
  IconPlus,
  IconCalendarExclamation,
  IconX,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

export function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  overdueOnly,
  onOverdueToggle,
  viewMode,
  onViewModeChange,
  onNewLeadClick,
  stageCounts,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  overdueOnly: boolean;
  onOverdueToggle: () => void;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
  onNewLeadClick: () => void;
  stageCounts?: Record<string, number>;
}) {
  const hasActiveFilters = search || status !== 'all' || source !== 'all' || overdueOnly;

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onSourceChange('all');
    if (overdueOnly) onOverdueToggle();
  };

  return (
    <div className='flex flex-col gap-3 w-full min-w-0'>
      {/* Pipeline Stage Quick Tabs */}
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
          <span>All Stages</span>
          {stageCounts && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                status === 'all'
                  ? 'bg-background/20 text-background'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {stageCounts.all ?? 0}
            </span>
          )}
        </button>

        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const isSelected = status === key;
          const count = stageCounts ? stageCounts[key] || 0 : undefined;
          return (
            <button
              key={key}
              type='button'
              onClick={() => onStatusChange(key)}
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

      {/* Search, Source Filter, Overdue Toggle, View Mode & Action CTA */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full min-w-0'>
        {/* Search & Select Filters */}
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <div className='relative min-w-[200px] flex-1 sm:max-w-xs'>
            <IconSearch className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search leads, clients, service...'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-8 h-9 text-sm'
            />
          </div>

          {/* Source Filter */}
          <Select value={source} onValueChange={onSourceChange}>
            <SelectTrigger className='w-[130px] h-9 text-xs'>
              <SelectValue placeholder='All Sources' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Sources</SelectItem>
              {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key} className='text-xs'>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Overdue Follow-up Filter Toggle */}
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={onOverdueToggle}
            className={cn(
              'h-9 text-xs gap-1.5 transition-colors',
              overdueOnly
                ? 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/20 dark:text-rose-300 hover:bg-rose-500/25'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconCalendarExclamation className='h-3.5 w-3.5' />
            <span>Follow-ups Due</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={handleResetFilters}
              className='h-9 text-xs px-2 text-muted-foreground hover:text-foreground'
            >
              <IconX className='h-3.5 w-3.5 mr-1' />
              Reset
            </Button>
          )}
        </div>

        {/* View Switcher & Action CTA */}
        <div className='flex items-center gap-2 self-end sm:self-auto'>
          <div className='flex rounded-lg border border-border/50 bg-muted/40 p-0.5'>
            <button
              type='button'
              onClick={() => onViewModeChange('list')}
              aria-label='List view'
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconLayoutList className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>List</span>
            </button>
            <button
              type='button'
              onClick={() => onViewModeChange('kanban')}
              aria-label='Pipeline view'
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconLayoutKanban className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>Pipeline</span>
            </button>
          </div>

          <Button onClick={onNewLeadClick} size='sm' className='h-9 gap-1.5'>
            <IconPlus className='h-4 w-4' />
            <span>New Lead</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

