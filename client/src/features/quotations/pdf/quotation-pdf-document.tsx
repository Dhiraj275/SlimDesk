'use client';

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { format } from 'date-fns';
import { Quotation, QuotationStatus } from '../types/quotation.types';
import { formatCurrencyText } from './currency-helper';
import { formatAmountInWords } from './amount-in-words';
import { registerPdfFonts } from './pdf-fonts';

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

interface QuotationPdfDocumentProps {
  quotation: Quotation;
}

const STATUS_LABELS: Record<QuotationStatus, { text: string; bg: string; color: string; border: string }> = {
  draft: { text: 'DRAFT', bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' },
  sent: { text: 'SENT', bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  viewed: { text: 'REVIEWED', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  accepted: { text: 'ACCEPTED', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  rejected: { text: 'DECLINED', bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  expired: { text: 'EXPIRED', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  converted: { text: 'INVOICED', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
  cancelled: { text: 'CANCELLED', bg: '#f4f4f5', color: '#71717a', border: '#e4e4e7' },
};

export const QuotationPdfDocument: React.FC<QuotationPdfDocumentProps> = ({
  quotation,
}) => {
  const statusConfig = STATUS_LABELS[quotation.status] || STATUS_LABELS.draft;
  const currency = quotation.currency || 'INR';

  const formattedIssueDate = quotation.issueDate
    ? format(new Date(quotation.issueDate), 'dd MMM yyyy')
    : '—';

  const formattedExpiryDate = quotation.expiryDate
    ? format(new Date(quotation.expiryDate), 'dd MMM yyyy')
    : '—';

  return (
    <Document
      title={`Quotation-${quotation.quotationNumber}`}
      author={quotation.freelancerInfo?.name || 'SlimDesk'}
      creator='SlimDesk Commercial Management'
      producer='SlimDesk PDF Engine'
    >
      <Page
        size='A4'
        style={{
          ...tw('p-10 text-[9pt] leading-normal text-secondary bg-white'),
          fontFamily: 'Inter',
        }}
      >
        {/* ================= HEADER SECTION ================= */}
        <View style={tw('flex flex-row justify-between items-start pb-6 border-b border-borderline')}>
          {/* Organization / Freelancer Profile */}
          <View style={tw('flex flex-col gap-1 max-w-[60%]')}>
            <Text style={tw('text-[16pt] font-bold text-primary tracking-tight')}>
              {quotation.freelancerInfo?.businessName ||
                quotation.freelancerInfo?.company ||
                quotation.freelancerInfo?.name ||
                'Studio Freelance'}
            </Text>
            {quotation.freelancerInfo?.name &&
              (quotation.freelancerInfo?.businessName || quotation.freelancerInfo?.company) && (
                <Text style={tw('text-[9pt] text-muted')}>
                  By {quotation.freelancerInfo.name}
                </Text>
              )}
            {quotation.freelancerInfo?.address && (
              <Text style={tw('text-[8pt] text-muted leading-tight mt-0.5')}>
                {quotation.freelancerInfo.address}
              </Text>
            )}
            <View style={tw('flex flex-row gap-3 mt-1 text-[8pt] text-muted')}>
              {quotation.freelancerInfo?.email && (
                <Text>{quotation.freelancerInfo.email}</Text>
              )}
              {quotation.freelancerInfo?.phone && (
                <Text>• {quotation.freelancerInfo.phone}</Text>
              )}
            </View>
            {quotation.freelancerInfo?.gstin && (
              <Text style={tw('text-[7.5pt] text-muted mt-1 font-mono')}>
                GSTIN: {quotation.freelancerInfo.gstin}
              </Text>
            )}
          </View>

          {/* Quotation Metadata & Status Badge */}
          <View style={tw('flex flex-col items-end gap-1.5')}>
            <View style={tw('flex flex-row items-center gap-2')}>
              <Text style={tw('text-[7.5pt] font-bold uppercase tracking-widest text-muted')}>
                COMMERCIAL PROPOSAL
              </Text>
              <View
                style={{
                  backgroundColor: statusConfig.bg,
                  borderColor: statusConfig.border,
                  ...tw('px-2 py-0.5 rounded-full border'),
                }}
              >
                <Text
                  style={{
                    color: statusConfig.color,
                    ...tw('text-[7pt] font-bold uppercase tracking-wider'),
                  }}
                >
                  {statusConfig.text}
                </Text>
              </View>
            </View>

            <Text style={tw('text-[18pt] font-bold text-primary font-mono tracking-tight')}>
              {quotation.quotationNumber}
            </Text>

            <View style={tw('flex flex-col items-end gap-0.5 text-[8pt] text-muted mt-1')}>
              <Text>
                Issue Date:{' '}
                <Text style={tw('font-semibold text-secondary')}>
                  {formattedIssueDate}
                </Text>
              </Text>
              <Text>
                Valid Until:{' '}
                <Text style={tw('font-semibold text-secondary')}>
                  {formattedExpiryDate}
                </Text>
              </Text>
              {quotation.version && quotation.version > 1 && (
                <Text style={tw('font-mono text-[7pt] text-faint')}>
                  Revision v{quotation.version}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ================= PROPOSAL TITLE ================= */}
        <View style={tw('pt-4 pb-4 border-b border-borderline')}>
          <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-muted mb-0.5')}>
            Project Title / Scope
          </Text>
          <Text style={tw('text-[11pt] font-semibold text-primary')}>
            {quotation.title || 'Professional Services & Deliverables'}
          </Text>
        </View>

        {/* ================= PARTIES INFO ================= */}
        <View style={tw('flex flex-row justify-between pt-4 pb-5 border-b border-borderline')}>
          {/* Billed / Prepared For */}
          <View style={tw('flex flex-col gap-1 w-[48%]')}>
            <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-muted')}>
              Prepared For
            </Text>
            <Text style={tw('text-[10pt] font-bold text-primary')}>
              {quotation.clientInfo?.name || 'Prospective Client'}
            </Text>
            {quotation.clientInfo?.company && (
              <Text style={tw('text-[8.5pt] font-medium text-secondary')}>
                {quotation.clientInfo.company}
              </Text>
            )}
            {quotation.clientInfo?.address && (
              <Text style={tw('text-[8pt] text-muted leading-tight')}>
                {quotation.clientInfo.address}
              </Text>
            )}
            <View style={tw('flex flex-col gap-0.5 mt-1 text-[8pt] text-muted')}>
              {quotation.clientInfo?.email && (
                <Text>Email: {quotation.clientInfo.email}</Text>
              )}
              {quotation.clientInfo?.phone && (
                <Text>Phone: {quotation.clientInfo.phone}</Text>
              )}
              {quotation.clientInfo?.gstin && (
                <Text style={tw('font-mono text-[7.5pt]')}>
                  GSTIN: {quotation.clientInfo.gstin}
                </Text>
              )}
            </View>
          </View>

          {/* Place of Supply / Commercial Details */}
          <View style={tw('flex flex-col gap-1 w-[48%] items-end text-right')}>
            <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-muted')}>
              Commercial Terms
            </Text>
            <Text style={tw('text-[8.5pt] text-secondary')}>
              Currency: <Text style={tw('font-semibold font-mono')}>{currency}</Text>
            </Text>
            {quotation.taxDetails?.placeOfSupply && (
              <Text style={tw('text-[8.5pt] text-secondary')}>
                Place of Supply:{' '}
                <Text style={tw('font-semibold')}>
                  {quotation.taxDetails.placeOfSupply}
                </Text>
              </Text>
            )}
            <Text style={tw('text-[8.5pt] text-secondary')}>
              Tax Scheme:{' '}
              <Text style={tw('font-semibold uppercase')}>
                {quotation.taxMode === 'gst'
                  ? 'Indian GST'
                  : quotation.taxMode === 'flat'
                  ? 'Flat Tax'
                  : 'Zero / None'}
              </Text>
            </Text>
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
          {quotation.items && quotation.items.length > 0 ? (
            quotation.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice;
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
                    {item.discount > 0 && (
                      <Text style={tw('text-[7pt] text-emerald-700 mt-0.5')}>
                        Includes {item.discount}% discount
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
                    {formatCurrencyText(currency, lineTotal)}
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

        {/* ================= SUMMARY & CONDITIONS (WRAP=FALSE) ================= */}
        <View wrap={false} style={tw('flex flex-row justify-between items-start gap-6 mt-5')}>
          {/* Left Column: Terms, Notes & Amount in Words */}
          <View style={tw('flex flex-col gap-3 w-[55%]')}>
            {/* Amount in words */}
            <View style={tw('p-2.5 rounded border border-borderline bg-lightbg')}>
              <Text style={tw('text-[7pt] font-bold uppercase tracking-wider text-muted mb-0.5')}>
                Total Proposal Value (in words)
              </Text>
              <Text style={tw('text-[8.5pt] font-semibold text-primary leading-snug')}>
                {formatAmountInWords(quotation.totalAmount, currency)}
              </Text>
            </View>

            {/* Payment Schedule */}
            {quotation.paymentSchedule && (
              <View style={tw('flex flex-col gap-0.5')}>
                <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-secondary')}>
                  Payment Terms & Milestones
                </Text>
                <Text style={tw('text-[7.5pt] text-muted leading-relaxed')}>
                  {quotation.paymentSchedule}
                </Text>
              </View>
            )}

            {/* Terms & Conditions */}
            {quotation.terms && (
              <View style={tw('flex flex-col gap-0.5')}>
                <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-secondary')}>
                  Terms & Conditions
                </Text>
                <Text style={tw('text-[7.5pt] text-muted leading-relaxed')}>
                  {quotation.terms}
                </Text>
              </View>
            )}

            {/* Notes */}
            {quotation.notes && (
              <View style={tw('flex flex-col gap-0.5')}>
                <Text style={tw('text-[7.5pt] font-bold uppercase tracking-wider text-secondary')}>
                  Special Notes
                </Text>
                <Text style={tw('text-[7.5pt] text-muted leading-relaxed')}>
                  {quotation.notes}
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
                {formatCurrencyText(currency, quotation.subtotal)}
              </Text>
            </View>

            {/* Overall Discount (if any) */}
            {quotation.discountAmount > 0 && (
              <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                <Text style={tw('text-emerald-700 font-medium')}>Total Discount</Text>
                <Text style={tw('font-mono text-emerald-700 font-semibold')}>
                  - {formatCurrencyText(currency, quotation.discountAmount)}
                </Text>
              </View>
            )}

            {/* Tax Breakdown */}
            {quotation.taxMode === 'gst' && quotation.taxDetails ? (
              quotation.taxDetails.isInterState ? (
                <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                  <Text style={tw('text-muted')}>IGST (Inter-state)</Text>
                  <Text style={tw('font-mono text-secondary')}>
                    {formatCurrencyText(currency, quotation.taxDetails.igstAmount)}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                    <Text style={tw('text-muted')}>CGST (Intra-state)</Text>
                    <Text style={tw('font-mono text-secondary')}>
                      {formatCurrencyText(currency, quotation.taxDetails.cgstAmount)}
                    </Text>
                  </View>
                  <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                    <Text style={tw('text-muted')}>SGST (Intra-state)</Text>
                    <Text style={tw('font-mono text-secondary')}>
                      {formatCurrencyText(currency, quotation.taxDetails.sgstAmount)}
                    </Text>
                  </View>
                </>
              )
            ) : quotation.taxAmount > 0 ? (
              <View style={tw('flex flex-row justify-between items-center text-[8pt]')}>
                <Text style={tw('text-muted')}>Tax Amount</Text>
                <Text style={tw('font-mono text-secondary')}>
                  {formatCurrencyText(currency, quotation.taxAmount)}
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
                {formatCurrencyText(currency, quotation.totalAmount)}
              </Text>
            </View>

            {/* Tax inclusive note */}
            <Text style={tw('text-[6.5pt] text-muted text-right')}>
              {quotation.taxMode === 'none'
                ? 'No tax applicable / Non-GST'
                : 'All taxes calculated per regulatory rates'}
            </Text>
          </View>
        </View>

        {/* ================= SIGN-OFF & FOOTER ================= */}
        <View wrap={false} style={tw('flex flex-row justify-between items-end pt-8 mt-auto text-[7.5pt] text-muted border-t border-borderline')}>
          <View style={tw('flex flex-col gap-1 max-w-[60%]')}>
            <Text style={tw('font-semibold text-secondary')}>
              Thank you for considering our proposal!
            </Text>
            <Text style={tw('text-[7pt] text-faint')}>
              This document constitutes a formal commercial quotation. Acceptance confirms approval of scope and pricing.
            </Text>
          </View>

          <View style={tw('flex flex-col items-center gap-1 w-44')}>
            <View style={tw('w-full border-b border-borderline pt-8')} />
            <Text style={tw('text-[7pt] uppercase tracking-wider font-semibold text-secondary')}>
              Authorized Signatory
            </Text>
            <Text style={tw('text-[6.5pt] text-muted')}>
              {quotation.freelancerInfo?.name || 'SlimDesk Representative'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

