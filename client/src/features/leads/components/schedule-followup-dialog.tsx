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
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { leadsApi } from '../api/leads.api';
import { Lead, LeadFollowUp } from '../types/lead.types';
import { toast } from 'sonner';
import { IconCalendarPlus, IconLoader2 } from '@tabler/icons-react';

export function ScheduleFollowUpDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (followUp: LeadFollowUp) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) {
      toast.error('Follow-up due date is required');
      return;
    }

    setLoading(true);
    try {
      const created = await leadsApi.addFollowUp(lead.leadId, {
        dueDate: new Date(dueDate).toISOString(),
        notes: notes.trim() || undefined,
      });

      toast.success('Follow-up scheduled successfully');
      setDueDate('');
      setNotes('');
      onOpenChange(false);
      if (onSuccess) onSuccess(created);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to schedule follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <IconCalendarPlus className='h-5 w-5' />
          </div>
          <DialogTitle className='text-lg font-bold'>Schedule Follow-up</DialogTitle>
          <DialogDescription>
            Set a reminder to reach out to <strong className='text-foreground'>{lead.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='followup-datetime'>
              Due Date & Time <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='followup-datetime'
              type='datetime-local'
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='followup-note'>Context / Action Notes</Label>
            <Textarea
              id='followup-note'
              rows={3}
              placeholder='e.g. Call to discuss the quotation with partner before contract signature...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                  Scheduling...
                </>
              ) : (
                'Save Follow-up'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
