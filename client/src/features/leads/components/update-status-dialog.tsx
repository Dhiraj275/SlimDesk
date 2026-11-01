'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { leadsApi } from '../api/leads.api';
import { Lead, LeadStatus } from '../types/lead.types';
import { STATUS_CONFIG } from './lead-status-badge';
import { toast } from 'sonner';
import { IconLoader2 } from '@tabler/icons-react';

export function UpdateStatusDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: Lead) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(lead?.status || LeadStatus.NEW);
  const [lostReason, setLostReason] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setLostReason(lead.lostReason || '');
      setNote('');
    }
  }, [lead, open]);

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await leadsApi.updateStatus(lead.leadId, {
        status,
        lostReason: status === LeadStatus.LOST ? lostReason.trim() : undefined,
        note: note.trim() || undefined,
      });

      toast.success(`Pipeline stage updated to ${STATUS_CONFIG[status].label}`);
      onOpenChange(false);
      if (onSuccess) onSuccess(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update pipeline status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Update Pipeline Stage</DialogTitle>
          <DialogDescription>
            Move <span className='font-semibold text-foreground'>{lead.name}</span> across your sales pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='status-select'>Pipeline Stage</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as LeadStatus)}
            >
              <SelectTrigger id='status-select'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === LeadStatus.LOST && (
            <div className='space-y-1.5'>
              <Label htmlFor='lost-reason'>
                Reason for Lost Opportunity <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='lost-reason'
                rows={2}
                placeholder='e.g. Budget cut, delayed timeline, or chose in-house team'
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                required
              />
            </div>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='status-note'>Activity Note (Optional)</Label>
            <Textarea
              id='status-note'
              rows={2}
              placeholder='Add context on why the stage was advanced...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Stage'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
