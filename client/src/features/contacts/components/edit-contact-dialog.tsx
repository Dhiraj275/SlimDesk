'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Contact } from '../types/contact.types';
import { contactsApi } from '../api/contacts.api';
import { contactSchema, ContactFormValues } from '../schemas/contact.schema';
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
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      isClient: false,
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (contact && open) {
      form.reset({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        isClient: contact.isClient || false,
      });
    }
  }, [contact, open, form]);

  const onSubmit = async (values: ContactFormValues) => {
    if (!contact) return;

    setSubmitting(true);
    try {
      const updated = await contactsApi.updateContact(contact.contactId, {
        name: values.name.trim(),
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        company: values.company?.trim() || undefined,
        isClient: values.isClient,
      });

      toast.success(`Contact "${values.name}" updated`);
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

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 pt-2'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel>
                  Name <span className='text-rose-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Acme Studio or Sarah Connor' {...field} />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='company'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel>Company / Organization</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g. Acme Studio Inc.'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='hello@example.com'
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type='tel'
                      placeholder='+1 (555) 000-0000'
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='isClient'
            render={({ field }) => (
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
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
