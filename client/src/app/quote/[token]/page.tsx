'use client';

import { use, useEffect, useState } from 'react';
import { quotationsApi } from '@/features/quotations/api/quotations.api';
import { Quotation } from '@/features/quotations/types/quotation.types';
import { PublicQuoteViewPage } from '@/features/quotations/components/public-quote-view-page';
import { IconLoader2, IconHelp } from '@tabler/icons-react';

export default function QuotePublicPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const data = await quotationsApi.getPublicQuotation(
          resolvedParams.token
        );
        setQuotation(data);
      } catch (err: any) {
        setError(
          err?.message || 'Quotation not found or link has expired'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [resolvedParams.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground text-sm">
        <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
        <span>Loading commercial proposal...</span>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <IconHelp className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Quotation Not Found
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          {error ||
            'This quotation link is invalid or may have expired. Please contact the freelancer for an updated link.'}
        </p>
      </div>
    );
  }

  return (
    <PublicQuoteViewPage
      initialQuotation={quotation}
      token={resolvedParams.token}
    />
  );
}
