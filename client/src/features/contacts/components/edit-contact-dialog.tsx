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
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Contact } from '../types/contact.types';
import { contactsApi } from '../api/contacts.api';
import { toast } from 'sonner';
import { IconLoader2 } from '@tabler/icons-react';

export function EditContactDialog({
  contact,
  open,
  onOpenChange,
  onSuccess,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Contact) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setCompany(contact.company || '');
      setIsClient(contact.isClient || false);
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    if (!name.trim()) {
      toast.error('Contact name is required');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await contactsApi.updateContact(contact.contactId, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        isClient,
      });

      toast.success(`Contact "${name}" updated`);
      onOpenChange(false);
      onSuccess(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update contact');
    } finally {
      setSubmitting(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact profile details and client relationship status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-contact-name'>
              Name <span className='text-rose-500'>*</span>
            </Label>
            <Input
              id='edit-contact-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-contact-company'>Company / Organization</Label>
            <Input
              id='edit-contact-company'
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-contact-email'>Email Address</Label>
              <Input
                id='edit-contact-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit-contact-phone'>Phone Number</Label>
              <Input
                id='edit-contact-phone'
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className='flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3'>
            <div className='space-y-0.5'>
              <Label htmlFor='edit-is-client' className='text-xs font-semibold cursor-pointer'>
                Paying Client Status
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Mark whether this contact represents an active paying client.
              </p>
            </div>
            <Switch
              id='edit-is-client'
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

