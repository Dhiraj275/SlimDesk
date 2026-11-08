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
import { Invoice, InvoicePayment } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import { toast } from 'sonner';
import {
  IconRotateClockwise2,
  IconLoader2,
  IconAlertTriangle,
} from '@tabler/icons-react';

interface RecordRefundDialogProps {
  invoice: Invoice | null;
  payment: InvoicePayment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedInvoice: Invoice) => void;
}

export const RecordRefundDialog: React.FC<RecordRefundDialogProps> = ({
  invoice,
  payment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice || !payment) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify a reason for issuing this refund');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await invoicesApi.recordRefund(invoice.invoiceId, {
        paymentId: payment.paymentId,
        reason: reason.trim(),
      });
      toast.success(
        `Refund of ${formatCurrency(payment.amount)} processed successfully`
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md p-6 sm:p-7'>
        <form onSubmit={handleRefund} className='space-y-4'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'>
                <IconRotateClockwise2 className='h-5 w-5' />
              </div>
              <div>
                <DialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                  Record Refund
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Reverse payment of{' '}
                  <span className='font-mono font-semibold text-foreground'>
                    {formatCurrency(payment.amount)}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='rounded-xl border border-border/50 bg-muted/30 p-3.5 space-y-1.5 text-xs'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Method:</span>
              <span className='font-medium capitalize text-foreground'>
                {payment.paymentMethod.replace('_', ' ')}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Payment Date:</span>
              <span className='font-medium text-foreground'>
                {payment.paymentDate}
              </span>
            </div>
            {payment.referenceNumber && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Reference:</span>
                <span className='font-mono text-foreground'>
                  {payment.referenceNumber}
                </span>
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Refund Reason *</Label>
            <Textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='e.g. Client requested refund due to duplicate UPI transfer...'
              className='text-xs resize-none bg-card'
            />
          </div>

          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={isSubmitting}
              className='h-9 text-xs'
            >
              Cancel
            </Button>
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <IconRotateClockwise2 className='h-4 w-4' />
                  <span>Confirm Refund</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

