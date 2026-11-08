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
  IconAlertCircle,
  IconFileInvoice,
  IconPlus,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface InvoiceListViewProps {
  invoices: Invoice[];
  onRecordPayment?: (invoice: Invoice) => void;
  onSendInvoice?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
  onCancelInvoice?: (invoice: Invoice) => void;
}

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  onRecordPayment,
  onSendInvoice,
  onSendReminder,
  onCancelInvoice,
}) => {
  const formatCurrency = (val: number | string, curr: string = 'INR') => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: curr || 'INR',
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

  if (!invoices || invoices.length === 0) {
    return (
      <div className='rounded-xl border border-dashed border-border/70 p-12 text-center bg-card/40'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3'>
          <IconFileInvoice className='h-6 w-6' />
        </div>
        <h3 className='text-base font-semibold text-foreground'>No invoices found</h3>
        <p className='text-xs text-muted-foreground mt-1 max-w-sm mx-auto'>
          Get started by creating a new invoice manually or convert an accepted commercial proposal into an invoice.
        </p>
        <div className='mt-5'>
          <Link href='/dashboard/invoices/new'>
            <Button size='sm' className='gap-1.5 text-xs font-medium'>
              <IconPlus className='h-4 w-4' />
              <span>Create First Invoice</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xs'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-xs'>
          <thead className='bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/50'>
            <tr>
              <th className='py-3.5 px-4'>Invoice # & Title</th>
              <th className='py-3.5 px-4'>Client</th>
              <th className='py-3.5 px-4'>Issue / Due Date</th>
              <th className='py-3.5 px-4'>Status</th>
              <th className='py-3.5 px-4'>Payment Progress</th>
              <th className='py-3.5 px-4 text-right'>Outstanding</th>
              <th className='py-3.5 px-4 text-center w-12'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40'>
            {invoices.map((inv) => {
              const totalAmount = Number(inv.totalAmount) || 0;
              const paidAmount = Number(inv.paidAmount) || 0;
              const outstandingAmount = Number(inv.outstandingAmount) || 0;
              const percentage = Math.min(100, Math.max(0, Number(inv.paymentPercentage) || 0));
              const isOverdue = Boolean(inv.isOverdue);
              const isDraft = inv.status === 'draft';
              const isIssued = inv.status === 'issued';
              const isCancelled = inv.status === 'cancelled';

              return (
                <tr
                  key={inv.invoiceId}
                  className='hover:bg-muted/30 transition-colors group'
                >
                  {/* Invoice # & Title */}
                  <td className='py-3.5 px-4'>
                    <div className='space-y-0.5 max-w-[200px]'>
                      <Link
                        href={`/dashboard/invoices/${inv.invoiceId}`}
                        className='font-mono font-bold text-foreground hover:text-primary transition-colors block truncate'
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <span className='text-[11px] text-muted-foreground block truncate' title={inv.title}>
                        {inv.title || 'Untitled Invoice'}
                      </span>
                    </div>
                  </td>

                  {/* Client */}
                  <td className='py-3.5 px-4'>
                    <div className='space-y-0.5 max-w-[180px]'>
                      <span className='font-medium text-foreground block truncate'>
                        {inv.clientInfo?.name || 'Unnamed Client'}
                      </span>
                      {inv.clientInfo?.company ? (
                        <span className='text-[11px] text-muted-foreground block truncate'>
                          {inv.clientInfo.company}
                        </span>
                      ) : (
                        <span className='text-[11px] text-muted-foreground block truncate'>
                          {inv.clientInfo?.email || '-'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className='py-3.5 px-4 whitespace-nowrap'>
                    <div className='space-y-0.5 text-[11px]'>
                      <span className='text-muted-foreground block'>
                        Issued: {formatDate(inv.issueDate)}
                      </span>
                      <span
                        className={cn(
                          'flex items-center gap-1 font-medium',
                          isOverdue && isIssued
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-foreground'
                        )}
                      >
                        {isOverdue && isIssued && (
                          <IconAlertCircle className='h-3 w-3 shrink-0' />
                        )}
                        Due: {formatDate(inv.dueDate)}
                      </span>
                    </div>
                  </td>

                  {/* Dual Badges */}
                  <td className='py-3.5 px-4'>
                    <InvoiceDualBadges
                      invoiceStatus={inv.status}
                      paymentStatus={inv.paymentStatus}
                      isOverdue={inv.isOverdue}
                      size='sm'
                    />
                  </td>

                  {/* Payment Progress */}
                  <td className='py-3.5 px-4'>
                    {inv.status !== 'cancelled' ? (
                      <div className='w-36 space-y-1.5'>
                        <div className='flex justify-between items-baseline text-[11px]'>
                          <span className='font-mono font-medium text-foreground'>
                            {formatCurrency(paidAmount, inv.currency)}
                          </span>
                          <span className='text-[10px] text-muted-foreground'>
                            / {formatCurrency(totalAmount, inv.currency)}
                          </span>
                        </div>
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
                        <span className='text-[10px] text-muted-foreground block text-right'>
                          {percentage.toFixed(0)}% received
                        </span>
                      </div>
                    ) : (
                      <span className='text-muted-foreground text-[11px]'>-</span>
                    )}
                  </td>

                  {/* Outstanding */}
                  <td className='py-3.5 px-4 text-right whitespace-nowrap'>
                    <div className='space-y-0.5'>
                      <span
                        className={cn(
                          'font-mono font-bold text-sm block',
                          outstandingAmount > 0
                            ? isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {formatCurrency(outstandingAmount, inv.currency)}
                      </span>
                      {outstandingAmount === 0 && isIssued && (
                        <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block'>
                          Fully Settled
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className='py-3.5 px-4 text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        >
                          <IconDotsVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48 text-xs'>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/invoices/${inv.invoiceId}`}
                            className='flex items-center gap-2 cursor-pointer'
                          >
                            <IconEye className='h-3.5 w-3.5 text-muted-foreground' />
                            <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>

                        {isDraft && (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/invoices/${inv.invoiceId}/edit`}
                              className='flex items-center gap-2 cursor-pointer'
                            >
                              <IconEdit className='h-3.5 w-3.5 text-muted-foreground' />
                              <span>Edit Draft</span>
                            </Link>
                          </DropdownMenuItem>
                        )}

                        {isIssued && outstandingAmount > 0 && onRecordPayment && (
                          <DropdownMenuItem
                            onClick={() => onRecordPayment(inv)}
                            className='flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium'
                          >
                            <IconReceipt2 className='h-3.5 w-3.5' />
                            <span>Record Payment</span>
                          </DropdownMenuItem>
                        )}

                        {onSendInvoice && !isCancelled && (
                          <DropdownMenuItem
                            onClick={() => onSendInvoice(inv)}
                            className='flex items-center gap-2 cursor-pointer'
                          >
                            <IconSend className='h-3.5 w-3.5 text-muted-foreground' />
                            <span>{isDraft ? 'Issue & Send' : 'Email to Client'}</span>
                          </DropdownMenuItem>
                        )}

                        {isIssued && outstandingAmount > 0 && onSendReminder && (
                          <DropdownMenuItem
                            onClick={() => onSendReminder(inv)}
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
                              onClick={() => onCancelInvoice(inv)}
                              className='flex items-center gap-2 cursor-pointer text-rose-600 dark:text-rose-400'
                            >
                              <IconX className='h-3.5 w-3.5' />
                              <span>Cancel Invoice</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
