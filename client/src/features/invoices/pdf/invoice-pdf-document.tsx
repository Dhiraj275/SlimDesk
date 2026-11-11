'use client';

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { format } from 'date-fns';
import { Invoice, PaymentStatus, InvoiceStatus } from '../types/invoice.types';
import { formatCurrencyText } from '@/features/quotations/pdf/currency-helper';
import { formatAmountInWords } from '@/features/quotations/pdf/amount-in-words';
import { registerPdfFonts } from '@/features/quotations/pdf/pdf-fonts';

// Ensure fonts are registered
registerPdfFonts();

const tw = createTw({
  theme: {
    fontFamily: {
      sans: ['Inter'],
      mono: ['GeistMono'],
      geistmono: ['GeistMono'],
      jetbrainsmono: ['JetBrainsMono'],
    },
    extend: {
      colors: {
        primary: '#09090b',
        secondary: '#27272a',
        muted: '#71717a',
        faint: '#a1a1aa',
        lightbg: '#fafafa',
        cardbg: '#f4f4f5',
        borderline: '#e4e4e7',
      },
    },
  },
});

interface InvoicePdfDocumentProps {
  invoice: Invoice;
}

const PAYMENT_STATUS_LABELS: Record<
  PaymentStatus,
  { text: string; bg: string; color: string; border: string }
