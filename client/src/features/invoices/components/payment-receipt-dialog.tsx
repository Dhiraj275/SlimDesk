'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Invoice, InvoicePayment } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import { useSettings } from '@/features/settings/context/settings-context';
import { formatAmountInWords } from '@/features/quotations/pdf/amount-in-words';
import {
  IconReceipt2,
  IconPrinter,
  IconCheck,
  IconBuildingBank,
  IconDeviceMobile,
  IconCash,
} from '@tabler/icons-react';

interface PaymentReceiptDialogProps {
  invoice: Invoice;
  payment: InvoicePayment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentReceiptDialog: React.FC<PaymentReceiptDialogProps> = ({
  invoice,
  payment,
  isOpen,
  onClose,
}) => {
  const { settings } = useSettings();
  const [backendReceipt, setBackendReceipt] = React.useState<any>(null);

  React.useEffect(() => {
    if (isOpen && payment && invoice) {
      invoicesApi
        .generateReceipt(invoice.invoiceId, payment.paymentId)
        .then((res) => {
          if (res) setBackendReceipt(res);
        })
        .catch(() => {});
    }
  }, [isOpen, payment?.paymentId, invoice?.invoiceId]);

  if (!payment) return null;

  const currency = invoice.currency || 'INR';
  const amount = Number(payment.amount) || 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
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

  const receiptNumber =
    backendReceipt?.receiptNumber ||
    `RCT-${new Date(payment.paymentDate || Date.now()).getFullYear()}-${payment.paymentId.slice(
      -4
    ).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return <IconDeviceMobile className='h-4 w-4 text-purple-600' />;
      case 'bank_transfer':
        return <IconBuildingBank className='h-4 w-4 text-blue-600' />;
      case 'cash':
        return <IconCash className='h-4 w-4 text-emerald-600' />;
      default:
        return <IconReceipt2 className='h-4 w-4 text-primary' />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='sm:max-w-xl p-0 overflow-hidden bg-white text-zinc-900 border-zinc-200'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-zinc-100 flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
              <IconCheck className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-zinc-950'>
                Official Payment Receipt
              </DialogTitle>
              <span className='font-mono text-xs text-zinc-500'>
                {receiptNumber}
              </span>
            </div>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handlePrint}
            className='h-8 text-xs gap-1.5'
          >
            <IconPrinter className='h-3.5 w-3.5' />
            <span>Print Receipt</span>
          </Button>
        </DialogHeader>

        {/* Printable Receipt Paper Container */}
        <div id='payment-receipt-print' className='p-6 sm:p-8 space-y-6 text-xs bg-white text-zinc-800'>
          {/* Header banner */}
          <div className='flex justify-between items-start gap-4 pb-5 border-b border-zinc-200'>
            <div>
              <span className='text-[10px] uppercase font-bold tracking-widest text-emerald-700 block mb-1'>
                PAYMENT RECEIPT
              </span>
              <h2 className='text-xl sm:text-2xl font-black tracking-tight text-zinc-950'>
                {settings.businessProfile.businessName || invoice.freelancerInfo?.name}
              </h2>
              <p className='text-[11px] text-zinc-500 max-w-xs mt-0.5'>
                {settings.businessProfile.address || invoice.freelancerInfo?.address}
              </p>
              {settings.businessProfile.gstin && (
                <p className='font-mono text-[10px] text-zinc-400 mt-0.5'>
                  GSTIN: {settings.businessProfile.gstin}
                </p>
              )}
            </div>

            <div className='text-right space-y-1'>
              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] uppercase tracking-wider'>
                <IconCheck className='h-3.5 w-3.5' />
                <span>Payment Received</span>
              </div>
              <p className='text-[11px] text-zinc-500'>
                Date: {formatDate(payment.paymentDate)}
              </p>
            </div>
          </div>

          {/* Received From & Invoice Info */}
          <div className='grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4'>
            <div>
              <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-400 block'>
                Received From
              </span>
              <span className='font-bold text-sm text-zinc-900 block mt-0.5'>
                {invoice.clientInfo?.name}
              </span>
              {invoice.clientInfo?.company && (
                <span className='text-zinc-600 block text-xs'>
                  {invoice.clientInfo.company}
                </span>
              )}
              {invoice.clientInfo?.email && (
                <span className='text-zinc-500 block text-[11px]'>
                  {invoice.clientInfo.email}
                </span>
              )}
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-400 block'>
                Invoice Reference
              </span>
              <span className='font-mono font-bold text-sm text-zinc-900 block'>
                {invoice.invoiceNumber}
              </span>
              <span className='text-zinc-500 block text-[11px] truncate max-w-xs'>
                {invoice.title}
              </span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className='space-y-2 border-t border-b border-zinc-200 py-3.5'>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500 font-medium flex items-center gap-1.5'>
                {getMethodIcon(payment.paymentMethod)}
                <span className='capitalize'>
                  {payment.paymentMethod.replace('_', ' ')}
                </span>
              </span>
              {payment.referenceNumber && (
                <span className='font-mono text-zinc-700 text-[11px]'>
                  Ref / UTR: {payment.referenceNumber}
                </span>
              )}
            </div>
            {payment.notes && (
              <p className='text-zinc-600 italic text-[11px]'>
                Remarks: "{payment.notes}"
              </p>
            )}
          </div>

          {/* Amount Box */}
          <div className='rounded-xl border-2 border-zinc-900 bg-zinc-900 text-white p-4 flex justify-between items-center'>
            <div>
              <span className='text-[10px] font-bold uppercase tracking-wider text-zinc-400 block'>
                Amount Received in Full
              </span>
              <span className='text-[11px] text-zinc-300 capitalize block mt-0.5'>
                {formatAmountInWords(amount, currency)}
              </span>
            </div>
            <div className='text-right font-mono font-black text-2xl tracking-tight text-emerald-400'>
              {formatCurrency(amount)}
            </div>
          </div>

          {/* Visual Signatory mark */}
          <div className='pt-4 flex justify-between items-end border-t border-zinc-200'>
            <div className='text-[11px] text-zinc-400 max-w-xs'>
              This is a computer-generated confirmation voucher for funds received against the referenced invoice.
            </div>
            <div className='text-right space-y-1'>
              <div className='h-8 flex items-center justify-end'>
                {settings.branding.signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.branding.signatureUrl}
                    alt='Signatory'
                    className='max-h-8 object-contain'
                  />
                ) : (
                  <span className='font-serif italic text-base text-zinc-900 font-semibold'>
                    {settings.branding.signatureText ||
                      settings.businessProfile.businessName}
                  </span>
                )}
              </div>
              <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-400 block border-t border-zinc-300 pt-1'>
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className='p-4 bg-zinc-50 border-t border-zinc-100'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            className='h-8 text-xs'
          >
            Close
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handlePrint}
            className='h-8 text-xs gap-1.5'
          >
            <IconPrinter className='h-3.5 w-3.5' />
            <span>Print Receipt</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

