import React from 'react';
import { Quotation, PartyInfo, QuotationItem } from '../../types/quotation.types';
import { QuotationStatusBadge } from '../quotation-status-badge';
import { formatAmountInWords } from '../../pdf/amount-in-words';
import {
  IconBuilding,
  IconCalendar,
  IconMail,
  IconPhone,
  IconMapPin,
  IconShieldCheck,
} from '@tabler/icons-react';

interface QuotationDocumentProps {
  quotation: Partial<Quotation> & {
    quotationNumber?: string;
    title: string;
    currency?: string;
    issueDate: string;
    expiryDate: string;
    items: QuotationItem[];
    subtotal: number;
    discountAmount?: number;
    taxAmount?: number;
    totalAmount: number;
    taxMode?: 'none' | 'gst' | 'flat';
    freelancerInfo: PartyInfo;
    clientInfo: PartyInfo;
    paymentSchedule?: string | null;
    terms?: string | null;
    notes?: string | null;
  };
  showStatusBadge?: boolean;
}

export const QuotationDocument: React.FC<QuotationDocumentProps> = ({
  quotation,
  showStatusBadge = true,
}) => {
  const currencySymbol = quotation.currency === 'USD' ? '$' : '₹';

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: quotation.currency || 'INR',
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

  const isTaxActive = quotation.taxMode && quotation.taxMode !== 'none';
  const hasGst = quotation.taxMode === 'gst';

  return (
    <div className='bg-white text-zinc-900 shadow-sm border border-zinc-200 rounded-xl overflow-hidden print:border-none print:shadow-none p-6 sm:p-10 font-sans max-w-4xl mx-auto'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-zinc-200'>
        <div>
          <div className='flex items-center gap-3'>
            <span className='text-xs font-bold uppercase tracking-widest text-zinc-500'>
              Commercial Quotation
            </span>
            {showStatusBadge && quotation.status && (
              <QuotationStatusBadge status={quotation.status} />
            )}
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1 font-mono'>
            {quotation.quotationNumber || 'QT-DRAFT'}
          </h1>
          <p className='text-sm font-semibold text-zinc-600 mt-1'>
            {quotation.freelancerInfo?.businessName ||
              quotation.freelancerInfo?.name ||
              'Slimdesk Freelance Studio'}
          </p>
        </div>

        <div className='text-left sm:text-right space-y-1 text-xs text-zinc-600'>
          <div className='flex items-center sm:justify-end gap-1.5 font-medium'>
            <IconCalendar className='w-3.5 h-3.5 text-zinc-400' />
            <span className='text-zinc-500'>Issue Date:</span>{' '}
            <span className='text-zinc-900 font-semibold'>
              {formatDate(quotation.issueDate)}
            </span>
          </div>
          <div className='flex items-center sm:justify-end gap-1.5 font-medium'>
            <IconCalendar className='w-3.5 h-3.5 text-zinc-400' />
            <span className='text-zinc-500'>Valid Until:</span>{' '}
            <span className='text-zinc-900 font-semibold'>
              {formatDate(quotation.expiryDate)}
            </span>
          </div>
          {quotation.version && quotation.version > 1 && (
            <div className='text-zinc-400 font-mono text-[11px]'>
              Revision #{quotation.version}
            </div>
          )}
        </div>
      </div>

      {/* Parties: From & To */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-zinc-200 text-xs'>
        {/* From (Freelancer) */}
        <div className='space-y-2'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-zinc-400'>
            From / Service Provider
          </span>
          <div className='font-bold text-sm text-zinc-900'>
            {quotation.freelancerInfo?.name}
          </div>
          {quotation.freelancerInfo?.businessName && (
            <div className='text-zinc-700 font-medium'>
              {quotation.freelancerInfo.businessName}
            </div>
          )}
          {quotation.freelancerInfo?.address && (
            <div className='flex items-start gap-1 text-zinc-600'>
              <IconMapPin className='w-3.5 h-3.5 mt-0.5 text-zinc-400 shrink-0' />
              <span>{quotation.freelancerInfo.address}</span>
            </div>
          )}
          <div className='space-y-0.5 pt-1 text-zinc-600'>
            {quotation.freelancerInfo?.email && (
              <div className='flex items-center gap-1.5'>
                <IconMail className='w-3.5 h-3.5 text-zinc-400' />
                <span>{quotation.freelancerInfo.email}</span>
              </div>
            )}
            {quotation.freelancerInfo?.phone && (
              <div className='flex items-center gap-1.5'>
                <IconPhone className='w-3.5 h-3.5 text-zinc-400' />
                <span>{quotation.freelancerInfo.phone}</span>
              </div>
            )}
            {quotation.freelancerInfo?.gstin && (
              <div className='pt-1 font-mono text-[11px] text-zinc-800 font-semibold'>
                GSTIN: {quotation.freelancerInfo.gstin}
              </div>
            )}
          </div>
        </div>

        {/* To (Client) */}
        <div className='space-y-2'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-zinc-400'>
            Prepared For / Client
          </span>
          <div className='font-bold text-sm text-zinc-900'>
            {quotation.clientInfo?.name}
          </div>
          {quotation.clientInfo?.company && (
            <div className='text-zinc-700 font-medium flex items-center gap-1'>
              <IconBuilding className='w-3.5 h-3.5 text-zinc-400' />
              <span>{quotation.clientInfo.company}</span>
            </div>
          )}
          {quotation.clientInfo?.address && (
            <div className='flex items-start gap-1 text-zinc-600'>
              <IconMapPin className='w-3.5 h-3.5 mt-0.5 text-zinc-400 shrink-0' />
              <span>{quotation.clientInfo.address}</span>
            </div>
          )}
          <div className='space-y-0.5 pt-1 text-zinc-600'>
            {quotation.clientInfo?.email && (
              <div className='flex items-center gap-1.5'>
                <IconMail className='w-3.5 h-3.5 text-zinc-400' />
                <span>{quotation.clientInfo.email}</span>
              </div>
            )}
            {quotation.clientInfo?.phone && (
              <div className='flex items-center gap-1.5'>
                <IconPhone className='w-3.5 h-3.5 text-zinc-400' />
                <span>{quotation.clientInfo.phone}</span>
              </div>
            )}
            {quotation.clientInfo?.gstin && (
              <div className='pt-1 font-mono text-[11px] text-zinc-800 font-semibold'>
                GSTIN: {quotation.clientInfo.gstin}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Title / Scope Headline */}
      <div className='py-6 border-b border-zinc-200'>
        <span className='text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1'>
          Deliverable Scope / Project
        </span>
        <h2 className='text-lg font-bold text-zinc-900 tracking-tight'>
          {quotation.title}
        </h2>
      </div>

      {/* Line Items Table */}
      <div className='py-6 border-b border-zinc-200 overflow-x-auto'>
        <table className='w-full text-left text-xs'>
          <thead>
            <tr className='border-b-2 border-zinc-900 text-zinc-900 font-bold uppercase text-[10px] tracking-wider'>
              <th className='pb-3 w-10'>#</th>
              <th className='pb-3'>Deliverable / Description</th>
              <th className='pb-3 w-16 text-center'>Qty</th>
              <th className='pb-3 w-20 text-center'>Unit</th>
              <th className='pb-3 w-28 text-right'>Rate</th>
              {isTaxActive && <th className='pb-3 w-20 text-center'>Tax</th>}
              <th className='pb-3 w-28 text-right'>Amount</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-200'>
            {(quotation.items || []).map((item, idx) => (
              <tr key={idx} className='text-zinc-700'>
                <td className='py-3 font-mono text-zinc-400 text-[11px]'>{idx + 1}</td>
                <td className='py-3 font-medium text-zinc-900'>
                  {item.description || 'Deliverable'}
                </td>
                <td className='py-3 text-center tabular-nums'>{item.quantity}</td>
                <td className='py-3 text-center text-zinc-500 capitalize'>
                  {item.unit || 'units'}
                </td>
                <td className='py-3 text-right font-mono tabular-nums'>
                  {formatCurrency(item.unitPrice)}
                </td>
                {isTaxActive && (
                  <td className='py-3 text-center text-zinc-500 tabular-nums'>
                    {item.taxRate || 0}%
                  </td>
                )}
                <td className='py-3 text-right font-semibold font-mono text-zinc-900 tabular-nums'>
                  {formatCurrency(
                    Number(item.quantity) * Number(item.unitPrice) -
                      Number(item.discount || 0)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commercial Summary & Totals */}
      <div className='flex flex-col sm:flex-row justify-between items-start gap-8 py-8 border-b border-zinc-200'>
        <div className='flex-1 max-w-sm space-y-3 text-xs'>
          {quotation.paymentSchedule && (
            <div>
              <span className='font-bold text-zinc-800 text-[11px] uppercase tracking-wider block mb-1'>
                Payment Milestones
              </span>
              <p className='text-zinc-600 text-xs whitespace-pre-line'>
                {quotation.paymentSchedule}
              </p>
            </div>
          )}

          {quotation.notes && (
            <div>
              <span className='font-bold text-zinc-800 text-[11px] uppercase tracking-wider block mb-1'>
                Notes
              </span>
              <p className='text-zinc-600 text-xs whitespace-pre-line'>
                {quotation.notes}
              </p>
            </div>
          )}
        </div>

        <div className='w-full sm:w-72 space-y-2 text-xs'>
          <div className='flex justify-between text-zinc-600'>
            <span>Subtotal</span>
            <span className='font-mono font-medium text-zinc-900'>
              {formatCurrency(quotation.subtotal || 0)}
            </span>
          </div>

          {Boolean(quotation.discountAmount && Number(quotation.discountAmount) > 0) && (
            <div className='flex justify-between text-zinc-600'>
              <span>Discount</span>
              <span className='font-mono font-medium text-rose-600'>
                - {formatCurrency(quotation.discountAmount || 0)}
              </span>
            </div>
          )}

          {isTaxActive && (
            <div className='flex justify-between text-zinc-600'>
              <span>{hasGst ? 'GST (Taxes)' : 'Tax'}</span>
              <span className='font-mono font-medium text-zinc-900'>
                + {formatCurrency(quotation.taxAmount || 0)}
              </span>
            </div>
          )}

          <div className='pt-3 border-t-2 border-zinc-900 flex justify-between items-baseline'>
            <span className='font-bold text-zinc-900 text-sm uppercase tracking-wider'>
              Grand Total
            </span>
            <span className='font-black text-xl text-zinc-900 font-mono tracking-tight'>
              {formatCurrency(quotation.totalAmount || 0)}
            </span>
          </div>

          <div className='pt-2 text-right'>
            <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-500 block'>
              Amount in words
            </span>
            <span className='text-xs font-semibold text-zinc-800 leading-snug'>
              {formatAmountInWords(quotation.totalAmount || 0, quotation.currency)}
            </span>
          </div>

          <p className='text-[10px] text-zinc-500 text-right pt-0.5'>
            Prices quoted in {quotation.currency || 'INR'}
          </p>
        </div>
      </div>

      {/* Terms & Conditions */}
      {quotation.terms && (
        <div className='py-6 border-b border-zinc-200 text-xs text-zinc-600 space-y-1.5'>
          <span className='font-bold text-zinc-800 text-[11px] uppercase tracking-wider block'>
            Terms & Scope Conditions
          </span>
          <p className='whitespace-pre-line text-zinc-600 leading-relaxed'>
            {quotation.terms}
          </p>
        </div>
      )}

      {/* Document Sign-off Footer */}
      <div className='pt-10 flex flex-col sm:flex-row justify-between items-end gap-8 text-xs text-zinc-500'>
        <div className='space-y-1'>
          <p className='font-semibold text-zinc-800'>Thank you for your business!</p>
          <p className='text-[11px]'>
            Generated automatically via Slimdesk Quotation Engine.
          </p>
        </div>

        <div className='w-48 text-center border-t border-zinc-300 pt-2 text-[11px]'>
          Authorized Signature
        </div>
      </div>
    </div>
  );
};
