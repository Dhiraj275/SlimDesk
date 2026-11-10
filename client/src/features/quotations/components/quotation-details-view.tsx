'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { QuotationDocument } from './quotation-preview/quotation-document';
import { QuotationStatusBadge } from './quotation-status-badge';
import { SendQuotationDialog } from './send-quotation-dialog';
import { ConvertToInvoiceDialog } from './convert-to-invoice-dialog';
import { PdfActionsMenu } from '../pdf/pdf-actions-menu';
import { quotationsApi } from '../api/quotations.api';
import { Quotation } from '../types/quotation.types';
import { useSettings } from '@/features/settings/context/settings-context';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconSend,
  IconEdit,
  IconPrinter,
  IconReceipt,
  IconCopy,
  IconTrash,
  IconClock,
  IconHistory,
  IconCheck,
  IconExternalLink,
  IconWorld,
  IconBrandWhatsapp,
} from '@tabler/icons-react';

interface QuotationDetailsViewProps {
  initialQuotation: Quotation;
}

export const QuotationDetailsView: React.FC<QuotationDetailsViewProps> = ({
  initialQuotation,
}) => {
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation>(initialQuotation);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  const { getQuotationBillingMetrics } = useSettings();
  const { totalInvoiced, remainingBillable, percentBilled, allocations } =
    getQuotationBillingMetrics(quotation.quotationId, Number(quotation.totalAmount) || 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: quotation.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicate = async () => {
    try {
      const cloned = await quotationsApi.duplicateQuotation(quotation.quotationId);
      toast.success(`Duplicated as ${cloned.quotationNumber}`);
      router.push(`/dashboard/quotations/${cloned.quotationId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to duplicate quotation');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.quotationNumber}?`)) {
      return;
    }
    try {
      await quotationsApi.deleteQuotation(quotation.quotationId);
      toast.success('Quotation deleted');
      router.push('/dashboard/quotations');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete quotation');
    }
  };

  const isAccepted = quotation.status === 'accepted';
  const isConverted = quotation.status === 'converted';

  return (
    <div className='space-y-6 pb-12'>
      {/* Top Action Bar (Hidden when printing) */}
      <div className='flex items-center justify-between print:hidden'>
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='-ml-2 gap-1.5 text-muted-foreground hover:text-foreground'
        >
          <Link href='/dashboard/quotations'>
            <IconArrowLeft className='h-4 w-4' />
            <span>Back to Quotations</span>
          </Link>
        </Button>

        <div className='flex items-center flex-wrap gap-2'>
          <PdfActionsMenu quotation={quotation} />

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setIsSendOpen(true)}
            className='h-9 text-xs gap-1.5'
          >
            <IconSend className='h-4 w-4' />
            <span>Send Email</span>
          </Button>

          {quotation.publicToken && (
            <>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  const publicUrl = `${window.location.origin}/quote/${quotation.publicToken}`;
                  navigator.clipboard.writeText(publicUrl);
                  toast.success('Public proposal link copied to clipboard!');
                }}
                className='h-9 text-xs gap-1.5'
                title='Copy Public Link'
              >
                <IconCopy className='h-4 w-4' />
                <span className='hidden sm:inline'>Copy Link</span>
              </Button>

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  const publicUrl = `${window.location.origin}/quote/${quotation.publicToken}`;
                  const clientName = quotation.clientInfo?.name || 'Client';
                  const formattedAmount = formatCurrency(quotation.totalAmount);
                  const message = `Hi ${clientName},\n\nHere is your commercial proposal for "${quotation.title}" (${quotation.quotationNumber}) totaling ${formattedAmount}.\nYou can review and accept it online here:\n${publicUrl}\n\nThank you!`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className='h-9 text-xs gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                title='Share via WhatsApp'
              >
                <IconBrandWhatsapp className='h-4 w-4' />
                <span className='hidden sm:inline'>WhatsApp</span>
              </Button>
            </>
          )}

          {!isConverted && (
            <Button asChild variant='outline' size='sm' className='h-9 text-xs gap-1.5'>
              <Link href={`/dashboard/quotations/${quotation.quotationId}/edit`}>
                <IconEdit className='h-4 w-4' />
                <span>Edit</span>
              </Link>
            </Button>
          )}

          {!isConverted ? (
            <Button
              type='button'
              size='sm'
              onClick={() => setIsConvertOpen(true)}
              className='h-9 text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 shadow-2xs'
            >
              <IconReceipt className='h-4 w-4' />
              <span>Convert to Invoice</span>
            </Button>
          ) : quotation.invoiceId ? (
            <Button
              asChild
              size='sm'
              className='h-9 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
            >
              <Link href={`/dashboard/invoices/${quotation.invoiceId}`}>
                <IconReceipt className='h-4 w-4' />
                <span>View Invoice</span>
              </Link>
            </Button>
          ) : null}

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleDuplicate}
            className='h-9 text-xs gap-1.5'
          >
            <IconCopy className='h-4 w-4' />
            <span>Duplicate</span>
          </Button>

          {!isConverted && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleDelete}
              className='h-9 w-9 text-muted-foreground hover:text-destructive'
              aria-label='Delete quotation'
            >
              <IconTrash className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className='border-border/50 bg-card rounded-xl p-5 sm:p-6 shadow-xs print:hidden'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2.5 flex-wrap'>
              <h1 className='text-2xl font-bold font-mono tracking-tight text-foreground'>
                {quotation.quotationNumber}
              </h1>
              <QuotationStatusBadge status={quotation.status} />
              {quotation.version > 1 && (
                <span className='rounded px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground font-mono'>
                  Version {quotation.version}
                </span>
              )}
            </div>
            <p className='text-sm text-muted-foreground'>
              Client: <span className='font-medium text-foreground'>{quotation.clientInfo?.name}</span>
              {quotation.clientInfo?.company && ` · ${quotation.clientInfo.company}`}
              {' · '}
              <span className='font-semibold text-foreground'>{formatCurrency(quotation.totalAmount)}</span>
            </p>
          </div>

          {isConverted && (
            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-full text-xs font-semibold'>
              <IconReceipt className='h-3.5 w-3.5' />
              Invoiced
            </span>
          )}
        </div>
      </Card>

      {/* Main Grid: Rendered Document on Left, Timeline/Audit on Right */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* Document Render (8 cols) */}
        <div className='lg:col-span-8'>
          <QuotationDocument quotation={quotation} />
        </div>

        {/* Audit & Engagement Activity Timeline (4 cols, hidden in print) */}
        <div className='lg:col-span-4 space-y-4 print:hidden'>
          {/* Billing & Conversion Progress Card */}
          <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between'>
                <span>Invoicing & Allocations</span>
                <span className='font-mono text-primary font-bold'>
                  {percentBilled.toFixed(0)}% Billed
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3.5 text-xs'>
              <div className='space-y-1.5'>
                <div className='flex justify-between items-center text-muted-foreground'>
                  <span>Invoiced to date:</span>
                  <span className='font-mono font-semibold text-foreground'>
                    {formatCurrency(totalInvoiced)}
                  </span>
                </div>
                <div className='flex justify-between items-center text-muted-foreground'>
                  <span>Remaining unbilled:</span>
                  <span className='font-mono font-semibold text-emerald-600 dark:text-emerald-400'>
                    {formatCurrency(remainingBillable)}
                  </span>
                </div>
                <div className='w-full bg-muted rounded-full h-1.5 overflow-hidden mt-1'>
                  <div
                    className='h-full bg-primary transition-all duration-300'
                    style={{ width: `${percentBilled}%` }}
                  />
                </div>
              </div>

              {allocations.length > 0 && (
                <div className='pt-2 border-t border-border/40 space-y-2'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block'>
                    Generated Invoices ({allocations.length})
                  </span>
                  <div className='space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar'>
                    {allocations.map((a) => (
                      <Link
                        key={a.id}
                        href={`/dashboard/invoices/${a.invoiceId}`}
                        className='flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors border border-border/30 text-xs'
                      >
                        <div className='min-w-0 pr-2'>
                          <span className='font-mono font-bold text-foreground block truncate'>
                            {a.invoiceNumber}
                          </span>
                          <span className='text-[10px] text-muted-foreground capitalize truncate block'>
                            {a.type} · {a.note}
                          </span>
                        </div>
                        <span className='font-mono font-semibold text-foreground shrink-0'>
                          {formatCurrency(a.amountInvoiced)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {remainingBillable > 0 && (
                <Button
                  type='button'
                  size='sm'
                  onClick={() => setIsConvertOpen(true)}
                  className='w-full h-9 text-xs gap-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs'
                >
                  <IconReceipt className='h-3.5 w-3.5' />
                  <span>
                    {totalInvoiced > 0
                      ? 'Bill Next Milestone'
                      : 'Convert to Invoice'}
                  </span>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Public Portal Quick Card */}
          <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between'>
                <span>Client Review Portal</span>
                <a
                  href={`/quote/${quotation.publicToken}`}
                  target='_blank'
                  rel='noreferrer'
                  className='text-primary hover:underline text-xs font-normal flex items-center gap-1 normal-case'
                >
                  Open Portal <IconExternalLink className='h-3.5 w-3.5' />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-xs'>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Clients can view, print, and approve this commercial proposal via the secure portal link without needing an account.
              </p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsSendOpen(true)}
                className='w-full h-9 text-xs gap-1.5'
              >
                <IconSend className='h-3.5 w-3.5' />
                <span>Copy / Send Link</span>
              </Button>
            </CardContent>
          </Card>

          {/* Engagement Timeline */}
          <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                <IconClock className='h-4 w-4' />
                <span>Engagement History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-xs'>
              <div className='relative pl-6 space-y-4 border-l-2 border-border/60 ml-2'>
                {/* Created */}
                <div className='relative'>
                  <div className='absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background' />
                  <div className='font-semibold text-foreground text-xs'>
                    Proposal Drafted
                  </div>
                  <div className='text-[11px] text-muted-foreground'>
                    {formatDate(quotation.createdAt)}
                  </div>
                </div>

                {/* Viewed */}
                {quotation.viewedAt && (
                  <div className='relative'>
                    <div className='absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-background' />
                    <div className='font-semibold text-foreground text-xs'>
                      Client Viewed Proposal
                    </div>
                    <div className='text-[11px] text-muted-foreground'>
                      {formatDate(quotation.viewedAt)}
                    </div>
                  </div>
                )}

                {/* Accepted */}
                {quotation.acceptedAt && (
                  <div className='relative'>
                    <div className='absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background' />
                    <div className='font-semibold text-emerald-600 dark:text-emerald-400 text-xs'>
                      Approved by Client
                    </div>
                    <div className='text-[11px] text-muted-foreground'>
                      {quotation.acceptedByName} {quotation.acceptedByEmail && `(${quotation.acceptedByEmail})`}
                    </div>
                    <div className='text-[11px] text-muted-foreground'>
                      {formatDate(quotation.acceptedAt)}
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {quotation.rejectedAt && (
                  <div className='relative'>
                    <div className='absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-rose-500 ring-4 ring-background' />
                    <div className='font-semibold text-rose-600 dark:text-rose-400 text-xs'>
                      Declined by Client
                    </div>
                    {quotation.rejectionReason && (
                      <div className='text-[11px] text-muted-foreground italic'>
                        "{quotation.rejectionReason}"
                      </div>
                    )}
                    <div className='text-[11px] text-muted-foreground'>
                      {formatDate(quotation.rejectedAt)}
                    </div>
                  </div>
                )}

                {/* Converted */}
                {quotation.convertedAt && (
                  <div className='relative'>
                    <div className='absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-background' />
                    <div className='font-semibold text-purple-600 dark:text-purple-400 text-xs'>
                      Converted to Invoice
                    </div>
                    <div className='text-[11px] text-muted-foreground'>
                      {formatDate(quotation.convertedAt)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historical Version Snapshots */}
          {quotation.versions && quotation.versions.length > 0 && (
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                  <IconHistory className='h-4 w-4' />
                  <span>Version Snapshots ({quotation.versions.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-xs'>
                {quotation.versions.map((ver) => (
                  <div
                    key={ver.versionId}
                    className='p-3 rounded-lg border border-border/40 bg-muted/20 text-xs space-y-1'
                  >
                    <div className='flex justify-between items-center font-medium'>
                      <span className='font-mono font-semibold text-foreground'>Version {ver.versionNumber}</span>
                      <span className='text-[11px] text-muted-foreground'>
                        {formatDate(ver.createdAt)}
                      </span>
                    </div>
                    {ver.changeSummary && (
                      <p className='text-[11px] text-muted-foreground'>
                        {ver.changeSummary}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Share / Send Dialog */}
      <SendQuotationDialog
        quotation={quotation}
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        onSuccess={(updated) => setQuotation(updated)}
      />

      {/* Convert Dialog */}
      <ConvertToInvoiceDialog
        quotation={quotation}
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        onSuccess={(inv) => {
          quotationsApi.getQuotationById(quotation.quotationId).then(setQuotation);
          if (inv?.invoiceId) {
            router.push(`/dashboard/invoices/${inv.invoiceId}`);
          }
        }}
      />
    </div>
  );
};
