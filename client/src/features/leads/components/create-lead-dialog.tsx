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
import { CreateLeadPayload, Lead, LeadSource } from '../types/lead.types';
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
  IconSparkles,
  IconCalendarEvent,
  IconNotes,
} from '@tabler/icons-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'CAD', symbol: '$', label: 'CAD ($)' },
  { code: 'AUD', symbol: '$', label: 'AUD ($)' },
];

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
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState<LeadSource>(LeadSource.WEBSITE);
  const [interestedService, setInterestedService] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  useEffect(() => {
    if (initialContact && open) {
      setName(initialContact.name || '');
      setEmail(initialContact.email || '');
      setPhone(initialContact.phone || '');
      setCompany(initialContact.company || '');
    }
  }, [initialContact, open]);

  const resetForm = () => {
    setName('');
    setTitle('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSource(LeadSource.WEBSITE);
    setInterestedService('');
    setEstimatedBudget('');
    setCurrency('USD');
    setDescription('');
    setNextFollowUpDate('');
    setFollowUpNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Contact or business name is required');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateLeadPayload = {
        name: name.trim(),
        title: title.trim() || undefined,
        contactId: initialContact?.contactId || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        source,
        interestedService: interestedService.trim() || undefined,
        estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
        currency,
        description: description.trim() || undefined,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
        followUpNotes: followUpNotes.trim() || undefined,
      };

      const created = await leadsApi.createLead(payload);
      toast.success('Lead captured successfully!');
      resetForm();
      onOpenChange(false);
      if (onSuccess) onSuccess(created);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to capture lead');
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrencySymbol =
    CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

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

        <form onSubmit={handleSubmit} className='space-y-6 pt-2'>
          {/* Section 1: Contact Information */}
          <div className='rounded-xl border border-border/50 bg-card/60 p-4 sm:p-5 space-y-4'>
            <div className='flex items-center gap-2 pb-1 border-b border-border/40'>
              <IconUser className='h-4 w-4 text-primary' />
              <h3 className='text-xs font-semibold uppercase tracking-wider text-foreground'>
                Contact & Prospect Information
              </h3>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='lead-name' className='text-xs font-medium'>
                  Contact or Business Name <span className='text-destructive'>*</span>
                </Label>
                <div className='relative'>
                  <IconUser className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='lead-name'
                    placeholder='e.g. Acme Studio or Sarah Connor'
                    className='pl-9 h-10'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-company' className='text-xs font-medium'>
                  Company / Organization
                </Label>
                <div className='relative'>
                  <IconBuilding className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='lead-company'
                    placeholder='e.g. Acme Studio Inc.'
                    className='pl-9 h-10'
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-email' className='text-xs font-medium'>
                  Email Address
                </Label>
                <div className='relative'>
                  <IconMail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='lead-email'
                    type='email'
                    placeholder='contact@acmestudio.com'
                    className='pl-9 h-10'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-phone' className='text-xs font-medium'>
                  Phone Number
                </Label>
                <div className='relative'>
                  <IconPhone className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='lead-phone'
                    type='tel'
                    placeholder='+1 (555) 012-3456'
                    className='pl-9 h-10'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
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
              <div className='space-y-1.5'>
                <Label htmlFor='lead-title' className='text-xs font-medium'>
                  Opportunity Title
                </Label>
                <Input
                  id='lead-title'
                  placeholder='e.g. Website Redesign & SEO'
                  className='h-10'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-service' className='text-xs font-medium'>
                  Interested Service
                </Label>
                <Input
                  id='lead-service'
                  placeholder='e.g. Full-Stack Web App, Brand Identity'
                  className='h-10'
                  value={interestedService}
                  onChange={(e) => setInterestedService(e.target.value)}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-source' className='text-xs font-medium'>
                  Lead Acquisition Source
                </Label>
                <Select
                  value={source}
                  onValueChange={(val) => setSource(val as LeadSource)}
                >
                  <SelectTrigger id='lead-source' className='h-10'>
                    <SelectValue placeholder='Select source' />
                  </SelectTrigger>
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
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-budget' className='text-xs font-medium'>
                  Estimated Project Budget
                </Label>
                <div className='flex gap-2.5'>
                  <Select value={currency} onValueChange={setCurrency}>
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
                    <Input
                      id='lead-budget'
                      type='number'
                      min='0'
                      step='100'
                      placeholder='25,000'
                      className='pl-8 h-10 font-medium tabular-nums'
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-1.5 pt-1'>
              <Label htmlFor='lead-description' className='text-xs font-medium'>
                Project Requirements & Inquiry Notes
              </Label>
              <Textarea
                id='lead-description'
                rows={3}
                placeholder='Add project brief, timeline expectations, tech preferences, or client requirements notes...'
                className='resize-y'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
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
              <div className='space-y-1.5'>
                <Label htmlFor='lead-followup-date' className='text-xs font-medium'>
                  Follow-up Due Date & Time
                </Label>
                <Input
                  id='lead-followup-date'
                  type='datetime-local'
                  className='h-10'
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='lead-followup-notes' className='text-xs font-medium'>
                  Reminder Note
                </Label>
                <Input
                  id='lead-followup-notes'
                  placeholder='e.g. Call to discuss the quotation after partner review'
                  className='h-10'
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                />
              </div>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
