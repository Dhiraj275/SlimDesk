'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { InvoiceStatus, PaymentStatus } from '../types/invoice.types';
import { cn } from '@/shared/utils/utils';
import {
  IconFileText,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconRotateClockwise2,
  IconReceipt2,
} from '@tabler/icons-react';

interface InvoiceLifecycleBadgeProps {
  status: InvoiceStatus;
  className?: string;
  size?: 'sm' | 'default';
}

export const InvoiceLifecycleBadge: React.FC<InvoiceLifecycleBadgeProps> = ({
  status,
  className,
  size = 'default',
}) => {
  const configs: Record<
    InvoiceStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    draft: {
      label: 'Draft',
      className:
        'border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
      icon: <IconFileText className='h-3 w-3 shrink-0' />,
    },
    issued: {
      label: 'Issued',
      className:
        'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
      icon: <IconReceipt2 className='h-3 w-3 shrink-0' />,
    },
    cancelled: {
      label: 'Cancelled',
      className:
        'border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 line-through',
      icon: <IconX className='h-3 w-3 shrink-0' />,
    },
  };

  const config = configs[status] || configs.draft;

  return (
    <Badge
      variant='outline'
      className={cn(
        'font-medium capitalize inline-flex items-center gap-1.5 shadow-2xs transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  isOverdue?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  isOverdue = false,
  className,
  size = 'default',
}) => {
  const effectiveStatus = isOverdue && status !== 'paid' && status !== 'refunded' ? 'overdue' : status;

  const configs: Record<
    PaymentStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    unpaid: {
      label: 'Unpaid',
      className:
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      icon: <IconClock className='h-3 w-3 shrink-0' />,
    },
    partially_paid: {
      label: 'Partially Paid',
      className:
        'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
      icon: <IconRotateClockwise2 className='h-3 w-3 shrink-0' />,
    },
    paid: {
      label: 'Paid',
      className:
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      icon: <IconCheck className='h-3 w-3 shrink-0' />,
    },
    overdue: {
      label: 'Overdue',
      className:
        'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 animate-pulse',
      icon: <IconAlertCircle className='h-3 w-3 shrink-0' />,
    },
    refunded: {
      label: 'Refunded',
      className:
        'border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
      icon: <IconRotateClockwise2 className='h-3 w-3 shrink-0' />,
    },
  };

  const config = configs[effectiveStatus] || configs.unpaid;

  return (
    <Badge
      variant='outline'
      className={cn(
        'font-medium capitalize inline-flex items-center gap-1.5 shadow-2xs transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};

interface InvoiceDualBadgesProps {
  invoiceStatus: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  isOverdue?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}

export const InvoiceDualBadges: React.FC<InvoiceDualBadgesProps> = ({
  invoiceStatus,
  paymentStatus = 'unpaid',
  isOverdue = false,
  className,
  size = 'default',
}) => {
  return (
    <div className={cn('inline-flex items-center gap-1.5 flex-wrap', className)}>
      <InvoiceLifecycleBadge status={invoiceStatus} size={size} />
      {invoiceStatus !== 'cancelled' && (
        <PaymentStatusBadge
          status={paymentStatus}
          isOverdue={isOverdue}
          size={size}
        />
      )}
    </div>
  );
};

