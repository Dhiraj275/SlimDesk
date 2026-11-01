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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { leadsApi } from '../api/leads.api';
import { ActivityType, Lead, LeadActivity } from '../types/lead.types';
import { toast } from 'sonner';
import {
  IconPhone,
  IconMail,
  IconCalendarEvent,
  IconNote,
  IconFileInvoice,
  IconLoader2,
} from '@tabler/icons-react';

const ACTIVITY_OPTIONS: {
  type: ActivityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: ActivityType.CALL, label: 'Call Log', icon: IconPhone },
  { type: ActivityType.EMAIL, label: 'Email Interaction', icon: IconMail },
  { type: ActivityType.MEETING, label: 'Meeting', icon: IconCalendarEvent },
  { type: ActivityType.NOTE, label: 'Internal Note', icon: IconNote },
  { type: ActivityType.QUOTATION, label: 'Quotation / Scope Note', icon: IconFileInvoice },
];

export function AddActivityDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (activity: LeadActivity) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ActivityType>(ActivityType.CALL);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Activity title or summary is required');
      return;
    }

    setLoading(true);
    try {
      const created = await leadsApi.addActivity(lead.leadId, {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      toast.success('Activity logged to timeline');
      setTitle('');
      setDescription('');
      onOpenChange(false);
      if (onSuccess) onSuccess(created);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Log Interaction</DialogTitle>
          <DialogDescription>
            Record communication or progress with <strong className='text-foreground'>{lead.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='activity-type'>Activity Type</Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as ActivityType)}
            >
              <SelectTrigger id='activity-type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((item) => (
                  <SelectItem key={item.type} value={item.type}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='activity-title'>
              Summary Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='activity-title'
              placeholder='e.g. Discussed budget constraints with CTO'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='activity-desc'>Details & Notes</Label>
            <Textarea
              id='activity-desc'
              rows={3}
              placeholder='Key takeaways, next deliverables, or client feedback...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  Logging...
                </>
              ) : (
                'Save to Timeline'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
