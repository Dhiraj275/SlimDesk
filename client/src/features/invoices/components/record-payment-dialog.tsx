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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Invoice, PaymentMethod } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import { recordPaymentSchema } from '../schemas/invoice.schema';
import { toast } from 'sonner';
import {
  IconReceipt2,
  IconLoader2,
  IconCalendar,
  IconCurrencyRupee,
  IconBuildingBank,
  IconDeviceMobile,
  IconCash,
  IconCheck,
} from '@tabler/icons-react';

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedInvoice: Invoice) => void;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice && isOpen) {
      const remaining = Number(invoice.outstandingAmount) || 0;
      setAmount(remaining > 0 ? String(remaining) : String(invoice.totalAmount || 0));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('bank_transfer');
      setReferenceNumber('');
      setNotes('');
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const outstanding = Number(invoice.outstandingAmount) || 0;
  const currency = invoice.currency || 'INR';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    const parseResult = recordPaymentSchema.safeParse({
      amount: numAmount,
      paymentMethod,
      paymentDate,
      referenceNumber,
      notes,
    });

    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0]?.message || 'Invalid payment details');
      return;
    }

    if (numAmount > outstanding) {
      toast.error(
        `Payment amount (${formatCurrency(numAmount)}) cannot exceed outstanding balance (${formatCurrency(outstanding)})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await invoicesApi.recordPayment(invoice.invoiceId, {
        amount: numAmount,
        paymentMethod,
        paymentDate,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      toast.success(
        `Payment of ${formatCurrency(numAmount)} recorded on ${invoice.invoiceNumber}`
      );
      onSuccess(res.invoice);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md p-6 sm:p-7'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                <IconReceipt2 className='h-5 w-5' />
              </div>
              <div>
                <DialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                  Record Payment
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Log an installment or full settlement for invoice{' '}
                  <span className='font-mono font-semibold text-foreground'>
                    {invoice.invoiceNumber}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Outstanding Balance Banner */}
          <div className='rounded-xl border border-border/50 bg-muted/30 p-3.5 flex items-center justify-between text-xs'>
            <div>
              <span className='text-muted-foreground block text-[11px]'>
                Outstanding Balance
              </span>
              <span className='font-mono font-bold text-base text-foreground'>
                {formatCurrency(outstanding)}
              </span>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setAmount(String(outstanding))}
              className='h-7 text-xs font-medium'
            >
              Pay Full
            </Button>
          </div>

          <div className='space-y-3.5'>
            {/* Amount */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Amount Received ({currency})</Label>
              <div className='relative'>
                <Input
                  type='text'
                  inputMode='decimal'
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='0.00'
                  className='font-mono text-sm h-9 bg-card'
                />
              </div>
            </div>

            {/* Payment Method & Date */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                >
                  <SelectTrigger className='h-9 text-xs bg-card'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                    <SelectItem value='upi'>UPI</SelectItem>
                    <SelectItem value='cash'>Cash</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Payment Date</Label>
                <Input
                  type='date'
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className='h-9 text-xs bg-card'
                />
              </div>
            </div>

            {/* Reference Number (UTR) */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Reference / Transaction # <span className='text-muted-foreground font-normal'>(optional)</span>
              </Label>
              <Input
                type='text'
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder='e.g. UTR12345678, IMPS ref, or cash receipt #'
                className='font-mono text-xs h-9 bg-card'
              />
            </div>

            {/* Notes */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Payment Notes <span className='text-muted-foreground font-normal'>(optional)</span>
              </Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='e.g. Paid via Google Pay UPI to HDFC account...'
                className='text-xs resize-none bg-card'
              />
            </div>
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
              size='sm'
              disabled={isSubmitting}
              className='h-9 text-xs font-medium gap-1.5'
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <IconCheck className='h-4 w-4' />
                  <span>Save Payment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

