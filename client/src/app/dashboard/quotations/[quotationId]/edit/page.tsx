'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/shared/components/layout/page-container';
import { quotationsApi } from '@/features/quotations/api/quotations.api';
import { Quotation } from '@/features/quotations/types/quotation.types';
import { QuotationForm } from '@/features/quotations/components/quotation-builder/quotation-form';
import { Button } from '@/shared/components/ui/button';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const resolvedParams = use(params);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const data = await quotationsApi.getQuotationById(
          resolvedParams.quotationId
        );
        setQuotation(data);
      } catch (err: any) {
        setError(err?.message || 'Quotation could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [resolvedParams.quotationId]);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground text-sm'>
          <IconLoader2 className='h-6 w-6 animate-spin text-primary' />
          <span>Loading quotation editor...</span>
        </div>
      </PageContainer>
    );
  }

  if (error || !quotation) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 text-center'>
          <div className='text-destructive font-semibold text-base'>
            {error || 'Quotation not found'}
          </div>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link href='/dashboard/quotations'>
              <IconArrowLeft className='h-4 w-4' />
              <span>Back to Quotations</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <QuotationForm initialData={quotation} />
    </PageContainer>
  );
}
