'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/shared/components/layout/page-container';
import { invoicesApi } from '@/features/invoices/api/invoices.api';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { InvoiceForm } from '@/features/invoices/components/invoice-builder/invoice-form';
import { Button } from '@/shared/components/ui/button';
import { IconArrowLeft, IconLoader2, IconAlertCircle } from '@tabler/icons-react';

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await invoicesApi.getInvoiceById(
          resolvedParams.invoiceId
        );
        setInvoice(data);
      } catch (err: any) {
        setError(err?.message || 'Invoice could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [resolvedParams.invoiceId]);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground text-sm'>
          <IconLoader2 className='h-6 w-6 animate-spin text-primary' />
          <span>Loading invoice editor...</span>
        </div>
      </PageContainer>
    );
  }

  if (error || !invoice) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 text-center'>
          <div className='text-destructive font-semibold text-base'>
            {error || 'Invoice not found'}
          </div>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link href='/dashboard/invoices'>
              <IconArrowLeft className='h-4 w-4' />
              <span>Back to Invoices</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Enforce immutability on issued or cancelled invoices
  if (invoice.status !== 'draft') {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 text-center max-w-md mx-auto'>
          <div className='h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20'>
            <IconAlertCircle className='h-6 w-6' />
          </div>
          <div className='space-y-1.5'>
            <h2 className='text-lg font-bold text-foreground'>
              Issued Invoices are Immutable
            </h2>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Invoice <span className='font-mono font-semibold'>{invoice.invoiceNumber}</span> has already been finalized and {invoice.status}. To make adjustments, please cancel the invoice or record a refund.
            </p>
          </div>
          <Button asChild size='sm' className='gap-1.5 mt-2'>
            <Link href={`/dashboard/invoices/${invoice.invoiceId}`}>
              <IconArrowLeft className='h-4 w-4' />
              <span>Return to Invoice Details</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <InvoiceForm initialData={invoice} />
    </PageContainer>
  );
}
