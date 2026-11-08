'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/shared/components/layout/page-container';
import { invoicesApi } from '@/features/invoices/api/invoices.api';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { InvoiceDetailsView } from '@/features/invoices/components/invoice-details-view';
import { Button } from '@/shared/components/ui/button';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';

export default function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
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
          <span>Loading invoice details and transaction ledger...</span>
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

  return (
    <PageContainer>
      <InvoiceDetailsView initialInvoice={invoice} />
    </PageContainer>
  );
}

