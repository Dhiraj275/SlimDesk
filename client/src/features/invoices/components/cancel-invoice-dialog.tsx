'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Invoice } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import { toast } from 'sonner';
import { IconX, IconLoader2, IconAlertTriangle } from '@tabler/icons-react';

interface CancelInvoiceDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedInvoice: Invoice) => void;
}

export const CancelInvoiceDialog: React.FC<CancelInvoiceDialogProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const hasActivePayments =
    invoice.payments?.some((p) => p.status === 'completed') || false;

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify a cancellation reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await invoicesApi.cancelInvoice(invoice.invoiceId, {
        reason: reason.trim(),
      });
      toast.success(`Invoice ${invoice.invoiceNumber} has been cancelled`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md p-6 sm:p-7'>
        <form onSubmit={handleCancel} className='space-y-4'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'>
                <IconX className='h-5 w-5' />
              </div>
              <div>
                <DialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                  Cancel / Void Invoice
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Void invoice{' '}
                  <span className='font-mono font-semibold text-foreground'>
                    {invoice.invoiceNumber}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {hasActivePayments ? (
            <div className='rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-4 text-xs space-y-2 text-rose-700 dark:text-rose-400'>
              <div className='flex items-center gap-2 font-semibold'>
                <IconAlertTriangle className='h-4 w-4 shrink-0' />
                <span>Cannot Cancel Active Payments</span>
              </div>
              <p className='leading-relaxed text-[11px] text-muted-foreground'>
                This invoice has completed payments recorded. You must first issue refunds for all payments in the Payments tab before this invoice can be cancelled.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Cancelling this invoice will mark it as voided. The client will no longer be able to submit payment obligations against it.
              </p>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Reason for Cancellation *</Label>
                <Textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder='e.g. Scope was cancelled or replaced with new contract terms...'
                  className='text-xs resize-none bg-card'
                />
              </div>
            </div>
          )}

          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={isSubmitting}
              className='h-9 text-xs'
            >
              Close
            </Button>
            {!hasActivePayments && (
              <Button
                type='submit'
                variant='destructive'
                size='sm'
                disabled={isSubmitting}
                className='h-9 text-xs font-medium gap-1.5'
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className='h-4 w-4 animate-spin' />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <IconX className='h-4 w-4' />
                    <span>Void Invoice</span>
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

