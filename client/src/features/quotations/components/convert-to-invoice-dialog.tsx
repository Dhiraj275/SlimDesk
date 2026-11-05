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
import { Quotation } from '../types/quotation.types';
import { quotationsApi } from '../api/quotations.api';
import { toast } from 'sonner';
import {
  IconReceipt,
  IconCheck,
  IconArrowRight,
  IconLoader2,
} from '@tabler/icons-react';

interface ConvertToInvoiceDialogProps {
  quotation: Quotation | null;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess: (invoice: any) => void;
}

export const ConvertToInvoiceDialog: React.FC<ConvertToInvoiceDialogProps> = ({
  quotation,
  isOpen,
  open,
  onClose,
  onOpenChange,
  onSuccess,
}) => {
  const isModalOpen = open ?? isOpen ?? false;
  const handleModalClose = (val: boolean) => {
    if (!val) {
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    }
  };

  const [isConverting, setIsConverting] = useState(false);

  if (!quotation) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: quotation.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const invoice = await quotationsApi.convertQuotation(
        quotation.quotationId
      );
      toast.success(
        `Quotation ${quotation.quotationNumber} successfully converted to Invoice`
      );
      onSuccess(invoice);
      handleModalClose(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to convert quotation to invoice');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className='sm:max-w-md p-6 sm:p-7'>
        <DialogHeader className='space-y-2 pb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'>
              <IconReceipt className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
                Convert to Invoice
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                Create an invoice directly from this accepted commercial proposal.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-3 pt-1'>
          <div className='rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Quotation #</span>
              <span className='font-mono font-semibold text-foreground'>
                {quotation.quotationNumber}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Client</span>
              <span className='font-medium text-foreground'>
                {quotation.clientInfo?.name}
              </span>
            </div>
            <div className='flex justify-between items-center pt-2 border-t border-border/40'>
              <span className='font-semibold text-muted-foreground uppercase tracking-wider text-[11px]'>
                Invoice Total
              </span>
              <span className='text-base font-bold text-foreground tabular-nums'>
                {formatCurrency(quotation.totalAmount)}
              </span>
            </div>
          </div>

          <div className='flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300'>
            <IconCheck className='h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400' />
            <p>
              All line items, taxes, and client details will be cloned into a formal commercial invoice.
            </p>
          </div>
        </div>

        <DialogFooter className='pt-2 gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleModalClose(false)}
            disabled={isConverting}
            className='h-10 px-5'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConvert}
            disabled={isConverting}
            className='h-10 px-5 font-semibold shadow-xs bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600'
          >
            {isConverting ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Converting...
              </>
            ) : (
              <>
                <IconReceipt className='mr-2 h-4 w-4' />
                Confirm & Create Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
