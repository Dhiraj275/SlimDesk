'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Invoice } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import { toast } from 'sonner';
import {
  IconBell,
  IconLoader2,
  IconAlertCircle,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface SendReminderDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedInvoice: Invoice) => void;
}

export const SendReminderDialog: React.FC<SendReminderDialogProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const outstanding = Number(invoice?.outstandingAmount) || 0;
  const currency = invoice?.currency || 'INR';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val || 0);
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

  useEffect(() => {
    if (invoice && isOpen) {
      setRecipientEmail(invoice.clientInfo?.email || '');
      const balanceStr = formatCurrency(outstanding);
      const isOverdue = Boolean(invoice.isOverdue);

      const reminderText = isOverdue
        ? `Hi ${invoice.clientInfo?.name || 'there'},\n\nThis is a friendly reminder that invoice ${invoice.invoiceNumber} was due on ${formatDate(invoice.dueDate)} and currently has an overdue outstanding balance of ${balanceStr}.\n\nPlease find the payment instructions on your invoice link or let me know if you need any clarification.\n\nThank you!`
        : `Hi ${invoice.clientInfo?.name || 'there'},\n\nThis is a friendly reminder that invoice ${invoice.invoiceNumber} has an outstanding balance of ${balanceStr}, due on ${formatDate(invoice.dueDate)}.\n\nPlease let me know if you need any clarification.\n\nThank you!`;

      setMessage(reminderText);
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Reminder message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      toast.error('Please enter the recipient email address');
      return;
    }

    setIsSending(true);
    try {
      await invoicesApi.sendReminder(invoice.invoiceId, {
        recipientEmail: recipientEmail.trim(),
        message: message.trim() || undefined,
      });

      toast.success(
        `Payment reminder dispatched for ${invoice.invoiceNumber}`
      );
      // Refetch latest invoice data to update reminder count and lastRemindedAt
      const updated = await invoicesApi.getInvoiceById(invoice.invoiceId);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch reminder');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md p-6 sm:p-7'>
        <form onSubmit={handleSend} className='space-y-4'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
                <IconBell className='h-5 w-5' />
              </div>
              <div>
                <DialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                  Send Payment Reminder
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  {invoice.clientInfo?.name || 'Client'} ·{' '}
                  <span className='font-mono font-semibold text-foreground'>
                    {invoice.invoiceNumber}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Overdue / Outstanding Balance Alert */}
          <div
            className={cn(
              'rounded-xl border p-3.5 space-y-1 text-xs',
              invoice.isOverdue
                ? 'border-rose-500/30 bg-rose-500/[0.05]'
                : 'border-amber-500/30 bg-amber-500/[0.05]'
            )}
          >
            <div className='flex justify-between items-baseline'>
              <span className='font-bold text-foreground flex items-center gap-1.5'>
                {invoice.isOverdue && (
                  <IconAlertCircle className='h-3.5 w-3.5 text-rose-600' />
                )}
                {formatCurrency(outstanding)} Outstanding
              </span>
              <span className='text-[11px] text-muted-foreground'>
                Due date: {formatDate(invoice.dueDate)}
              </span>
            </div>
            {invoice.reminderCount > 0 && (
              <p className='text-[10px] text-muted-foreground'>
                {invoice.reminderCount} reminder{invoice.reminderCount > 1 ? 's' : ''} sent previously
                {invoice.lastRemindedAt && ` (last: ${formatDate(invoice.lastRemindedAt)})`}
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Recipient Email *</Label>
              <Input
                type='email'
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className='h-9 text-xs bg-card'
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-semibold'>Suggested Reminder</Label>
                <button
                  type='button'
                  onClick={handleCopy}
                  className='text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium'
                >
                  {copied ? (
                    <>
                      <IconCheck className='h-3 w-3 text-emerald-600' />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className='h-3 w-3' />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='text-xs resize-none bg-card leading-relaxed'
              />
            </div>
          </div>

          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={isSending}
              className='h-9 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={isSending}
              className='h-9 text-xs font-medium gap-1.5'
            >
              {isSending ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <IconBell className='h-4 w-4' />
                  <span>Send Reminder</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
