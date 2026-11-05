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
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { contactsApi } from '../api/contacts.api';
import { toast } from 'sonner';
import { IconLoader2 } from '@tabler/icons-react';

export function CreateContactDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setIsClient(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Contact name is required');
      return;
    }

    setSubmitting(true);
    try {
      await contactsApi.createContact({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        isClient,
      });

      toast.success(`Contact "${name}" created`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Save person or company contact details to link with sales leads and convert into paying clients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='contact-name'>
              Name <span className='text-rose-500'>*</span>
            </Label>
            <Input
              id='contact-name'
              placeholder='e.g. Acme Studio or Sarah Connor'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='contact-company'>Company / Organization</Label>
            <Input
              id='contact-company'
              placeholder='e.g. Acme Studio Inc.'
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='contact-email'>Email Address</Label>
              <Input
                id='contact-email'
                type='email'
                placeholder='hello@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='contact-phone'>Phone Number</Label>
              <Input
                id='contact-phone'
                type='tel'
                placeholder='+1 (555) 000-0000'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className='flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3'>
            <div className='space-y-0.5'>
              <Label htmlFor='is-client' className='text-xs font-semibold cursor-pointer'>
                Mark as Paying Client
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Enable if you already have an active contract or business relationship.
              </p>
            </div>
            <Switch
              id='is-client'
              checked={isClient}
              onCheckedChange={setIsClient}
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

