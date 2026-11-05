import { Lead } from '@/features/leads/types/lead.types';

export interface Contact {
  contactId: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  isClient: boolean;
  createdAt: string;
  updatedAt: string;
  leads?: Lead[];
}

export interface CreateContactPayload {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  isClient?: boolean;
}

export interface UpdateContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  isClient?: boolean;
}

export interface ContactMetrics {
  totalContacts: number;
  activeClients: number;
  prospects: number;
  totalDeals: number;
  totalValue: number;
}