> = {
  unpaid: { text: 'UNPAID', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  partially_paid: {
    text: 'PARTIALLY PAID',
    bg: '#faf5ff',
    color: '#7e22ce',
    border: '#e9d5ff',
  },
  paid: { text: 'PAID', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  overdue: { text: 'OVERDUE', bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  refunded: { text: 'REFUNDED', bg: '#f4f4f5', color: '#71717a', border: '#e4e4e7' },
};

export const InvoicePdfDocument: React.FC<InvoicePdfDocumentProps> = ({
  invoice,
}) => {
  const currency = invoice.currency || 'INR';

  const isOverdue =
    Boolean(invoice.isOverdue) &&
    invoice.status === 'issued' &&
    invoice.paymentStatus !== 'paid' &&
    invoice.paymentStatus !== 'refunded';

  const effectivePaymentStatus: PaymentStatus = isOverdue
    ? 'overdue'
    : invoice.paymentStatus || 'unpaid';

  const statusConfig =
    PAYMENT_STATUS_LABELS[effectivePaymentStatus] ||
    PAYMENT_STATUS_LABELS.unpaid;

  const formattedIssueDate = invoice.issueDate
    ? format(new Date(invoice.issueDate), 'dd MMM yyyy')
    : '—';

  const formattedDueDate = invoice.dueDate
    ? format(new Date(invoice.dueDate), 'dd MMM yyyy')
    : '—';

  const totalAmount = Number(invoice.totalAmount) || 0;
  const subtotal = Number(invoice.subtotal) || 0;
  const discountAmount = Number(invoice.discountAmount) || 0;
  const taxAmount = Number(invoice.taxAmount) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;
  const outstandingAmount = Number(invoice.outstandingAmount) || 0;

  return (
    <Document
      title={`Invoice - ${invoice.invoiceNumber}`}
      author={invoice.freelancerInfo?.name || 'SlimDesk'}
      subject={invoice.title}
      creator='SlimDesk Freelancer Suite'
      producer='SlimDesk Invoicing Engine'
    >
      <Page size='A4' style={tw('p-8 bg-white text-secondary font-sans')}>
        {/* ================= HEADER ================= */}
        <View style={tw('flex flex-row justify-between items-start pb-5 border-b border-borderline')}>
          {/* Left Header: Doc Title, Number & Status */}
          <View style={tw('flex flex-col')}>
            <View style={tw('flex flex-row items-center gap-3')}>
              <Text style={tw('text-2xl font-black text-primary tracking-tight')}>
                INVOICE
              </Text>
              {/* Payment Status Pill */}
              <View
                style={{
                  backgroundColor: statusConfig.bg,
                  borderColor: statusConfig.border,
                  borderWidth: 1,
                  borderRadius: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    color: statusConfig.color,
                    fontSize: 7.5,
                    fontWeight: 'bold',
                    letterSpacing: 0.8,
                  }}
                >
                  {statusConfig.text}
                </Text>
              </View>

              {invoice.status === 'draft' && (
                <View
                  style={{
                    backgroundColor: '#f4f4f5',
                    borderColor: '#e4e4e7',
                    borderWidth: 1,
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: '#71717a', fontSize: 7, fontWeight: 'bold' }}>
                    DRAFT
                  </Text>
                </View>
              )}
            </View>

            <Text style={tw('font-mono font-bold text-[10pt] text-primary mt-1')}>
              {invoice.invoiceNumber}
            </Text>

            <Text style={tw('text-[9pt] font-semibold text-secondary mt-1 max-w-[320pt]')}>
              {invoice.title}
            </Text>
          </View>

          {/* Right Header: Freelancer Studio Branding */}
          <View style={tw('flex flex-col items-end')}>
            <Text style={tw('text-base font-black tracking-tight text-primary text-right uppercase')}>
              {invoice.freelancerInfo?.businessName ||
                invoice.freelancerInfo?.name ||
                'FREELANCER STUDIO'}
            </Text>
            {invoice.freelancerInfo?.gstin && (
              <Text style={tw('text-[7.5pt] font-mono font-medium text-muted mt-1')}>
                GSTIN: {invoice.freelancerInfo.gstin}
              </Text>
            )}
            {invoice.freelancerInfo?.email && (
              <Text style={tw('text-[7.5pt] text-muted mt-0.5')}>
                {invoice.freelancerInfo.email}
              </Text>
            )}
            {invoice.freelancerInfo?.phone && (
              <Text style={tw('text-[7.5pt] text-muted mt-0.5')}>
                {invoice.freelancerInfo.phone}
              </Text>
            )}
          </View>
        </View>

        {/* ================= BILLING & METADATA SECTION ================= */}
        <View style={tw('flex flex-row justify-between items-start py-5 border-b border-borderline text-[8pt]')}>
          {/* Freelancer Billing Address */}
          <View style={tw('w-[32%] flex flex-col gap-1')}>
            <Text style={tw('text-[7pt] font-bold uppercase tracking-wider text-muted mb-0.5')}>
              From
            </Text>
            <Text style={tw('font-bold text-primary')}>
              {invoice.freelancerInfo?.name || invoice.freelancerInfo?.businessName || ''}
            </Text>
            {invoice.freelancerInfo?.businessName &&
              invoice.freelancerInfo.businessName !== invoice.freelancerInfo.name && (
                <Text style={tw('text-secondary font-medium')}>
                  {invoice.freelancerInfo.businessName}
                </Text>
              )}
            {invoice.freelancerInfo?.address && (
              <Text style={tw('text-muted leading-tight mt-0.5')}>
                {invoice.freelancerInfo.address}
              </Text>
            )}
          </View>

          {/* Client Details */}
          <View style={tw('w-[36%] flex flex-col gap-1')}>
            <Text style={tw('text-[7pt] font-bold uppercase tracking-wider text-muted mb-0.5')}>
              Bill To
            </Text>
            <Text style={tw('font-bold text-primary')}>
              {invoice.clientInfo?.name || 'Client Name'}
            </Text>
            {invoice.clientInfo?.company && (
              <Text style={tw('text-secondary font-medium')}>
                {invoice.clientInfo.company}
              </Text>
            )}
            {invoice.clientInfo?.email && (
              <Text style={tw('text-muted')}>{invoice.clientInfo.email}</Text>
            )}
            {invoice.clientInfo?.phone && (
              <Text style={tw('text-muted')}>{invoice.clientInfo.phone}</Text>
            )}
            {invoice.clientInfo?.gstin && (
              <Text style={tw('font-mono text-muted text-[7.5pt]')}>
                GSTIN: {invoice.clientInfo.gstin}
              </Text>
            )}
            {invoice.clientInfo?.address && (
              <Text style={tw('text-muted leading-tight mt-0.5')}>
                {invoice.clientInfo.address}
              </Text>
            )}
          </View>

          {/* Dates & Reference Block */}
          <View style={tw('w-[28%] flex flex-col items-end gap-1.5')}>
            <View style={tw('flex flex-row justify-between w-full')}>
              <Text style={tw('text-muted')}>Invoice Date:</Text>
              <Text style={tw('font-mono font-medium text-primary')}>
                {formattedIssueDate}
              </Text>
            </View>

            <View style={tw('flex flex-row justify-between w-full')}>
              <Text style={tw('text-muted')}>Due Date:</Text>
              <Text
                style={tw(
                  `font-mono font-bold ${
                    isOverdue ? 'text-rose-700' : 'text-primary'
                  }`
                )}
              >
                {formattedDueDate}
              </Text>
            </View>

            <View style={tw('flex flex-row justify-between w-full')}>
              <Text style={tw('text-muted')}>Tax Mode:</Text>
              <Text style={tw('font-medium text-secondary uppercase text-[7.5pt]')}>
                {invoice.taxMode === 'gst'
                  ? 'Indian GST'
                  : invoice.taxMode === 'flat'
                  ? 'Flat Tax'
                  : 'Non-GST'}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= LINE ITEMS TABLE ================= */}
        <View style={tw('mt-5')}>
          {/* Table Header */}
          <View
            style={tw(
              'flex flex-row items-center py-2 px-2.5 border-y border-borderline bg-cardbg text-[7.5pt] font-bold uppercase tracking-wider'
            )}
          >
            <Text style={tw('w-[6%] text-center text-primary font-bold')}>#</Text>
            <Text style={tw('w-[46%] text-primary font-bold')}>Deliverable / Description</Text>
            <Text style={tw('w-[10%] text-center text-primary font-bold')}>Unit</Text>
            <Text style={tw('w-[10%] text-center text-primary font-bold')}>Qty</Text>
            <Text style={tw('w-[14%] text-right text-primary font-bold')}>Rate</Text>
            <Text style={tw('w-[14%] text-right text-primary font-bold')}>Amount</Text>
          </View>

          {/* Table Rows */}
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => {
              const lineTotal =
                Number(item.quantity || 0) * Number(item.unitPrice || 0);
              const isEven = idx % 2 === 0;

              return (
                <View
                  key={idx}
                  wrap={false}
                  style={tw(
                    `flex flex-row items-center py-2.5 px-2.5 border-b border-borderline text-[8pt] ${
                      isEven ? 'bg-white' : 'bg-lightbg'
                    }`
                  )}
                >
                  <Text style={tw('w-[6%] text-center text-muted font-mono text-[7.5pt]')}>
                    {idx + 1}
                  </Text>
                  <View style={tw('w-[46%] pr-2')}>
                    <Text style={tw('font-semibold text-primary leading-tight')}>
                      {item.description}
                    </Text>
                    {Number(item.discountAmount || 0) > 0 && (
                      <Text style={tw('text-[7pt] text-emerald-700 mt-0.5')}>
                        Discount: -{formatCurrencyText(currency, item.discountAmount)}
                      </Text>
                    )}
                  </View>
                  <Text style={tw('w-[10%] text-center text-muted capitalize text-[7.5pt]')}>
                    {item.unit || 'units'}
                  </Text>
                  <Text style={tw('w-[10%] text-center font-mono text-secondary')}>
                    {item.quantity}
                  </Text>
                  <Text style={tw('w-[14%] text-right font-mono text-secondary')}>
                    {formatCurrencyText(currency, item.unitPrice)}
                  </Text>
                  <Text style={tw('w-[14%] text-right font-mono font-semibold text-primary')}>
                    {formatCurrencyText(currency, item.totalAmount || lineTotal)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={tw('p-4 text-center border-b border-borderline text-muted text-[8pt]')}>
              <Text>No line items specified.</Text>
            </View>
          )}
        </View>

        {/* ================= SUMMARY & PAYMENT DETAILS (WRAP=FALSE) ================= */}
        <View wrap={false} style={tw('flex flex-row justify-between items-start gap-6 mt-5')}>
          {/* Left Column: Bank/UPI Details, Terms & Amount in Words */}
          <View style={tw('flex flex-col gap-3 w-[55%]')}>
            {/* Amount in words */}
            <View style={tw('p-2.5 rounded border border-borderline bg-lightbg')}>
              <Text style={tw('text-[7pt] font-bold uppercase tracking-wider text-muted mb-0.5')}>
                Total Invoice Value (in words)
              </Text>
              <Text style={tw('text-[8.5pt] font-semibold text-primary leading-snug')}>
                {formatAmountInWords(totalAmount, currency)}
              </Text>
            </View>

            {/* Bank Transfer / UPI Details Box */}
            <View style={tw('p-2.5 rounded border border-borderline bg-cardbg')}>
              <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-primary mb-1')}>
                Payment Details & Instructions
              </Text>
              <Text style={tw('text-[7.5pt] font-mono text-secondary leading-relaxed')}>
                {invoice.paymentDetails ||
                  'Please contact freelancer for bank transfer details or UPI instructions.'}
              </Text>
            </View>

            {/* Payment Terms */}
            {invoice.terms && (
              <View style={tw('flex flex-col gap-0.5')}>
                <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-secondary')}>
                  Payment Terms
                </Text>
                <Text style={tw('text-[7.5pt] text-muted leading-relaxed')}>
                  {invoice.terms}
                </Text>
              </View>
            )}

            {/* Notes */}
            {invoice.notes && (
              <View style={tw('flex flex-col gap-0.5')}>
                <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-secondary')}>
                  Notes
                </Text>
                <Text style={tw('text-[7.5pt] text-muted leading-relaxed')}>
                  {invoice.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Right Column: Financial Totals Box */}
          <View style={tw('flex flex-col gap-1.5 p-3.5 rounded border border-borderline bg-lightbg w-[40%]')}>
            {/* Subtotal */}
            <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
              <Text style={tw('text-muted font-medium')}>Subtotal</Text>
              <Text style={tw('font-mono font-medium text-secondary')}>
                {formatCurrencyText(currency, subtotal)}
              </Text>
            </View>

            {/* Overall Discount (if any) */}
            {discountAmount > 0 && (
              <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                <Text style={tw('text-emerald-700 font-medium')}>Total Discount</Text>
                <Text style={tw('font-mono text-emerald-700 font-semibold')}>
                  - {formatCurrencyText(currency, discountAmount)}
                </Text>
              </View>
            )}

            {/* Tax Breakdown */}
            {invoice.taxMode === 'gst' && invoice.taxDetails ? (
              invoice.taxDetails.isInterState ? (
                <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                  <Text style={tw('text-muted')}>IGST (Inter-state)</Text>
                  <Text style={tw('font-mono text-secondary')}>
                    {formatCurrencyText(currency, invoice.taxDetails.igstAmount || taxAmount)}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                    <Text style={tw('text-muted')}>CGST (Intra-state)</Text>
                    <Text style={tw('font-mono text-secondary')}>
                      {formatCurrencyText(currency, invoice.taxDetails.cgstAmount || taxAmount / 2)}
                    </Text>
                  </View>
                  <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                    <Text style={tw('text-muted')}>SGST (Intra-state)</Text>
                    <Text style={tw('font-mono text-secondary')}>
                      {formatCurrencyText(currency, invoice.taxDetails.sgstAmount || taxAmount / 2)}
                    </Text>
                  </View>
                </>
              )
            ) : taxAmount > 0 ? (
              <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                <Text style={tw('text-muted')}>Tax Amount</Text>
                <Text style={tw('font-mono text-secondary')}>
                  {formatCurrencyText(currency, taxAmount)}
                </Text>
              </View>
            ) : null}

            {/* Total Divider */}
            <View style={tw('border-b-2 border-primary my-1')} />

            {/* Grand Total */}
            <View style={tw('flex flex-row justify-between items-baseline pt-0.5')}>
              <Text style={tw('text-[9pt] font-bold uppercase tracking-wider text-primary')}>
                Total Payable
              </Text>
              <Text style={tw('text-[13pt] font-bold font-mono text-primary tracking-tight')}>
                {formatCurrencyText(currency, totalAmount)}
              </Text>
            </View>

            {/* Paid & Outstanding breakdown */}
            {paidAmount > 0 && (
              <View style={tw('mt-2 pt-2 border-t border-borderline flex flex-col gap-1 text-[8pt]')}>
                <View style={tw('flex flex-row justify-between items-center')}>
                  <Text style={tw('text-emerald-700 font-medium')}>Amount Paid</Text>
                  <Text style={tw('font-mono text-emerald-700 font-semibold')}>
                    {formatCurrencyText(currency, paidAmount)}
                  </Text>
                </View>
                <View style={tw('flex flex-row justify-between items-center pt-0.5')}>
                  <Text style={tw('text-primary font-bold')}>Balance Due</Text>
                  <Text style={tw('font-mono font-bold text-primary')}>
                    {formatCurrencyText(currency, outstandingAmount)}
                  </Text>
                </View>
              </View>
            )}

            {/* Tax inclusive note */}
            <Text style={tw('text-[6.5pt] text-muted text-right mt-1')}>
              {invoice.taxMode === 'none'
                ? 'No tax applicable / Non-GST'
                : 'All taxes calculated per regulatory rates'}
            </Text>
          </View>
        </View>

        {/* ================= SIGN-OFF & FOOTER ================= */}
        <View wrap={false} style={tw('flex flex-row justify-between items-end pt-8 mt-auto text-[7.5pt] text-muted border-t border-borderline')}>
          <View style={tw('flex flex-col gap-1 max-w-[60%]')}>
            <Text style={tw('font-semibold text-secondary')}>
              Thank you for your business!
            </Text>
            <Text style={tw('text-[7pt] text-faint')}>
              This is a computer-generated commercial invoice created via SlimDesk.
            </Text>
          </View>

          <View style={tw('flex flex-col items-end gap-1')}>
            <Text style={tw('font-bold font-mono text-primary')}>
              {invoice.invoiceNumber}
            </Text>
            <Text style={tw('text-[6.5pt] text-faint')}>
              Generated on {format(new Date(), 'dd MMM yyyy, HH:mm')}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

