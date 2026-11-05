'use client';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  IconSearch,
  IconLayoutGrid,
  IconLayoutList,
  IconPlus,
  IconX,
  IconAddressBook,
  IconUserCheck,
  IconUser,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

export function ContactFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onNewContactClick,
  counts,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'clients' | 'prospects';
  onStatusFilterChange: (status: 'all' | 'clients' | 'prospects') => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onNewContactClick: () => void;
  counts: { all: number; clients: number; prospects: number };
}) {
  const hasActiveFilters = Boolean(search || statusFilter !== 'all');

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
  };

  const tabs: {
    key: 'all' | 'clients' | 'prospects';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[] = [
    { key: 'all', label: 'All Contacts', icon: IconAddressBook, count: counts.all },
    { key: 'clients', label: 'Paying Clients', icon: IconUserCheck, count: counts.clients },
    { key: 'prospects', label: 'Prospects', icon: IconUser, count: counts.prospects },
  ];

  return (
    <div className='flex flex-col gap-3 w-full min-w-0'>
      {/* Quick Filter Tabs */}
      <div className='custom-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs'>
        {tabs.map((tab) => {
          const isSelected = statusFilter === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type='button'
              onClick={() => onStatusFilterChange(tab.key)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors shrink-0',
                isSelected
                  ? 'bg-foreground text-background shadow-2xs font-semibold'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className='h-3.5 w-3.5 shrink-0 opacity-70' />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                  isSelected
                    ? 'bg-background/20 text-background'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Filter & Action Toolbar */}
      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full min-w-0'>
        {/* Left: Search input */}
        <div className='flex flex-1 items-center gap-2 max-w-md w-full'>
          <div className='relative flex-1'>
            <IconSearch className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search contacts by name, company, email, phone...'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-8 pr-8 h-9 text-xs sm:text-sm bg-card border-border/60'
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

          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleResetFilters}
              className='h-9 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0'
            >
              <IconX className='mr-1 h-3.5 w-3.5' />
              Clear
            </Button>
          )}
        </div>

        {/* Right: View Mode Toggle & New Contact Button */}
        <div className='flex items-center gap-2 self-end sm:self-auto shrink-0'>
          {/* View Mode Toggle */}
          <div className='flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5'>
            <button
              type='button'
              onClick={() => onViewModeChange('grid')}
              title='Grid / Card View'
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconLayoutGrid className='h-3.5 w-3.5' />
            </button>
            <button
              type='button'
              onClick={() => onViewModeChange('table')}
              title='Table / List View'
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconLayoutList className='h-3.5 w-3.5' />
            </button>
          </div>

          {/* New Contact Button */}
          <Button
            size='sm'
            onClick={onNewContactClick}
            className='h-9 gap-1.5 px-3 text-xs font-semibold'
          >
            <IconPlus className='h-4 w-4 stroke-[2.5]' />
            <span>New Contact</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

