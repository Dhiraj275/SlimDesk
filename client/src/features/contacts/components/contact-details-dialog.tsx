'use client';

import { Contact } from '../types/contact.types';
import { ContactStatusBadge } from './contact-status-badge';
import { LeadStatusBadge } from '@/features/leads/components/lead-status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconCopy,
  IconEdit,
  IconPlus,
  IconExternalLink,
  IconBriefcase,
  IconCheck,
  IconUser,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { toast } from 'sonner';

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function ContactDetailsDialog({
  contact,
  open,
  onOpenChange,
  onEdit,
  onToggleClient,
  onDelete,
  onCreateLeadForContact,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (contact: Contact) => void;
  onToggleClient: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onCreateLeadForContact?: (contact: Contact) => void;
}) {
  if (!contact) return null;

  const initials = getInitials(contact.name);
  const avatarColor = getAvatarColor(contact.name);
  const leads = contact.leads || [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const createdDate = new Date(contact.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl p-5 sm:p-6 gap-5'>
        {/* Header with breathing room for the absolute close X button */}
        <DialogHeader className='flex flex-row items-center justify-between pb-3.5 border-b border-border/50 gap-3 pr-8'>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-2xs ${avatarColor}`}
            >
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <DialogTitle className='text-base font-bold text-foreground truncate'>
                  {contact.name}
                </DialogTitle>
                <ContactStatusBadge isClient={contact.isClient} />
              </div>
              {contact.company ? (
                <div className='flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate'>
                  <IconBuilding className='h-3 w-3 shrink-0 opacity-70' />
                  <span className='truncate'>{contact.company}</span>
                </div>
              ) : (
                <p className='text-xs text-muted-foreground/60 italic mt-0.5'>No company</p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onEdit(contact)}
              className='h-7.5 px-2.5 text-xs'
            >
              <IconEdit className='mr-1.5 h-3.5 w-3.5' />
              Edit
            </Button>
            <Button
              variant={contact.isClient ? 'outline' : 'default'}
              size='sm'
              onClick={() => onToggleClient(contact)}
              className='h-7.5 px-2.5 text-xs font-medium'
            >
              {contact.isClient ? (
                <>
                  <IconUser className='mr-1.5 h-3.5 w-3.5' />
                  Set Prospect
                </>
              ) : (
                <>
                  <IconCheck className='mr-1.5 h-3.5 w-3.5' />
                  Mark Client
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Communication Info Bars */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
          {/* Email */}
          <div className='flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs min-w-0'>
            <div className='flex items-center gap-2 min-w-0 flex-1 mr-1'>
              <IconMail className='h-4 w-4 text-muted-foreground shrink-0 opacity-70' />
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className='text-foreground hover:underline truncate font-medium'
                  title={contact.email}
                >
                  {contact.email}
                </a>
              ) : (
                <span className='text-muted-foreground/60 italic'>No email</span>
              )}
            </div>
            {contact.email && (
              <button
                type='button'
                onClick={() => handleCopy(contact.email!, 'Email')}
                className='text-muted-foreground hover:text-foreground p-0.5 shrink-0 transition-colors'
                title='Copy email'
              >
                <IconCopy className='h-3.5 w-3.5' />
              </button>
            )}
          </div>

          {/* Phone */}
          <div className='flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs min-w-0'>
            <div className='flex items-center gap-2 min-w-0 flex-1 mr-1'>
              <IconPhone className='h-4 w-4 text-muted-foreground shrink-0 opacity-70' />
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className='text-foreground hover:underline truncate font-medium'
                  title={contact.phone}
                >
                  {contact.phone}
                </a>
              ) : (
                <span className='text-muted-foreground/60 italic'>No phone</span>
              )}
            </div>
            {contact.phone && (
              <button
                type='button'
                onClick={() => handleCopy(contact.phone!, 'Phone')}
                className='text-muted-foreground hover:text-foreground p-0.5 shrink-0 transition-colors'
                title='Copy phone'
              >
                <IconCopy className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Associated Leads / Deals Section */}
        <div className='space-y-2.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IconBriefcase className='h-4 w-4 text-primary' />
              <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Deals & Opportunities ({leads.length})
              </h4>
            </div>
            {onCreateLeadForContact && (
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onCreateLeadForContact(contact)}
                className='h-7 gap-1 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10'
              >
                <IconPlus className='h-3.5 w-3.5' />
                New Deal
              </Button>
            )}
          </div>

          {leads.length === 0 ? (
            <div className='flex items-center justify-between rounded-lg border border-dashed border-border/70 px-3.5 py-3 bg-muted/10 text-xs'>
              <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
                <IconBriefcase className='h-4 w-4 opacity-50 shrink-0' />
                <span className='truncate'>No deals created yet for this contact</span>
              </div>
              {onCreateLeadForContact && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onCreateLeadForContact(contact)}
                  className='h-6.5 gap-1 px-2 text-xs shrink-0 ml-2'
                >
                  <IconPlus className='h-3 w-3' />
                  Add Deal
                </Button>
              )}
            </div>
          ) : (
            <div className='max-h-52 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar'>
              {leads.map((lead) => (
                <div
                  key={lead.leadId}
                  className='flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-3 py-2 hover:border-border transition-colors text-xs'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-foreground truncate'>
                        {lead.title}
                      </span>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <div className='mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground'>
                      {lead.estimatedBudget && (
                        <span className='font-medium text-foreground'>
                          {lead.currency} {Number(lead.estimatedBudget).toLocaleString()}
                        </span>
                      )}
                      {lead.interestedService && (
                        <span className='truncate opacity-80'>· {lead.interestedService}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/leads/${lead.leadId}`}
                    onClick={() => onOpenChange(false)}
                    className='inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0'
                  >
                    <span>View</span>
                    <IconExternalLink className='h-3 w-3' />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Metadata & Delete */}
        <div className='flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground'>
          <span>Added on {createdDate}</span>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(contact)}
            className='h-7 px-2 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-600'
          >
            <IconTrash className='mr-1 h-3.5 w-3.5' />
            Delete Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
