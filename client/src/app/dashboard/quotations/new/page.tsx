'use client';

import { use, useEffect, useState } from 'react';
import PageContainer from '@/shared/components/layout/page-container';
import { QuotationForm } from '@/features/quotations/components/quotation-builder/quotation-form';
import { leadsApi } from '@/features/leads/api/leads.api';
import { contactsApi } from '@/features/contacts/api/contacts.api';

export default function NewQuotationPage({
  searchParams,
}: {
  searchParams?: Promise<{
    leadId?: string;
    contactId?: string;
    title?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const [clientInfo, setClientInfo] = useState<any>(undefined);
  const [initialTitle, setInitialTitle] = useState<string | undefined>(
    resolvedSearchParams.title
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prefill = async () => {
      try {
        if (resolvedSearchParams.leadId) {
          const lead = await leadsApi.getLeadById(resolvedSearchParams.leadId);
          if (lead) {
            setInitialTitle(lead.title || resolvedSearchParams.title);
            setClientInfo({
              name: lead.name,
              company: lead.company || '',
              email: lead.email || '',
              phone: lead.phone || '',
            });
          }
        } else if (resolvedSearchParams.contactId) {
          const contact = await contactsApi.getContactById(
            resolvedSearchParams.contactId
          );
          if (contact) {
            setClientInfo({
              name: contact.name,
              company: contact.company || '',
              email: contact.email || '',
              phone: contact.phone || '',
            });
          }
        }
      } catch (err) {
        // If lookup fails, proceed with defaults
      } finally {
        setReady(true);
      }
    };

    prefill();
  }, [resolvedSearchParams.leadId, resolvedSearchParams.contactId]);

  if (!ready) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] items-center justify-center text-xs text-muted-foreground">
          Initializing quotation builder...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <QuotationForm
        initialLeadId={resolvedSearchParams.leadId}
        initialContactId={resolvedSearchParams.contactId}
        initialTitle={initialTitle}
        initialClientInfo={clientInfo}
      />
    </PageContainer>
  );
}
