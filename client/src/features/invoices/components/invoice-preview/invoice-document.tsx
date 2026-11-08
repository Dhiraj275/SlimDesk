'use client';

import React from 'react';
import { Invoice, PartyInfo, InvoiceItem } from '../../types/invoice.types';
import { InvoiceDualBadges } from '../invoice-status-badge';
import { formatAmountInWords } from '@/features/quotations/pdf/amount-in-words';
import {
  IconBuilding,
  IconCalendar,
  IconCreditCard,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface InvoiceDocumentProps {
  invoice: {
    invoiceNumber: string;
    title: string;
    status: Invoice['status'];
    paymentStatus?: Invoice['paymentStatus'];
    isOverdue?: boolean;
    currency: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    subtotal: number;
    discountAmount?: number;
    taxAmount?: number;
    totalAmount: number;
    paidAmount?: number;
    outstandingAmount?: number;
    paymentPercentage?: number;
    taxMode?: 'none' | 'gst' | 'flat';
    taxDetails?: any;
    freelancerInfo: PartyInfo;
    clientInfo: PartyInfo;
    paymentDetails?: string | null;
    terms?: string | null;
    notes?: string | null;
  };
  showStatusBadge?: boolean;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  showStatusBadge = true,
}) => {
  const currency = invoice.currency || 'INR';

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(num);
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

  const subtotal = Number(invoice.subtotal) || 0;
  const discountAmount = Number(invoice.discountAmount) || 0;
  const taxAmount = Number(invoice.taxAmount) || 0;
  const totalAmount = Number(invoice.totalAmount) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;
  const outstandingAmount =
    invoice.outstandingAmount !== undefined
      ? Number(invoice.outstandingAmount)
      : Math.max(0, totalAmount - paidAmount);

  const isTaxActive = invoice.taxMode && invoice.taxMode !== 'none' && taxAmount > 0;
  const hasGst = invoice.taxMode === 'gst';

  return (
    <div className='w-full max-w-4xl mx-auto bg-white text-zinc-900 shadow-xl border border-zinc-200/80 rounded-2xl p-6 sm:p-10 font-sans print:shadow-none print:border-none print:p-0'>
      {/* Top Banner / Document Title */}
      <div className='flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-200'>
        <div>
          <div className='flex items-center gap-3 flex-wrap'>
            <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase'>
              INVOICE
            </h1>
            {showStatusBadge && (
              <InvoiceDualBadges
                invoiceStatus={invoice.status}
                paymentStatus={invoice.paymentStatus}
                isOverdue={invoice.isOverdue}
              />
            )}
          </div>
          <p className='text-xs font-mono font-bold text-zinc-500 mt-1 uppercase tracking-wider'>
            {invoice.invoiceNumber}
          </p>
          <h2 className='text-sm sm:text-base font-semibold text-zinc-800 mt-2'>
            {invoice.title}
          </h2>
        </div>

        {/* Studio / Freelancer Brand Heading */}
        <div className='text-left sm:text-right space-y-0.5'>
          <p className='text-sm sm:text-base font-extrabold text-zinc-950 uppercase tracking-tight'>
            {invoice.freelancerInfo?.businessName ||
              invoice.freelancerInfo?.name ||
              'Freelancer Studio'}
          </p>
          {invoice.freelancerInfo?.gstin && (
            <p className='text-xs font-mono font-medium text-zinc-600'>
              GSTIN: {invoice.freelancerInfo.gstin}
            </p>
          )}
        </div>
      </div>

      {/* Bill From, Bill To & Key Metadata */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-zinc-200 text-xs'>
        {/* From Party */}
        <div className='space-y-1.5'>
          <span className='font-bold text-zinc-400 uppercase tracking-wider text-[10px] block'>
            From
          </span>
          <div className='font-semibold text-zinc-950 text-sm'>
            {invoice.freelancerInfo?.name || 'Freelancer Name'}
          </div>
          {invoice.freelancerInfo?.businessName &&
            invoice.freelancerInfo.businessName !== invoice.freelancerInfo.name && (
              <div className='text-zinc-600 font-medium'>
                {invoice.freelancerInfo.businessName}
              </div>
            )}
          {invoice.freelancerInfo?.email && (
            <div className='text-zinc-600 flex items-center gap-1.5'>
              <IconMail className='w-3.5 h-3.5 text-zinc-400 shrink-0' />
              <span>{invoice.freelancerInfo.email}</span>
            </div>
          )}
          {invoice.freelancerInfo?.phone && (
            <div className='text-zinc-600 flex items-center gap-1.5'>
              <IconPhone className='w-3.5 h-3.5 text-zinc-400 shrink-0' />
              <span>{invoice.freelancerInfo.phone}</span>
            </div>
          )}
          {invoice.freelancerInfo?.address && (
            <div className='text-zinc-600 flex items-start gap-1.5 leading-relaxed'>
              <IconMapPin className='w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5' />
              <span>{invoice.freelancerInfo.address}</span>
            </div>
          )}
        </div>

        {/* Bill To Client */}
        <div className='space-y-1.5'>
          <span className='font-bold text-zinc-400 uppercase tracking-wider text-[10px] block'>
            Bill To
          </span>
          <div className='font-semibold text-zinc-950 text-sm'>
            {invoice.clientInfo?.name || 'Client Name'}
          </div>
          {invoice.clientInfo?.company && (
            <div className='text-zinc-700 font-medium'>
              {invoice.clientInfo.company}
            </div>
          )}
          {invoice.clientInfo?.email && (
            <div className='text-zinc-600 flex items-center gap-1.5'>
              <IconMail className='w-3.5 h-3.5 text-zinc-400 shrink-0' />
              <span>{invoice.clientInfo.email}</span>
            </div>
          )}
          {invoice.clientInfo?.phone && (
            <div className='text-zinc-600 flex items-center gap-1.5'>
              <IconPhone className='w-3.5 h-3.5 text-zinc-400 shrink-0' />
              <span>{invoice.clientInfo.phone}</span>
            </div>
          )}
          {invoice.clientInfo?.gstin && (
            <div className='font-mono text-zinc-600'>
              GSTIN: {invoice.clientInfo.gstin}
            </div>
          )}
        </div>

        {/* Dates & Reference Details */}
        <div className='space-y-2 sm:text-right'>
          <span className='font-bold text-zinc-400 uppercase tracking-wider text-[10px] block'>
            Invoice Details
          </span>
          <div>
            <span className='text-zinc-500 text-[11px] block'>Invoice Date:</span>
            <span className='font-semibold text-zinc-900'>
              {formatDate(invoice.issueDate)}
            </span>
          </div>
          <div>
            <span className='text-zinc-500 text-[11px] block'>Due Date:</span>
            <span
              className={cn(
                'font-bold',
                invoice.isOverdue && invoice.status === 'issued'
                  ? 'text-rose-600 font-mono'
                  : 'text-zinc-900'
              )}
            >
              {formatDate(invoice.dueDate)}
            </span>
          </div>
          <div>
            <span className='text-zinc-500 text-[11px] block'>Tax Mode:</span>
            <span className='font-medium text-zinc-700 uppercase'>
              {invoice.taxMode === 'gst'
                ? 'GST Tax Invoice'
                : invoice.taxMode === 'flat'
                ? 'Flat Tax'
                : 'Non-GST'}
            </span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className='py-6'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse text-xs'>
            <thead>
              <tr className='border-b-2 border-zinc-900 text-zinc-900 uppercase tracking-wider text-[10px] font-bold'>
                <th className='py-2.5 px-2 w-8 text-center'>#</th>
                <th className='py-2.5 px-3'>Deliverable / Description</th>
                <th className='py-2.5 px-3 text-center w-20'>Unit</th>
                <th className='py-2.5 px-3 text-center w-16'>Qty</th>
                <th className='py-2.5 px-3 text-right w-24'>Rate</th>
                {isTaxActive && (
                  <th className='py-2.5 px-3 text-center w-16'>Tax %</th>
                )}
                <th className='py-2.5 px-3 text-right w-28'>Amount</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-zinc-200'>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => {
                  const lineTotal =
                    Number(item.quantity || 0) * Number(item.unitPrice || 0);

                  return (
                    <tr key={idx} className='hover:bg-zinc-50/50 transition-colors'>
                      <td className='py-3 px-2 text-center text-zinc-400 font-mono text-[11px]'>
                        {idx + 1}
                      </td>
                      <td className='py-3 px-3'>
                        <div className='font-semibold text-zinc-900'>
                          {item.description}
                        </div>
                        {Number(item.discountAmount || 0) > 0 && (
                          <div className='text-[10px] text-emerald-700 mt-0.5'>
                            Discount: -{formatCurrency(item.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td className='py-3 px-3 text-center text-zinc-500 capitalize'>
                        {item.unit || 'units'}
                      </td>
                      <td className='py-3 px-3 text-center font-mono text-zinc-700'>
                        {item.quantity}
                      </td>
                      <td className='py-3 px-3 text-right font-mono text-zinc-700'>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      {isTaxActive && (
                        <td className='py-3 px-3 text-center font-mono text-zinc-700'>
                          {item.taxRate ? `${item.taxRate}%` : '0%'}
                        </td>
                      )}
                      <td className='py-3 px-3 text-right font-mono font-semibold text-zinc-900'>
                        {formatCurrency(item.totalAmount || lineTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className='py-8 text-center text-zinc-400'>
                    No line items specified.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary & Bank/UPI Payment Details */}
      <div className='pt-4 pb-6 border-t border-zinc-200 flex flex-col-reverse sm:flex-row justify-between items-start gap-8'>
        {/* Left Column: Bank / UPI Details, Notes */}
        <div className='space-y-4 w-full sm:max-w-md text-xs'>
          {/* Payment Details Box */}
          <div className='rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-2'>
            <span className='font-bold text-zinc-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5'>
              <IconCreditCard className='w-4 h-4 text-zinc-700' />
              <span>Payment Details & Instructions</span>
            </span>
            <div className='text-zinc-700 leading-relaxed font-mono text-[11px] whitespace-pre-line'>
              {invoice.paymentDetails ||
                'Please contact freelancer for bank transfer details or UPI instructions.'}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className='space-y-1 text-zinc-600'>
              <span className='font-bold text-zinc-800 text-[11px] uppercase tracking-wider block'>
                Notes
              </span>
              <p className='whitespace-pre-line leading-relaxed text-zinc-600'>
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Financial Totals Box */}
        <div className='w-full sm:w-72 space-y-2 text-xs'>
          <div className='flex justify-between text-zinc-600'>
            <span>Subtotal</span>
            <span className='font-mono font-medium text-zinc-900'>
              {formatCurrency(subtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className='flex justify-between text-zinc-600'>
              <span className='text-emerald-700'>Total Discount</span>
              <span className='font-mono font-medium text-emerald-700'>
                - {formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          {/* Tax Breakdown */}
          {hasGst && invoice.taxDetails ? (
            invoice.taxDetails.isInterState ? (
              <div className='flex justify-between text-zinc-600'>
                <span>IGST (Inter-state)</span>
                <span className='font-mono font-medium text-zinc-900'>
                  + {formatCurrency(invoice.taxDetails.igstAmount || taxAmount)}
                </span>
              </div>
            ) : (
              <>
                <div className='flex justify-between text-zinc-600'>
                  <span>CGST (Intra-state)</span>
                  <span className='font-mono font-medium text-zinc-900'>
                    + {formatCurrency(invoice.taxDetails.cgstAmount || taxAmount / 2)}
                  </span>
                </div>
                <div className='flex justify-between text-zinc-600'>
                  <span>SGST (Intra-state)</span>
                  <span className='font-mono font-medium text-zinc-900'>
                    + {formatCurrency(invoice.taxDetails.sgstAmount || taxAmount / 2)}
                  </span>
                </div>
              </>
            )
          ) : isTaxActive ? (
            <div className='flex justify-between text-zinc-600'>
              <span>Tax</span>
              <span className='font-mono font-medium text-zinc-900'>
                + {formatCurrency(taxAmount)}
              </span>
            </div>
          ) : null}

          <div className='pt-3 border-t-2 border-zinc-900 flex justify-between items-baseline'>
            <span className='font-bold text-zinc-900 text-sm uppercase tracking-wider'>
              Total Amount
            </span>
            <span className='font-black text-xl text-zinc-950 font-mono tracking-tight'>
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Amount In Words */}
          <div className='pt-2 text-right'>
            <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-500 block'>
              Amount in words
            </span>
            <span className='text-xs font-semibold text-zinc-800 leading-snug'>
              {formatAmountInWords(totalAmount, currency)}
            </span>
          </div>

          {/* Paid / Outstanding breakdown if applicable */}
          {paidAmount > 0 && (
            <div className='mt-3 pt-3 border-t border-zinc-200/80 space-y-1.5 bg-zinc-50/50 p-2.5 rounded-lg'>
              <div className='flex justify-between text-emerald-700 font-medium'>
                <span>Amount Paid</span>
                <span className='font-mono'>{formatCurrency(paidAmount)}</span>
              </div>
              <div className='flex justify-between text-zinc-950 font-bold'>
                <span>Balance Due</span>
                <span className='font-mono text-sm'>
                  {formatCurrency(outstandingAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Terms */}
      {invoice.terms && (
        <div className='py-5 border-t border-zinc-200 text-xs text-zinc-600 space-y-1'>
          <span className='font-bold text-zinc-800 text-[11px] uppercase tracking-wider block'>
            Payment Terms
          </span>
          <p className='whitespace-pre-line text-zinc-600 leading-relaxed'>
            {invoice.terms}
          </p>
        </div>
      )}

      {/* Sign-off Footer */}
      <div className='pt-8 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500'>
        <p className='font-semibold text-zinc-700 text-center sm:text-left'>
          Thank you for your business!
        </p>
        <p className='text-[11px] text-zinc-400'>
          Generated via SlimDesk · Professional Freelancer Platform
        </p>
      </div>
    </div>
  );
};
