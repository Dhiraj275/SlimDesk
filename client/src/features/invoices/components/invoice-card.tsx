'use client';

import React from 'react';
import Link from 'next/link';
import { Invoice } from '../types/invoice.types';
import { InvoiceDualBadges } from './invoice-status-badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconReceipt2,
  IconSend,
  IconBell,
  IconX,
  IconCalendar,
  IconUser,
  IconAlertCircle,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface InvoiceCardProps {
  invoice: Invoice;
  onRecordPayment?: (invoice: Invoice) => void;
  onSendInvoice?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
  onCancelInvoice?: (invoice: Invoice) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onRecordPayment,
  onSendInvoice,
  onSendReminder,
  onCancelInvoice,
}) => {
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const paidAmount = Number(invoice.paidAmount) || 0;
  const totalAmount = Number(invoice.totalAmount) || 0;
  const outstandingAmount = Number(invoice.outstandingAmount) || 0;
  const percentage = Math.min(100, Math.max(0, Number(invoice.paymentPercentage) || 0));

  const isOverdue = Boolean(invoice.isOverdue);
  const isDraft = invoice.status === 'draft';
  const isIssued = invoice.status === 'issued';
  const isCancelled = invoice.status === 'cancelled';

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 shadow-2xs transition-all duration-200 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5',
        isOverdue && isIssued
          ? 'border-rose-500/40 bg-rose-500/[0.02]'
          : 'border-border/60 hover:border-border'
      )}
    >
      <div>
        {/* Top Header: Invoice Number, Dual Badges, Dropdown */}
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <Link
                href={`/dashboard/invoices/${invoice.invoiceId}`}
                className='font-mono font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors'
              >
                {invoice.invoiceNumber}
              </Link>
              <InvoiceDualBadges
                invoiceStatus={invoice.status}
                paymentStatus={invoice.paymentStatus}
                isOverdue={invoice.isOverdue}
                size='sm'
              />
            </div>
            <h3 className='text-sm font-semibold text-foreground/90 truncate' title={invoice.title}>
              {invoice.title || 'Untitled Invoice'}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground shrink-0'
              >
                <IconDotsVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 text-xs'>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/invoices/${invoice.invoiceId}`}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <IconEye className='h-3.5 w-3.5 text-muted-foreground' />
                  <span>View Details</span>
                </Link>
              </DropdownMenuItem>

              {isDraft && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/invoices/${invoice.invoiceId}/edit`}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <IconEdit className='h-3.5 w-3.5 text-muted-foreground' />
                    <span>Edit Draft</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {isIssued && outstandingAmount > 0 && onRecordPayment && (
                <DropdownMenuItem
                  onClick={() => onRecordPayment(invoice)}
                  className='flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium'
                >
                  <IconReceipt2 className='h-3.5 w-3.5' />
                  <span>Record Payment</span>
                </DropdownMenuItem>
              )}

              {onSendInvoice && !isCancelled && (
                <DropdownMenuItem
                  onClick={() => onSendInvoice(invoice)}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <IconSend className='h-3.5 w-3.5 text-muted-foreground' />
                  <span>{isDraft ? 'Issue & Send' : 'Email to Client'}</span>
                </DropdownMenuItem>
              )}

              {isIssued && outstandingAmount > 0 && onSendReminder && (
                <DropdownMenuItem
                  onClick={() => onSendReminder(invoice)}
                  className='flex items-center gap-2 cursor-pointer text-amber-600 dark:text-amber-400'
                >
                  <IconBell className='h-3.5 w-3.5' />
                  <span>Send Reminder</span>
                </DropdownMenuItem>
              )}

              {!isCancelled && onCancelInvoice && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancelInvoice(invoice)}
                    className='flex items-center gap-2 cursor-pointer text-rose-600 dark:text-rose-400'
                  >
                    <IconX className='h-3.5 w-3.5' />
                    <span>Cancel Invoice</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client & Dates Info */}
        <div className='mt-4 space-y-2 text-xs text-muted-foreground'>
          <div className='flex items-center gap-2 truncate'>
            <IconUser className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
            <span className='font-medium text-foreground truncate'>
              {invoice.clientInfo?.name || 'Unnamed Client'}
            </span>
            {invoice.clientInfo?.company && (
              <span className='text-muted-foreground/80 truncate'>
                ({invoice.clientInfo.company})
              </span>
            )}
          </div>

          <div className='flex items-center justify-between text-[11px] pt-1'>
            <span className='flex items-center gap-1.5'>
              <IconCalendar className='h-3.5 w-3.5' />
              Issued: {formatDate(invoice.issueDate)}
            </span>
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                isOverdue && isIssued
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-muted-foreground'
              )}
            >
              {isOverdue && isIssued && <IconAlertCircle className='h-3 w-3 shrink-0' />}
              Due: {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary & Payment Progress Bar */}
      <div className='mt-5 pt-4 border-t border-border/50 space-y-2.5'>
        <div className='flex items-baseline justify-between'>
          <div>
            <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
              Total Amount
            </span>
            <span className='text-lg font-bold font-mono text-foreground'>
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className='text-right'>
            <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
              Outstanding
            </span>
            <span
              className={cn(
                'text-sm font-bold font-mono',
                outstandingAmount > 0
                  ? isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {formatCurrency(outstandingAmount)}
            </span>
          </div>
        </div>

        {/* Payment progress bar */}
        {invoice.status !== 'cancelled' && (
          <div className='space-y-1'>
            <div className='w-full bg-muted rounded-full h-1.5 overflow-hidden'>
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  percentage >= 100
                    ? 'bg-emerald-500'
                    : percentage > 0
                    ? 'bg-purple-500'
                    : 'bg-muted-foreground/30'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className='flex justify-between items-center text-[10px] text-muted-foreground'>
              <span>Paid: {formatCurrency(paidAmount)}</span>
              <span>{percentage.toFixed(0)}% paid</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

