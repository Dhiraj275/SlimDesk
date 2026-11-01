'use client';

import { use, useEffect, useState } from 'react';
import PageContainer from '@/shared/components/layout/page-container';
import { leadsApi } from '@/features/leads/api/leads.api';
import { Lead } from '@/features/leads/types/lead.types';
import { LeadDetailsView } from '@/features/leads/components/lead-details-view';
import { Button } from '@/shared/components/ui/button';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';

export default function LeadDetailsPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const resolvedParams = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await leadsApi.getLeadById(resolvedParams.leadId);
        setLead(data);
      } catch (err: any) {
        setError(err?.message || 'Lead not found or could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [resolvedParams.leadId]);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground text-sm'>
          <IconLoader2 className='h-6 w-6 animate-spin text-primary' />
          <span>Loading lead details...</span>
        </div>
      </PageContainer>
    );
  }

  if (error || !lead) {
    return (
      <PageContainer>
        <div className='flex min-h-[350px] flex-col items-center justify-center gap-3 text-center'>
          <h2 className='text-lg font-bold text-foreground'>Unable to load lead</h2>
          <p className='text-sm text-muted-foreground max-w-sm'>{error}</p>
          <Button variant='outline' size='sm' asChild className='gap-1.5'>
            <Link href='/dashboard/leads'>
              <IconArrowLeft className='h-4 w-4' />
              <span>Back to Leads</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <LeadDetailsView initialLead={lead} />
    </PageContainer>
  );
}
