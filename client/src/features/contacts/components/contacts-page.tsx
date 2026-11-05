'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/shared/components/layout/page-container';
import { contactsApi } from '../api/contacts.api';
import { Contact, ContactMetrics } from '../types/contact.types';
import { ContactsOverviewCards } from './contacts-overview-cards';
import { ContactFilters } from './contact-filters';
import { ContactCard } from './contact-card';
import { ContactListView } from './contact-list-view';
import { CreateContactDialog } from './create-contact-dialog';
import { EditContactDialog } from './edit-contact-dialog';
import { ContactDetailsDialog } from './contact-details-dialog';
import { CreateLeadDialog } from '@/features/leads/components/create-lead-dialog';
import { toast } from 'sonner';
import { IconLoader2, IconAddressBook, IconPlus } from '@tabler/icons-react';
import { Button } from '@/shared/components/ui/button';

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clients' | 'prospects'>('all');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createLeadDialogOpen, setCreateLeadDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await contactsApi.getContacts();
      setContacts(data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Compute live metrics
  const metrics: ContactMetrics = useMemo(() => {
    let activeClients = 0;
    let prospects = 0;
    let totalDeals = 0;
    let totalValue = 0;

    contacts.forEach((c) => {
      if (c.isClient) {
        activeClients += 1;
      } else {
        prospects += 1;
      }

      if (c.leads && Array.isArray(c.leads)) {
        totalDeals += c.leads.length;
        c.leads.forEach((l) => {
          totalValue += Number(l.estimatedBudget) || 0;
        });
      }
    });

    return {
      totalContacts: contacts.length,
      activeClients,
      prospects,
      totalDeals,
      totalValue,
    };
  }, [contacts]);

  // Tab badge counts
  const counts = useMemo(() => {
    return {
      all: contacts.length,
      clients: metrics.activeClients,
      prospects: metrics.prospects,
    };
  }, [contacts.length, metrics.activeClients, metrics.prospects]);

  // Filter contacts based on search & client status
  const displayedContacts = useMemo(() => {
    let result = contacts;

    // Filter by client status
    if (statusFilter === 'clients') {
      result = result.filter((c) => c.isClient);
    } else if (statusFilter === 'prospects') {
      result = result.filter((c) => !c.isClient);
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(query);
        const companyMatch = c.company?.toLowerCase().includes(query);
        const emailMatch = c.email?.toLowerCase().includes(query);
        const phoneMatch = c.phone?.toLowerCase().includes(query);
        return nameMatch || companyMatch || emailMatch || phoneMatch;
      });
    }

    return result;
  }, [contacts, statusFilter, search]);

  // Metric cards click handler
  const handleMetricFilterClick = (key: string) => {
    if (activeMetricFilter === key) {
      setActiveMetricFilter(null);
      setStatusFilter('all');
      return;
    }

    setActiveMetricFilter(key);
    if (key === 'clients') {
      setStatusFilter('clients');
    } else if (key === 'prospects') {
      setStatusFilter('prospects');
    } else {
      setStatusFilter('all');
    }
  };

  // Toggle client status
  const handleToggleClient = async (contact: Contact) => {
    try {
      const updated = await contactsApi.toggleClientStatus(
        contact.contactId,
        contact.isClient
      );
      toast.success(
        updated.isClient
          ? `Marked "${contact.name}" as paying client`
          : `Reverted "${contact.name}" to prospect`
      );
      setContacts((prev) =>
        prev.map((c) =>
          c.contactId === contact.contactId ? { ...c, isClient: updated.isClient } : c
        )
      );
      if (selectedContact?.contactId === contact.contactId) {
        setSelectedContact((prev) =>
          prev ? { ...prev, isClient: updated.isClient } : null
        );
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update client status');
    }
  };

  // Delete contact
  const handleDeleteContact = async (contact: Contact) => {
    if (
      !window.confirm(
        `Are you sure you want to delete contact "${contact.name}"? Associated leads will remain intact.`
      )
    ) {
      return;
    }

    try {
      await contactsApi.deleteContact(contact.contactId);
      toast.success(`Contact "${contact.name}" deleted`);
      setContacts((prev) => prev.filter((c) => c.contactId !== contact.contactId));
      if (detailsDialogOpen && selectedContact?.contactId === contact.contactId) {
        setDetailsDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete contact');
    }
  };

  // View Details
  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailsDialogOpen(true);
  };

  // Edit contact
  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  // Create lead for contact
  const handleCreateLeadForContact = (contact: Contact) => {
    setSelectedContact(contact);
    setCreateLeadDialogOpen(true);
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6 min-w-0 w-full max-w-full overflow-x-hidden'>
        {/* Header */}
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Contacts & Clients
            </h1>
            <p className='text-sm text-muted-foreground'>
              Maintain reusable person and organization records, track linked deals, and manage paying client relationships.
            </p>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <ContactsOverviewCards
          metrics={metrics}
          activeFilter={activeMetricFilter}
          onFilterClick={handleMetricFilterClick}
        />

        {/* Toolbar & Filters */}
        <ContactFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setActiveMetricFilter(null);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewContactClick={() => setCreateDialogOpen(true)}
          counts={counts}
        />

        {/* Main Content: Loading, Grid, or Table */}
        {loading ? (
          <div className='flex min-h-[300px] items-center justify-center'>
            <div className='flex flex-col items-center gap-2 text-muted-foreground text-sm'>
              <IconLoader2 className='h-6 w-6 animate-spin text-primary' />
              <span>Loading contacts...</span>
            </div>
          </div>
        ) : displayedContacts.length === 0 ? (
          <div className='flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-8 text-center bg-card/50'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <IconAddressBook className='h-6 w-6' />
            </div>
            <h3 className='mt-3 text-base font-semibold text-foreground'>
              {search || statusFilter !== 'all' ? 'No matching contacts' : 'No contacts yet'}
            </h3>
            <p className='mt-1 max-w-sm text-xs text-muted-foreground'>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search query or clear the active filter.'
                : 'Start organizing your freelance network. Add potential clients and convert them when deals are won.'}
            </p>
            {search || statusFilter !== 'all' ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className='mt-4 h-8 text-xs'
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                size='sm'
                onClick={() => setCreateDialogOpen(true)}
                className='mt-4 h-8 gap-1.5 text-xs font-semibold'
              >
                <IconPlus className='h-3.5 w-3.5' />
                Add First Contact
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0'>
            {displayedContacts.map((contact) => (
              <ContactCard
                key={contact.contactId}
                contact={contact}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onToggleClient={handleToggleClient}
                onDelete={handleDeleteContact}
                onCreateLeadForContact={handleCreateLeadForContact}
              />
            ))}
          </div>
        ) : (
          <ContactListView
            contacts={displayedContacts}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onToggleClient={handleToggleClient}
            onDelete={handleDeleteContact}
            onCreateLeadForContact={handleCreateLeadForContact}
            onNewContactClick={() => setCreateDialogOpen(true)}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateContactDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => fetchContacts()}
      />

      <EditContactDialog
        contact={selectedContact}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={(updated) => {
          setContacts((prev) =>
            prev.map((c) => (c.contactId === updated.contactId ? { ...c, ...updated } : c))
          );
          if (selectedContact?.contactId === updated.contactId) {
            setSelectedContact((prev) => (prev ? { ...prev, ...updated } : null));
          }
        }}
      />

      <ContactDetailsDialog
        contact={selectedContact}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onEdit={handleEdit}
        onToggleClient={handleToggleClient}
        onDelete={handleDeleteContact}
        onCreateLeadForContact={handleCreateLeadForContact}
      />

      <CreateLeadDialog
        open={createLeadDialogOpen}
        onOpenChange={setCreateLeadDialogOpen}
        initialContact={selectedContact}
        onSuccess={() => fetchContacts()}
      />
    </PageContainer>
  );
}

