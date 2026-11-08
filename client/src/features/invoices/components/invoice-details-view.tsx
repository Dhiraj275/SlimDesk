'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Invoice, InvoicePayment } from '../types/invoice.types';
import { InvoiceDualBadges } from './invoice-status-badge';
import { InvoiceDocument } from './invoice-preview/invoice-document';
import { InvoicePdfActionsMenu } from '../pdf/invoice-pdf-actions-menu';
import { RecordPaymentDialog } from './record-payment-dialog';
import { RecordRefundDialog } from './record-refund-dialog';
import { SendInvoiceDialog } from './send-invoice-dialog';
import { SendReminderDialog } from './send-reminder-dialog';
import { CancelInvoiceDialog } from './cancel-invoice-dialog';
import { invoicesApi } from '../api/invoices.api';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconReceipt2,
  IconSend,
  IconBell,
  IconEdit,
  IconX,
  IconCheck,
  IconFileText,
  IconClock,
  IconRotateClockwise2,
  IconAlertCircle,
  IconPlus,
  IconCash,
  IconBuildingBank,
  IconDeviceMobile,
  IconHistory,
  IconEye,
  IconMail,
  IconLoader2,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface InvoiceDetailsViewProps {
  initialInvoice: Invoice;
}

export const InvoiceDetailsView: React.FC<InvoiceDetailsViewProps> = ({
  initialInvoice,
}) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isIssuing, setIsIssuing] = useState(false);

  // Dialogs
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<InvoicePayment | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

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

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalAmount = Number(invoice.totalAmount) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;
  const outstandingAmount = Number(invoice.outstandingAmount) || 0;
  const percentage = Math.min(100, Math.max(0, Number(invoice.paymentPercentage) || 0));

  const isDraft = invoice.status === 'draft';
  const isIssued = invoice.status === 'issued';
  const isCancelled = invoice.status === 'cancelled';
  const isOverdue = Boolean(invoice.isOverdue);

  // Issue Draft Invoice
  const handleIssueInvoice = async () => {
    setIsIssuing(true);
    try {
      const updated = await invoicesApi.issueInvoice(invoice.invoiceId);
      setInvoice(updated);
      toast.success(`Invoice ${invoice.invoiceNumber} finalized and issued`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to issue invoice');
    } finally {
      setIsIssuing(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return <IconDeviceMobile className='h-4 w-4 text-purple-600' />;
      case 'bank_transfer':
        return <IconBuildingBank className='h-4 w-4 text-blue-600' />;
      case 'cash':
        return <IconCash className='h-4 w-4 text-emerald-600' />;
      default:
        return <IconReceipt2 className='h-4 w-4 text-muted-foreground' />;
    }
  };

  const getTimelineEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <IconFileText className='h-4 w-4 text-zinc-500' />;
      case 'issued':
        return <IconReceipt2 className='h-4 w-4 text-blue-600' />;
      case 'sent':
        return <IconMail className='h-4 w-4 text-sky-600' />;
      case 'viewed':
        return <IconEye className='h-4 w-4 text-indigo-600' />;
      case 'payment_recorded':
        return <IconCheck className='h-4 w-4 text-emerald-600' />;
      case 'reminder_sent':
        return <IconBell className='h-4 w-4 text-amber-600' />;
      case 'refund_recorded':
        return <IconRotateClockwise2 className='h-4 w-4 text-rose-600' />;
      case 'cancelled':
        return <IconX className='h-4 w-4 text-zinc-500' />;
      default:
        return <IconHistory className='h-4 w-4 text-muted-foreground' />;
    }
  };

  return (
    <div className='space-y-6 pb-20'>
      {/* Top Header & Action Controls */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/dashboard/invoices')}
            className='h-9 w-9 text-muted-foreground hover:text-foreground'
          >
            <IconArrowLeft className='h-4 w-4' />
          </Button>

          <div>
            <div className='flex items-center gap-2.5 flex-wrap'>
              <h1 className='text-xl sm:text-2xl font-mono font-bold tracking-tight text-foreground'>
                {invoice.invoiceNumber}
              </h1>
              <InvoiceDualBadges
                invoiceStatus={invoice.status}
                paymentStatus={invoice.paymentStatus}
                isOverdue={invoice.isOverdue}
              />
            </div>
            <p className='text-xs text-muted-foreground mt-0.5 truncate max-w-md'>
              {invoice.title} · Billed to {invoice.clientInfo?.name || 'Client'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2 flex-wrap self-end sm:self-auto'>
          {/* Issue Draft Invoice button */}
          {isDraft && (
            <Button
              size='sm'
              disabled={isIssuing}
              onClick={handleIssueInvoice}
              className='h-9 text-xs gap-1.5 font-medium shadow-2xs bg-blue-600 hover:bg-blue-700 text-white'
            >
              {isIssuing ? (
                <IconLoader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <IconCheck className='h-3.5 w-3.5' />
              )}
              <span>Finalize & Issue</span>
            </Button>
          )}

          {/* Record Payment (Primary when issued) */}
          {isIssued && outstandingAmount > 0 && (
            <Button
              size='sm'
              onClick={() => setIsPaymentOpen(true)}
              className='h-9 text-xs gap-1.5 font-medium shadow-2xs bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              <IconReceipt2 className='h-3.5 w-3.5' />
              <span>Record Payment</span>
            </Button>
          )}

          {/* Edit Draft */}
          {isDraft && (
            <Link href={`/dashboard/invoices/${invoice.invoiceId}/edit`}>
              <Button
                variant='outline'
                size='sm'
                className='h-9 text-xs gap-1.5 font-medium shadow-2xs'
              >
                <IconEdit className='h-3.5 w-3.5' />
                <span>Edit Draft</span>
              </Button>
            </Link>
          )}

          {/* Send to Client */}
          {!isCancelled && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsSendOpen(true)}
              className='h-9 text-xs gap-1.5 font-medium shadow-2xs'
            >
              <IconSend className='h-3.5 w-3.5' />
              <span>{isDraft ? 'Issue & Send' : 'Send Email'}</span>
            </Button>
          )}

          {/* Send Reminder */}
          {isIssued && outstandingAmount > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsReminderOpen(true)}
              className='h-9 text-xs gap-1.5 font-medium shadow-2xs text-amber-600 dark:text-amber-400'
            >
              <IconBell className='h-3.5 w-3.5' />
              <span>Remind</span>
            </Button>
          )}

          {/* PDF Menu */}
          <InvoicePdfActionsMenu invoice={invoice} />

          {/* Cancel Invoice */}
          {!isCancelled && (
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsCancelOpen(true)}
              className='h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
              title='Cancel Invoice'
            >
              <IconX className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Payment Progress Summary Banner (prompt section 3) */}
      {invoice.status !== 'cancelled' && (
        <div className='rounded-xl border border-border/60 bg-card p-5 shadow-2xs space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-6 sm:gap-10 flex-wrap'>
              <div>
                <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                  Total Invoice Amount
                </span>
                <span className='text-xl sm:text-2xl font-bold font-mono text-foreground'>
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <div>
                <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                  Paid
                </span>
                <span className='text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
                  {formatCurrency(paidAmount)}
                </span>
              </div>

              <div>
                <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                  Outstanding
                </span>
                <span
                  className={cn(
                    'text-xl sm:text-2xl font-bold font-mono',
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

            <div className='text-left sm:text-right space-y-1'>
              <span className='text-xs font-semibold text-foreground block'>
                {percentage.toFixed(2)}% payment received
              </span>
              <span className='text-[11px] text-muted-foreground block'>
                Due date: {formatDate(invoice.dueDate)}
                {isOverdue && isIssued && (
                  <span className='text-rose-600 dark:text-rose-400 font-bold ml-1'>
                    (Overdue)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
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
        </div>
      )}

      {/* Main Tabs: Document Preview, Payments, Activity Timeline */}
      <Tabs defaultValue='preview' className='space-y-5'>
        <TabsList className='h-10 p-0.5 bg-muted/50 border border-border/40'>
          <TabsTrigger value='preview' className='text-xs gap-1.5 h-9 px-4'>
            <IconFileText className='h-3.5 w-3.5' />
            <span>Document Preview</span>
          </TabsTrigger>
          <TabsTrigger value='payments' className='text-xs gap-1.5 h-9 px-4'>
            <IconReceipt2 className='h-3.5 w-3.5' />
            <span>Payments ({invoice.payments?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value='timeline' className='text-xs gap-1.5 h-9 px-4'>
            <IconHistory className='h-3.5 w-3.5' />
            <span>Activity Timeline ({invoice.events?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visual Invoice Document Preview */}
        <TabsContent value='preview' className='pt-2'>
          <InvoiceDocument invoice={invoice} />
        </TabsContent>

        {/* Tab 2: Payments History & Transactions Table */}
        <TabsContent value='payments' className='pt-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-foreground'>
                Payment Transactions
              </h3>
              <p className='text-xs text-muted-foreground'>
                Independent ledger of all payment installments, transfers, and refunds.
              </p>
            </div>
            {isIssued && outstandingAmount > 0 && (
              <Button
                size='sm'
                onClick={() => setIsPaymentOpen(true)}
                className='h-8 text-xs gap-1.5 font-medium'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Record Payment</span>
              </Button>
            )}
          </div>

          <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xs'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs'>
                <thead className='bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider border-b border-border/50'>
                  <tr>
                    <th className='py-3 px-4'>Payment Date</th>
                    <th className='py-3 px-4'>Method</th>
                    <th className='py-3 px-4'>Reference / UTR</th>
                    <th className='py-3 px-4'>Notes</th>
                    <th className='py-3 px-4'>Status</th>
                    <th className='py-3 px-4 text-right'>Amount</th>
                    <th className='py-3 px-4 text-center w-24'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/40'>
                  {invoice.payments && invoice.payments.length > 0 ? (
                    invoice.payments.map((p) => {
                      const isCompleted = p.status === 'completed';

                      return (
                        <tr key={p.paymentId} className='hover:bg-muted/20'>
                          <td className='py-3 px-4 font-medium text-foreground whitespace-nowrap'>
                            {formatDate(p.paymentDate)}
                          </td>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-1.5 capitalize font-medium'>
                              {getPaymentMethodIcon(p.paymentMethod)}
                              <span>{p.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className='py-3 px-4 font-mono text-[11px] text-muted-foreground'>
                            {p.referenceNumber || '-'}
                          </td>
                          <td className='py-3 px-4 text-muted-foreground max-w-[200px] truncate'>
                            {p.notes || '-'}
                          </td>
                          <td className='py-3 px-4'>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize',
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 line-through'
                              )}
                            >
                              {p.status}
                            </span>
                            {p.refundReason && (
                              <p className='text-[10px] text-muted-foreground mt-0.5 italic truncate max-w-[150px]' title={p.refundReason}>
                                {p.refundReason}
                              </p>
                            )}
                          </td>
                          <td className='py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap'>
                            {formatCurrency(p.amount)}
                          </td>
                          <td className='py-3 px-4 text-center'>
                            {isCompleted ? (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setSelectedPaymentForRefund(p);
                                  setIsRefundOpen(true);
                                }}
                                className='h-7 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 font-medium'
                              >
                                Refund
                              </Button>
                            ) : (
                              <span className='text-[10px] text-muted-foreground'>
                                Refunded
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className='py-8 text-center text-muted-foreground'>
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Chronological Activity Timeline */}
        <TabsContent value='timeline' className='pt-2 space-y-4'>
          <div>
            <h3 className='text-sm sm:text-base font-bold text-foreground'>
              Invoice Activity Timeline
            </h3>
            <p className='text-xs text-muted-foreground'>
              Chronological audit history of invoice creation, issuance, client views, reminders, and payments.
            </p>
          </div>

          <div className='rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs'>
            {invoice.events && invoice.events.length > 0 ? (
              <div className='space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60'>
                {invoice.events.map((evt, idx) => (
                  <div key={evt.eventId || idx} className='relative flex items-start gap-3.5 text-xs'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-2xs z-10'>
                      {getTimelineEventIcon(evt.eventType)}
                    </div>
                    <div className='space-y-0.5 pt-0.5 flex-1 min-w-0'>
                      <div className='flex items-baseline justify-between gap-2 flex-wrap'>
                        <span className='font-semibold text-foreground capitalize'>
                          {evt.eventType.replace('_', ' ')}
                        </span>
                        <span className='text-[10px] text-muted-foreground font-mono'>
                          {formatDateTime(evt.createdAt)}
                        </span>
                      </div>
                      <p className='text-muted-foreground leading-relaxed'>
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-xs text-center py-6 text-muted-foreground'>
                No activity history available.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Interactive Action Modals */}
      <RecordPaymentDialog
        invoice={invoice}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={(updated) => setInvoice(updated)}
      />

      <RecordRefundDialog
        invoice={invoice}
        payment={selectedPaymentForRefund}
        isOpen={isRefundOpen}
        onClose={() => {
          setIsRefundOpen(false);
          setSelectedPaymentForRefund(null);
        }}
        onSuccess={(updated) => setInvoice(updated)}
      />

      <SendInvoiceDialog
        invoice={invoice}
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSuccess={(updated) => setInvoice(updated)}
      />

      <SendReminderDialog
        invoice={invoice}
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        onSuccess={(updated) => setInvoice(updated)}
      />

      <CancelInvoiceDialog
        invoice={invoice}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onSuccess={(updated) => setInvoice(updated)}
      />
    </div>
  );
};
