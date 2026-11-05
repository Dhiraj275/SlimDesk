'use client';

import { Contact } from '../types/contact.types';
import { ContactStatusBadge } from './contact-status-badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconBriefcase,
  IconPlus,
  IconCheck,
  IconUser,
  IconCopy,
} from '@tabler/icons-react';
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
    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function ContactCard({
  contact,
  onViewDetails,
  onEdit,
  onToggleClient,
  onDelete,
  onCreateLeadForContact,
}: {
  contact: Contact;
  onViewDetails: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onToggleClient: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onCreateLeadForContact?: (contact: Contact) => void;
}) {
  const initials = getInitials(contact.name);
  const avatarColor = getAvatarColor(contact.name);

  const leads = contact.leads || [];
  const dealsCount = leads.length;
  const totalValue = leads.reduce((acc, lead) => {
    const val = Number(lead.estimatedBudget) || 0;
    return acc + val;
  }, 0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className='group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs shadow-xs'>
      {/* Top Section */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3 min-w-0'>
          {/* Avatar with initials */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold tracking-tight shadow-2xs ${avatarColor}`}
          >
            {initials}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h3
                onClick={() => onViewDetails(contact)}
                className='font-semibold text-foreground text-sm truncate cursor-pointer hover:underline'
              >
                {contact.name}
              </h3>
            </div>
            {contact.company ? (
              <div className='flex items-center gap-1 text-xs text-muted-foreground truncate mt-0.5'>
                <IconBuilding className='h-3 w-3 shrink-0 opacity-70' />
                <span className='truncate'>{contact.company}</span>
              </div>
            ) : (
              <p className='text-xs text-muted-foreground/60 italic mt-0.5'>No company</p>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className='flex items-center gap-1.5 shrink-0'>
          <ContactStatusBadge isClient={contact.isClient} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-muted-foreground hover:text-foreground'
              >
                <IconDotsVertical className='h-3.5 w-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 text-xs'>
              <DropdownMenuItem onClick={() => onViewDetails(contact)}>
                <IconUser className='mr-2 h-3.5 w-3.5' />
                View Profile & Deals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(contact)}>
                <IconEdit className='mr-2 h-3.5 w-3.5' />
                Edit Contact
              </DropdownMenuItem>
              {onCreateLeadForContact && (
                <DropdownMenuItem onClick={() => onCreateLeadForContact(contact)}>
                  <IconPlus className='mr-2 h-3.5 w-3.5 text-primary' />
                  Create Opportunity
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onToggleClient(contact)}>
                <IconCheck className='mr-2 h-3.5 w-3.5' />
                {contact.isClient ? 'Revert to Prospect' : 'Mark as Client'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(contact)}
                className='text-rose-600 dark:text-rose-400 focus:text-rose-600'
              >
                <IconTrash className='mr-2 h-3.5 w-3.5' />
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Middle: Contact Channels */}
      <div className='mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3'>
        {contact.email ? (
          <div className='flex items-center justify-between group/link min-w-0'>
            <a
              href={`mailto:${contact.email}`}
              className='flex items-center gap-2 truncate hover:text-foreground transition-colors'
            >
              <IconMail className='h-3.5 w-3.5 shrink-0 opacity-70' />
              <span className='truncate'>{contact.email}</span>
            </a>
            <button
              type='button'
              onClick={() => handleCopy(contact.email!, 'Email')}
              className='opacity-0 group-hover/link:opacity-100 hover:text-foreground transition-opacity p-0.5'
              title='Copy email'
            >
              <IconCopy className='h-3 w-3' />
            </button>
          </div>
        ) : (
          <div className='flex items-center gap-2 text-muted-foreground/50 italic'>
            <IconMail className='h-3.5 w-3.5 shrink-0 opacity-40' />
            <span>No email listed</span>
          </div>
        )}

        {contact.phone ? (
          <div className='flex items-center justify-between group/link min-w-0'>
            <a
              href={`tel:${contact.phone}`}
              className='flex items-center gap-2 truncate hover:text-foreground transition-colors'
            >
              <IconPhone className='h-3.5 w-3.5 shrink-0 opacity-70' />
              <span className='truncate'>{contact.phone}</span>
            </a>
            <button
              type='button'
              onClick={() => handleCopy(contact.phone!, 'Phone')}
              className='opacity-0 group-hover/link:opacity-100 hover:text-foreground transition-opacity p-0.5'
              title='Copy phone'
            >
              <IconCopy className='h-3 w-3' />
            </button>
          </div>
        ) : (
          <div className='flex items-center gap-2 text-muted-foreground/50 italic'>
            <IconPhone className='h-3.5 w-3.5 shrink-0 opacity-40' />
            <span>No phone listed</span>
          </div>
        )}
      </div>

      {/* Bottom: Linked Deals Badge & Action Footer */}
      <div className='mt-4 flex items-center justify-between border-t border-border/40 pt-3'>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <IconBriefcase className='h-3.5 w-3.5 opacity-70 text-primary' />
          {dealsCount > 0 ? (
            <span className='font-medium text-foreground'>
              {dealsCount} {dealsCount === 1 ? 'deal' : 'deals'}
              {totalValue > 0 && (
                <span className='text-muted-foreground font-normal'>
                  {' '}· ${totalValue.toLocaleString()}
                </span>
              )}
            </span>
          ) : (
            <span className='text-muted-foreground/70'>No deals yet</span>
          )}
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => onViewDetails(contact)}
          className='h-7 px-2.5 text-xs font-medium text-foreground hover:bg-muted'
        >
          View Details →
        </Button>
      </div>
    </div>
  );
}

