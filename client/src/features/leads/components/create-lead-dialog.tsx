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
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { leadsApi } from '../api/leads.api';
import { CreateLeadPayload, Lead, LeadSource } from '../types/lead.types';
import {
  createLeadSchema,
  CreateLeadFormValues,
} from '../schemas/lead.schema';
import { SOURCE_CONFIG } from './lead-status-badge';
import { toast } from 'sonner';
import {
  IconLoader2,
  IconPlus,
  IconUserPlus,
  IconUser,
  IconBuilding,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconCalendarEvent,
} from '@tabler/icons-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'CAD', symbol: '$', label: 'CAD ($)' },
  { code: 'AUD', symbol: '$', label: 'AUD ($)' },
];

const DEFAULT_FORM_VALUES: CreateLeadFormValues = {
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  source: LeadSource.WEBSITE,
  interestedService: '',
  estimatedBudget: '',
  currency: 'USD',
  description: '',
  nextFollowUpDate: '',
  followUpNotes: '',
};

export function CreateLeadDialog({
  open,
  onOpenChange,
  onSuccess,
  initialContact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (lead: Lead) => void;
  initialContact?: {
    contactId?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
  } | null;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onTouched',
  });

  const currencyValue = form.watch('currency') || 'USD';
  const selectedCurrencySymbol =
    CURRENCIES.find((c) => c.code === currencyValue)?.symbol || '$';

  useEffect(() => {
    if (open) {
      form.reset({
        ...DEFAULT_FORM_VALUES,
        name: initialContact?.name || '',
        company: initialContact?.company || '',
        email: initialContact?.email || '',
        phone: initialContact?.phone || '',
      });
    } else {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [initialContact, open, form]);

  const onSubmit = async (values: CreateLeadFormValues) => {
    setLoading(true);
    try {
      const payload: CreateLeadPayload = {
        name: values.name.trim(),
        title: values.title?.trim() || undefined,
        contactId: initialContact?.contactId || undefined,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        company: values.company?.trim() || undefined,
        source: values.source,
        interestedService: values.interestedService?.trim() || undefined,
        estimatedBudget:
          values.estimatedBudget && !isNaN(Number(values.estimatedBudget))
            ? Number(values.estimatedBudget)
            : undefined,
        currency: values.currency || 'USD',
        description: values.description?.trim() || undefined,
        nextFollowUpDate: values.nextFollowUpDate
          ? new Date(values.nextFollowUpDate).toISOString()
          : undefined,
        followUpNotes: values.followUpNotes?.trim() || undefined,
      };

      const created = await leadsApi.createLead(payload);
      toast.success('Lead captured successfully!');
      form.reset(DEFAULT_FORM_VALUES);
      onOpenChange(false);
      if (onSuccess) onSuccess(created);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to capture lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8'>
        {/* Header */}
        <DialogHeader className='space-y-2 pb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20'>
              <IconUserPlus className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                Capture New Lead
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                Add a prospect opportunity. Slimdesk automatically links a reusable contact and creates an initial timeline entry.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 pt-2'>
          {/* Section 1: Contact Information */}
          <div className='rounded-xl border border-border/50 bg-card/60 p-4 sm:p-5 space-y-4'>
            <div className='flex items-center gap-2 pb-1 border-b border-border/40'>
              <IconUser className='h-4 w-4 text-primary' />
              <h3 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
                Contact & Prospect Information
              </h3>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Contact / Business Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Contact or Business Name <span className='text-destructive'>*</span>
                    </FormLabel>
                    <div className='relative'>
                      <IconUser className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <FormControl>
                        <Input
                          placeholder='e.g. Acme Studio or Rajesh Sharma'
                          className='pl-9 h-10'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company / Organization */}
              <FormField
                control={form.control}
                name='company'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Company / Organization
                    </FormLabel>
                    <div className='relative'>
                      <IconBuilding className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <FormControl>
                        <Input
                          placeholder='e.g. Acme Studio Inc.'
                          className='pl-9 h-10'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Address */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Email Address
                    </FormLabel>
                    <div className='relative'>
                      <IconMail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='contact@acmestudio.com'
                          className='pl-9 h-10'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Phone Number
                    </FormLabel>
                    <div className='relative'>
                      <IconPhone className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <FormControl>
                        <Input
                          type='tel'
                          placeholder='+91 98765 43210'
                          className='pl-9 h-10'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 2: Opportunity & Deal Scope */}
          <div className='rounded-xl border border-border/50 bg-card/60 p-4 sm:p-5 space-y-4'>
            <div className='flex items-center gap-2 pb-1 border-b border-border/40'>
              <IconBriefcase className='h-4 w-4 text-primary' />
              <h3 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
                Opportunity & Project Scope
              </h3>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Opportunity Title */}
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Opportunity Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Website Redesign & SEO'
                        className='h-10'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interested Service */}
              <FormField
                control={form.control}
                name='interestedService'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Interested Service
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Full-Stack Web App, Brand Identity'
                        className='h-10'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={form.control}
                name='source'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Lead Acquisition Source
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger id='lead-source' className='h-10'>
                          <SelectValue placeholder='Select source' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SOURCE_CONFIG).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className='flex items-center gap-2'>
                                <Icon className='h-4 w-4 text-muted-foreground' />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Budget & Currency */}
              <FormField
                control={form.control}
                name='estimatedBudget'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Estimated Project Budget
                    </FormLabel>
                    <div className='flex gap-2.5'>
                      <Select
                        value={currencyValue}
                        onValueChange={(val) => form.setValue('currency', val, { shouldValidate: true })}
                      >
                        <SelectTrigger className='w-[110px] h-10 shrink-0 font-medium'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className='relative flex-1'>
                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground'>
                          {selectedCurrencySymbol}
                        </span>
                        <FormControl>
                          <Input
                            id='lead-budget'
                            type='number'
                            min='0'
                            step='100'
                            placeholder='25,000'
                            className='pl-8 h-10 font-medium tabular-nums'
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='space-y-1.5 pt-1'>
                  <FormLabel className='text-xs font-medium'>
                    Project Requirements & Inquiry Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id='lead-description'
                      rows={3}
                      placeholder='Add project brief, timeline expectations, tech preferences, or client requirements notes...'
                      className='resize-y'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 3: Initial Follow-up Reminder */}
          <div className='rounded-xl border border-border/50 bg-muted/20 p-4 sm:p-5 space-y-4'>
            <div className='flex items-center justify-between pb-1 border-b border-border/40'>
              <div className='flex items-center gap-2'>
                <IconCalendarEvent className='h-4 w-4 text-primary' />
                <h3 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
                  Initial Follow-up Reminder (Optional)
                </h3>
              </div>
              <span className='text-[11px] text-muted-foreground'>Never miss a prospect touchpoint</span>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Follow-up Due Date */}
              <FormField
                control={form.control}
                name='nextFollowUpDate'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Follow-up Due Date & Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        id='lead-followup-date'
                        type='datetime-local'
                        className='h-10'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Follow-up Notes */}
              <FormField
                control={form.control}
                name='followUpNotes'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-medium'>
                      Reminder Note
                    </FormLabel>
                    <FormControl>
                      <Input
                        id='lead-followup-notes'
                        placeholder='e.g. Call to discuss the quotation after partner review'
                        className='h-10'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Dialog Actions Footer */}
          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className='h-10 px-5'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='h-10 px-6 font-semibold shadow-xs'
            >
              {loading ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Capturing Lead...
                </>
              ) : (
                <>
                  <IconPlus className='mr-2 h-4 w-4 stroke-[2.5]' />
                  Capture Lead
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
