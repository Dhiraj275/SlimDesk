import { api } from '@/shared/utils/api-client';
import {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact.types';

export const contactsApi = {
  getContacts: async (isClient?: boolean): Promise<Contact[]> => {
    const params = typeof isClient === 'boolean' ? { isClient } : undefined;
    return await api.get<Contact[]>('/contacts', params);
  },

  getContactById: async (contactId: string): Promise<Contact> => {
    return await api.get<Contact>(`/contacts/${contactId}`);
  },

  createContact: async (payload: CreateContactPayload): Promise<Contact> => {
    return await api.post<Contact>('/contacts', payload);
  },

  updateContact: async (
    contactId: string,
    payload: UpdateContactPayload
  ): Promise<Contact> => {
    return await api.patch<Contact>(`/contacts/${contactId}`, payload);
  },

  toggleClientStatus: async (
    contactId: string,
    currentStatus: boolean
  ): Promise<Contact> => {
    return await api.patch<Contact>(`/contacts/${contactId}`, {
      isClient: !currentStatus,
    });
  },

  deleteContact: async (contactId: string): Promise<void> => {
    return await api.delete<void>(`/contacts/${contactId}`);
  },
};

