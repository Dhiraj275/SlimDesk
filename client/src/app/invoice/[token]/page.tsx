'use client';

import { use, useEffect, useState } from 'react';
import { invoicesApi } from '@/features/invoices/api/invoices.api';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { PublicInvoiceViewPage } from '@/features/invoices/components/public-invoice-view-page';
import { IconLoader2, IconHelp } from '@tabler/icons-react';

export default function InvoicePublicPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await invoicesApi.getPublicInvoice(
          resolvedParams.token
        );
        setInvoice(data);
      } catch (err: any) {
        setError(
          err?.message || 'Invoice not found or link has expired'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [resolvedParams.token]);

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground text-sm'>
        <IconLoader2 className='w-8 h-8 animate-spin text-primary' />
        <span>Loading commercial invoice...</span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center'>
        <div className='w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20'>
          <IconHelp className='w-6 h-6' />
        </div>
        <div className='space-y-1.5 max-w-sm'>
          <h2 className='text-lg font-bold text-foreground'>
            Invoice Unavailable
          </h2>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            {error || 'This invoice link may be invalid or expired. Please contact the freelancer for an updated link.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <PublicInvoiceViewPage
      initialInvoice={invoice}
      token={resolvedParams.token}
    />
  );
}

