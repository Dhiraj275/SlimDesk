'use client';

import { use, useEffect, useState } from 'react';
import PageContainer from '@/shared/components/layout/page-container';
import { InvoiceForm } from '@/features/invoices/components/invoice-builder/invoice-form';
import { contactsApi } from '@/features/contacts/api/contacts.api';

export default function NewInvoicePage({
  searchParams,
}: {
  searchParams?: Promise<{
    contactId?: string;
    quotationId?: string;
    title?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const [initialTitle, setInitialTitle] = useState<string | undefined>(
    resolvedSearchParams.title
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <PageContainer scrollable>
        <div className='py-8 text-center text-xs text-muted-foreground'>
          Loading invoice editor...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <InvoiceForm
        initialContactId={resolvedSearchParams.contactId}
        initialQuotationId={resolvedSearchParams.quotationId}
        initialTitle={initialTitle}
      />
    </PageContainer>
  );
}

