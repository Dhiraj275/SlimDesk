'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Quotation } from '../types/quotation.types';
import { invoicesApi } from '@/features/invoices/api/invoices.api';
import { useSettings } from '@/features/settings/context/settings-context';
import { toast } from 'sonner';
import {
  IconReceipt,
  IconCheck,
  IconArrowRight,
  IconLoader2,
  IconCoins,
  IconPercentage,
  IconSparkles,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface ConvertToInvoiceDialogProps {
  quotation: Quotation | null;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (invoice: any) => void;
}

type BillingType = 'full' | 'advance' | 'custom';

export const ConvertToInvoiceDialog: React.FC<ConvertToInvoiceDialogProps> = ({
  quotation,
  isOpen,
  open,
  onClose,
  onOpenChange,
  onSuccess,
}) => {
  const router = useRouter();
  const { getQuotationBillingMetrics, recordQuotationAllocation } = useSettings();

  const isModalOpen = open ?? isOpen ?? false;
  const handleModalClose = (val: boolean) => {
    if (!val) {
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    }
  };

  const [billingType, setBillingType] = useState<BillingType>('advance');
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<number>(10000);
  const [invoiceTitle, setInvoiceTitle] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);

  if (!quotation) return null;

  const totalQuotationValue = Number(quotation.totalAmount) || 0;
  const currency = quotation.currency || 'INR';

  // Real-time metrics
  const { totalInvoiced, remainingBillable, allocations } =
    getQuotationBillingMetrics(quotation.quotationId, totalQuotationValue);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Compute amount to bill right now
  let amountToBill = 0;
  if (billingType === 'full') {
    amountToBill = remainingBillable;
  } else if (billingType === 'advance') {
    amountToBill = Math.round((totalQuotationValue * advancePercent) / 100);
    // Cannot exceed remaining billable
    amountToBill = Math.min(amountToBill, remainingBillable);
  } else {
    amountToBill = Math.min(Math.max(1, Number(customAmount) || 0), remainingBillable);
  }

  const remainingAfterThis = Math.max(0, remainingBillable - amountToBill);

  const defaultSuggestedTitle =
    billingType === 'advance'
      ? `${advancePercent}% Advance Kickoff Deposit · ${quotation.title}`
      : billingType === 'custom'
      ? `Milestone Payment · ${quotation.title}`
      : `Full Project Settlement · ${quotation.title}`;

  const handleConvert = async () => {
    if (amountToBill <= 0) {
      toast.error('Billing amount must be greater than zero');
      return;
    }

    setIsConverting(true);
    try {
      const titleToUse = invoiceTitle.trim() || defaultSuggestedTitle;

      // Construct line item(s) for the invoice
      let itemsPayload = [];
      if (billingType === 'full' && allocations.length === 0) {
        // Full original quotation line items
        itemsPayload = (quotation.items || []).map((item, idx) => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'units',
          unitPrice: Number(item.unitPrice) || 0,
          discountAmount: Number(item.discount) || 0,
          taxRate: Number(item.taxRate) || 0,
          sortOrder: idx,
        }));
      } else {
        // Milestone / Advance line item
        itemsPayload = [
          {
            description: titleToUse,
            quantity: 1,
            unit: 'milestone',
            unitPrice: amountToBill,
            discountAmount: 0,
            taxRate: quotation.taxMode !== 'none' ? 18 : 0,
            sortOrder: 0,
          },
        ];
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const dueDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const invoice = await invoicesApi.createInvoice({
        title: titleToUse,
        contactId: quotation.contactId || undefined,
        quotationId: quotation.quotationId,
        currency,
        issueDate: todayStr,
        dueDate: dueDateStr,
        taxMode: quotation.taxMode || 'none',
        discountAmount: 0,
        freelancerInfo: quotation.freelancerInfo,
        clientInfo: quotation.clientInfo,
        paymentDetails:
          quotation.paymentSchedule ||
          'Bank Transfer / UPI remittance details will be provided.',
        terms:
          quotation.terms ||
          'Payment due within 14 days of invoice issuance.',
        notes: `Billed against accepted quotation ${quotation.quotationNumber}. Remaining unbilled: ${formatCurrency(
          remainingAfterThis
        )}.`,
        items: itemsPayload,
      });

      // Record allocation tracking
      recordQuotationAllocation({
        quotationId: quotation.quotationId,
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        amountInvoiced: amountToBill,
        date: todayStr,
        type: billingType,
        note: titleToUse,
      });

      toast.success(
        `Invoice ${invoice.invoiceNumber} generated (${formatCurrency(amountToBill)})`
      );

      if (onSuccess) onSuccess(invoice);
      handleModalClose(false);

      router.push(`/dashboard/invoices/${invoice.invoiceId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to convert quotation to invoice');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className='sm:max-w-lg p-6 sm:p-7'>
        <DialogHeader className='space-y-1.5 pb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'>
              <IconReceipt className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                Convert Quotation to Invoice
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {quotation.quotationNumber} · {quotation.clientInfo?.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4 pt-1 text-xs'>
          {/* Billable Tracking Summary Banner */}
          <div className='grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-center'>
            <div>
              <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                Total Proposal
              </span>
              <span className='font-mono font-bold text-foreground text-xs sm:text-sm'>
                {formatCurrency(totalQuotationValue)}
              </span>
            </div>
            <div>
              <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                Already Invoiced
              </span>
              <span className='font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm'>
                {formatCurrency(totalInvoiced)}
              </span>
            </div>
            <div>
              <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground block'>
                Remaining Billable
              </span>
              <span className='font-mono font-bold text-primary text-xs sm:text-sm'>
                {formatCurrency(remainingBillable)}
              </span>
            </div>
          </div>

          {/* Option Selector Cards */}
          <div className='space-y-2'>
            <Label className='text-xs font-semibold'>Choose Billing Structure</Label>

            <div className='grid grid-cols-1 gap-2.5'>
              {/* Option 2: Advance / Deposit (Recommended) */}
              <div
                onClick={() => setBillingType('advance')}
                className={cn(
                  'rounded-xl border p-3.5 transition-all cursor-pointer space-y-2',
                  billingType === 'advance'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border/60 hover:border-border bg-card'
                )}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-xs text-foreground'>
                      Advance / Deposit Payment
                    </span>
                    <span className='px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-1'>
                      <IconSparkles className='h-3 w-3' />
                      Recommended
                    </span>
                  </div>
                  <span className='font-mono font-bold text-sm text-foreground'>
                    {formatCurrency(
                      Math.min(
                        Math.round((totalQuotationValue * advancePercent) / 100),
                        remainingBillable
                      )
                    )}
                  </span>
                </div>

                <p className='text-[11px] text-muted-foreground'>
                  Bill an upfront deposit before project kickoff. The remaining amount stays tracked and can be billed upon delivery.
                </p>

                {billingType === 'advance' && (
                  <div className='flex items-center gap-2 pt-1'>
                    <span className='text-[11px] font-medium text-muted-foreground'>
                      Deposit percentage:
                    </span>
                    <div className='flex items-center gap-1.5'>
                      {[25, 30, 50, 75].map((pct) => (
                        <button
                          key={pct}
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdvancePercent(pct);
                          }}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
                            advancePercent === pct
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted'
                          )}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 1: Full Amount */}
              <div
                onClick={() => setBillingType('full')}
                className={cn(
                  'rounded-xl border p-3.5 transition-all cursor-pointer flex items-center justify-between',
                  billingType === 'full'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border/60 hover:border-border bg-card'
                )}
              >
                <div>
                  <span className='font-semibold text-xs text-foreground block'>
                    Full Invoice (100% Remaining)
                  </span>
                  <span className='text-[11px] text-muted-foreground'>
                    Bill the complete remaining balance of {formatCurrency(remainingBillable)}.
                  </span>
                </div>
                <span className='font-mono font-bold text-sm text-foreground'>
                  {formatCurrency(remainingBillable)}
                </span>
              </div>

              {/* Option 3: Custom Amount */}
              <div
                onClick={() => setBillingType('custom')}
                className={cn(
                  'rounded-xl border p-3.5 transition-all cursor-pointer space-y-2',
                  billingType === 'custom'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border/60 hover:border-border bg-card'
                )}
              >
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-xs text-foreground'>
                    Custom Milestone Amount
                  </span>
                  {billingType === 'custom' && (
                    <span className='font-mono font-bold text-sm text-foreground'>
                      {formatCurrency(amountToBill)}
                    </span>
                  )}
                </div>
                <p className='text-[11px] text-muted-foreground'>
                  Specify an arbitrary agreed upfront milestone amount (e.g., ₹10,000).
                </p>

                {billingType === 'custom' && (
                  <div className='pt-1'>
                    <Input
                      type='number'
                      min='1'
                      max={remainingBillable}
                      value={customAmount}
                      onChange={(e) =>
                        setCustomAmount(parseFloat(e.target.value) || 0)
                      }
                      className='h-9 text-xs font-mono'
                      placeholder='Enter custom amount'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Subject Line */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>Invoice Deliverable Title</Label>
            <Input
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
              placeholder={defaultSuggestedTitle}
              className='h-9 text-xs'
            />
          </div>

          {/* Remaining After Calculation Note */}
          <div className='rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between'>
            <span>Unbilled balance remaining after this invoice:</span>
            <span className='font-mono font-bold'>
              {formatCurrency(remainingAfterThis)}
            </span>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0 pt-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => handleModalClose(false)}
            className='h-9 text-xs'
          >
            Cancel
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={isConverting || amountToBill <= 0}
            onClick={handleConvert}
            className='h-9 text-xs gap-1.5 shadow-xs font-semibold'
          >
            {isConverting ? (
              <>
                <IconLoader2 className='h-4 w-4 animate-spin' />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <IconCheck className='h-4 w-4' />
                <span>Generate Invoice ({formatCurrency(amountToBill)})</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
