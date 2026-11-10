'use client';

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { IconClock, IconAlertCircle } from '@tabler/icons-react';

interface InvoiceAgingBadgeProps {
  dueDate: string;
  isOverdue?: boolean;
  outstandingAmount?: number;
  paymentStatus?: string;
  className?: string;
}

export const getAgingInfo = (dueDateStr: string, outstandingAmount: number = 0, paymentStatus?: string) => {
  if (paymentStatus === 'paid' || outstandingAmount <= 0) {
    return {
      status: 'paid',
      label: 'Settled',
      isOverdue: false,
      days: 0,
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      status: 'upcoming',
      label: diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`,
      isOverdue: false,
      days: diffDays,
      badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    };
  } else if (diffDays === 0) {
    return {
      status: 'today',
      label: 'Due today',
      isOverdue: false,
      days: 0,
      badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold',
    };
  } else {
    const overdueDays = Math.abs(diffDays);
    let badgeClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';

    if (overdueDays > 60) {
      badgeClass = 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs';
    } else if (overdueDays > 30) {
      badgeClass = 'bg-rose-500/25 text-rose-800 dark:text-rose-200 border-rose-500/40 font-bold';
    } else if (overdueDays > 7) {
      badgeClass = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    } else {
      badgeClass = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }

    return {
      status: 'overdue',
      label: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
      isOverdue: true,
      days: overdueDays,
      badgeClass,
    };
  }
};

export const InvoiceAgingBadge: React.FC<InvoiceAgingBadgeProps> = ({
  dueDate,
  outstandingAmount = 0,
  paymentStatus,
  className,
}) => {
  const aging = getAgingInfo(dueDate, outstandingAmount, paymentStatus);

  if (aging.status === 'paid') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-tight',
        aging.badgeClass,
        className
      )}
    >
      {aging.isOverdue ? (
        <IconAlertCircle className='h-3 w-3 shrink-0' />
      ) : (
        <IconClock className='h-3 w-3 shrink-0' />
      )}
      <span>{aging.label}</span>
    </span>
  );
};
