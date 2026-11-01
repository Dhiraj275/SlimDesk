'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { leadsApi } from '../api/leads.api';
import { Lead } from '../types/lead.types';
import { toast } from 'sonner';
import { IconCheck, IconLoader2, IconSparkles } from '@tabler/icons-react';

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (converted: Lead) => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!lead) return null;

  const handleConvert = async () => {
    setLoading(true);
    try {
      const converted = await leadsApi.convertLead(lead.leadId);
      toast.success(`${lead.name} has been converted into a paying client!`);
      onOpenChange(false);
      if (onSuccess) onSuccess(converted);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to convert lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
            <IconSparkles className='h-5 w-5' />
          </div>
          <DialogTitle className='text-lg font-bold'>Convert to Paying Client</DialogTitle>
          <DialogDescription>
            You are about to mark this opportunity as won.
          </DialogDescription>
        </DialogHeader>

        <div className='rounded-lg border border-border/50 bg-muted/20 p-3.5 space-y-2 text-sm text-muted-foreground'>
          <p>
            <strong className='text-foreground'>{lead.name}</strong> ({lead.title}) will become an active client.
          </p>
          <ul className='list-disc pl-5 text-xs space-y-1 text-muted-foreground'>
            <li>The associated contact record will be marked as an active client.</li>
            <li>All chronological activity timeline entries and notes remain preserved.</li>
            <li>Stage will transition to <span className='font-semibold text-emerald-600 dark:text-emerald-400'>Converted</span>.</li>
          </ul>
        </div>

        <DialogFooter className='pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={loading}
            className='bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500'
          >
            {loading ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Converting...
              </>
            ) : (
              <>
                <IconCheck className='mr-2 h-4 w-4 stroke-[2.5]' />
                Confirm Conversion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
