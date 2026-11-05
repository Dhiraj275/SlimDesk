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
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUser,
  IconCheck,
  IconPlus,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconAddressBook,
} from '@tabler/icons-react';

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

export function ContactListView({
  contacts,
  onViewDetails,
  onEdit,
  onToggleClient,
  onDelete,
  onCreateLeadForContact,
  onNewContactClick,
}: {
  contacts: Contact[];
  onViewDetails: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onToggleClient: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onCreateLeadForContact?: (contact: Contact) => void;
  onNewContactClick: () => void;
}) {
  if (contacts.length === 0) {
    return (
      <div className='flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-8 text-center bg-card/50'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <IconAddressBook className='h-6 w-6' />
        </div>
        <h3 className='mt-3 text-base font-semibold text-foreground'>
          No contacts found
        </h3>
        <p className='mt-1 max-w-sm text-xs text-muted-foreground'>
          Add people and organizations you work with. When they agree to a proposal, they can be converted to clients.
        </p>
        <Button
          size='sm'
          onClick={onNewContactClick}
          className='mt-4 h-8 gap-1.5 text-xs font-semibold'
        >
          <IconPlus className='h-3.5 w-3.5' />
          Add First Contact
        </Button>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-border/50 bg-card overflow-hidden shadow-xs'>
      <div className='overflow-x-auto custom-scrollbar'>
        <table className='w-full text-left text-xs'>
          <thead className='border-b border-border/40 bg-muted/40 text-muted-foreground uppercase tracking-wider text-[11px] font-semibold'>
            <tr>
              <th className='py-3 pl-4 pr-3'>Contact</th>
              <th className='py-3 px-3'>Company</th>
              <th className='py-3 px-3'>Email</th>
              <th className='py-3 px-3'>Phone</th>
              <th className='py-3 px-3'>Status</th>
              <th className='py-3 px-3'>Linked Deals</th>
              <th className='py-3 px-3'>Added Date</th>
              <th className='py-3 pr-4 pl-3 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40'>
            {contacts.map((contact) => {
              const initials = getInitials(contact.name);
              const avatarColor = getAvatarColor(contact.name);
              const leads = contact.leads || [];
              const dealsCount = leads.length;
              const totalValue = leads.reduce(
                (acc, l) => acc + (Number(l.estimatedBudget) || 0),
                0
              );
              const dateStr = new Date(contact.createdAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', year: 'numeric' }
              );

              return (
                <tr
                  key={contact.contactId}
                  className='hover:bg-muted/30 transition-colors group'
                >
                  {/* Contact Avatar + Name */}
                  <td className='py-3 pl-4 pr-3 min-w-[180px]'>
                    <div className='flex items-center gap-2.5'>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${avatarColor}`}
                      >
                        {initials}
                      </div>
                      <button
                        type='button'
                        onClick={() => onViewDetails(contact)}
                        className='font-semibold text-foreground hover:underline text-left truncate'
                      >
                        {contact.name}
                      </button>
                    </div>
                  </td>

                  {/* Company */}
                  <td className='py-3 px-3 text-muted-foreground min-w-[140px] truncate'>
                    {contact.company || <span className='italic opacity-50'>—</span>}
                  </td>

                  {/* Email */}
                  <td className='py-3 px-3 min-w-[160px] truncate'>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className='flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors'
                      >
                        <IconMail className='h-3.5 w-3.5 opacity-60' />
                        <span className='truncate'>{contact.email}</span>
                      </a>
                    ) : (
                      <span className='text-muted-foreground/50 italic'>—</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className='py-3 px-3 min-w-[130px] truncate'>
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className='flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors'
                      >
                        <IconPhone className='h-3.5 w-3.5 opacity-60' />
                        <span className='truncate'>{contact.phone}</span>
                      </a>
                    ) : (
                      <span className='text-muted-foreground/50 italic'>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className='py-3 px-3 whitespace-nowrap'>
                    <ContactStatusBadge isClient={contact.isClient} />
                  </td>

                  {/* Linked Deals */}
                  <td className='py-3 px-3 whitespace-nowrap'>
                    {dealsCount > 0 ? (
                      <div className='flex items-center gap-1 text-foreground font-medium'>
                        <IconBriefcase className='h-3.5 w-3.5 text-primary opacity-80' />
                        <span>
                          {dealsCount} {dealsCount === 1 ? 'deal' : 'deals'}
                        </span>
                        {totalValue > 0 && (
                          <span className='text-muted-foreground font-normal'>
                            (${totalValue.toLocaleString()})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className='text-muted-foreground/60 italic'>0 deals</span>
                    )}
                  </td>

                  {/* Added Date */}
                  <td className='py-3 px-3 text-muted-foreground whitespace-nowrap'>
                    {dateStr}
                  </td>

                  {/* Actions Dropdown */}
                  <td className='py-3 pr-4 pl-3 text-right whitespace-nowrap'>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

