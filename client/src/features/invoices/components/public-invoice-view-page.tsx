'use client';

import React from 'react';
import { InvoiceDocument } from './invoice-preview/invoice-document';
import { InvoicePdfActionsMenu } from '../pdf/invoice-pdf-actions-menu';
import { Button } from '@/shared/components/ui/button';
import { Invoice } from '../types/invoice.types';
import {
  IconPrinter,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconCreditCard,
  IconBuildingBank,
  IconDeviceMobile,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface PublicInvoiceViewPageProps {
  initialInvoice: Invoice;
  token: string;
}

export const PublicInvoiceViewPage: React.FC<PublicInvoiceViewPageProps> = ({
  initialInvoice,
}) => {
  const invoice = initialInvoice;

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = Number(invoice.totalAmount) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;
  const outstandingAmount = Number(invoice.outstandingAmount) || 0;
  const isPaid = invoice.paymentStatus === 'paid' || outstandingAmount === 0;
  const isOverdue = Boolean(invoice.isOverdue);

  return (
    <div className='min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Top Floating Client Action Bar */}
        <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center border',
                isPaid
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : isOverdue
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              )}
            >
              {isPaid ? (
                <IconCheck className='h-5 w-5' />
              ) : isOverdue ? (
                <IconAlertCircle className='h-5 w-5' />
              ) : (
                <IconClock className='h-5 w-5' />
              )}
            </div>

            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100'>
                  {invoice.invoiceNumber}
                </h1>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                    isPaid
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : isOverdue
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  )}
                >
                  {isPaid ? 'Fully Paid' : isOverdue ? 'Payment Overdue' : 'Payment Due'}
                </span>
              </div>
              <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'>
                {isPaid
                  ? 'Thank you! This invoice has been fully settled.'
                  : `Outstanding Balance: ${formatCurrency(outstandingAmount)}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2 self-end sm:self-auto'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrint}
              className='h-9 text-xs gap-1.5'
            >
              <IconPrinter className='h-4 w-4' />
              <span>Print</span>
            </Button>

            <InvoicePdfActionsMenu invoice={invoice} />
          </div>
        </div>

        {/* Bank & Payment Instructions Box for Client */}
        {!isPaid && invoice.paymentDetails && (
          <div className='bg-white dark:bg-zinc-900 border border-blue-500/30 rounded-2xl p-5 shadow-sm space-y-2 print:hidden'>
            <div className='flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm'>
              <IconCreditCard className='h-4 w-4' />
              <span>Remittance & Payment Instructions</span>
            </div>
            <p className='text-xs text-zinc-600 dark:text-zinc-300 font-mono whitespace-pre-line leading-relaxed'>
              {invoice.paymentDetails}
            </p>
          </div>
        )}

        {/* The Printable Invoice Document */}
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
};
