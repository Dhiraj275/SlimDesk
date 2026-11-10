import { api } from '@/shared/utils/api-client';
import {
  BusinessProfile,
  BrandingSettings,
  PaymentProfile,
  FinancialDefaults,
  DocumentNumberSequence,
  ServiceItem,
  DocumentSnippet,
} from '../types/settings.types';

export interface BackendBusinessProfile {
  profileId: string;
  userId: string;
  businessName: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  website?: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  brandColor: string;
  gstin?: string | null;
  taxMode: 'none' | 'gst' | 'flat';
  defaultTaxRate: number;
  defaultCurrency: string;
  dateFormat: string;
  dueDaysPreset: number;
  documentTemplate: 'modern' | 'classic' | 'minimal' | 'bold';
  createdAt: string;
  updatedAt: string;
}

export interface BackendPaymentProfile {
  paymentProfileId: string;
  userId: string;
  profileName: string;
  type: 'bank_transfer' | 'upi' | 'international' | 'cash' | 'other';
  currency: string;
  isDefault: boolean;
  details: Record<string, any>;
  instructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendServiceItem {
  serviceId: string;
  userId: string;
  name: string;
  description?: string | null;
  unit: string;
  unitPrice: number;
  currency: string;
  taxRate: number;
  isActive: boolean;
  sortOrder?: number;
}

export interface BackendDocumentSnippet {
  snippetId: string;
  userId: string;
  title: string;
  type: 'terms' | 'notes' | 'payment_terms';
  content: string;
  isDefault: boolean;
}

export interface BackendSequence {
  sequenceId: string;
  userId: string;
  documentType: 'quotation' | 'invoice' | 'receipt';
  prefix: string;
  yearFormat: 'YYYY' | 'YY' | 'NONE';
  nextNumber: number;
  paddingDigits: number;
}

export const settingsApi = {
  // Business Profile & Document Defaults
  getProfile: async (): Promise<BackendBusinessProfile> => {
    return await api.get<BackendBusinessProfile>('/settings/profile');
  },

  updateProfile: async (
    payload: Partial<BackendBusinessProfile>
  ): Promise<BackendBusinessProfile> => {
    return await api.put<BackendBusinessProfile>('/settings/profile', payload);
  },

  getDocumentDefaults: async (): Promise<any> => {
    return await api.get<any>('/settings/document-defaults');
  },

  // Payment Profiles
  getPaymentProfiles: async (): Promise<BackendPaymentProfile[]> => {
    return await api.get<BackendPaymentProfile[]>('/settings/payment-profiles');
  },

  createPaymentProfile: async (payload: {
    profileName: string;
    type: string;
    currency?: string;
    isDefault?: boolean;
    details: Record<string, any>;
    instructions?: string;
  }): Promise<BackendPaymentProfile> => {
    return await api.post<BackendPaymentProfile>(
      '/settings/payment-profiles',
      payload
    );
  },

  updatePaymentProfile: async (
    id: string,
    payload: Partial<{
      profileName: string;
      type: string;
      currency?: string;
      isDefault?: boolean;
      details: Record<string, any>;
      instructions?: string;
    }>
  ): Promise<BackendPaymentProfile> => {
    return await api.patch<BackendPaymentProfile>(
      `/settings/payment-profiles/${id}`,
      payload
    );
  },

  deletePaymentProfile: async (id: string): Promise<void> => {
    return await api.delete<void>(`/settings/payment-profiles/${id}`);
  },

  setDefaultPaymentProfile: async (
    id: string
  ): Promise<BackendPaymentProfile> => {
    return await api.post<BackendPaymentProfile>(
      `/settings/payment-profiles/${id}/set-default`
    );
  },

  // Services Catalog
  getServices: async (): Promise<BackendServiceItem[]> => {
    return await api.get<BackendServiceItem[]>('/settings/services');
  },

  createService: async (payload: {
    name: string;
    description?: string;
    unit?: string;
    unitPrice: number;
    currency?: string;
    taxRate?: number;
    isActive?: boolean;
  }): Promise<BackendServiceItem> => {
    return await api.post<BackendServiceItem>('/settings/services', payload);
  },

  updateService: async (
    id: string,
    payload: Partial<{
      name: string;
      description?: string;
      unit?: string;
      unitPrice: number;
      currency?: string;
      taxRate?: number;
      isActive?: boolean;
    }>
  ): Promise<BackendServiceItem> => {
    return await api.patch<BackendServiceItem>(
      `/settings/services/${id}`,
      payload
    );
  },

  deleteService: async (id: string): Promise<void> => {
    return await api.delete<void>(`/settings/services/${id}`);
  },

  // Document Snippets
  getSnippets: async (
    type?: 'terms' | 'notes' | 'payment_terms'
  ): Promise<BackendDocumentSnippet[]> => {
    return await api.get<BackendDocumentSnippet[]>(
      '/settings/snippets',
      type ? { type } : undefined
    );
  },

  createSnippet: async (payload: {
    title: string;
    type: 'terms' | 'notes' | 'payment_terms';
    content: string;
    isDefault?: boolean;
  }): Promise<BackendDocumentSnippet> => {
    return await api.post<BackendDocumentSnippet>('/settings/snippets', payload);
  },

  updateSnippet: async (
    id: string,
    payload: Partial<{
      title: string;
      type: 'terms' | 'notes' | 'payment_terms';
      content: string;
      isDefault?: boolean;
    }>
  ): Promise<BackendDocumentSnippet> => {
    return await api.patch<BackendDocumentSnippet>(
      `/settings/snippets/${id}`,
      payload
    );
  },

  deleteSnippet: async (id: string): Promise<void> => {
    return await api.delete<void>(`/settings/snippets/${id}`);
  },

  // Numbering Sequences
  getSequences: async (): Promise<BackendSequence[]> => {
    return await api.get<BackendSequence[]>('/settings/sequences');
  },

  updateSequence: async (
    documentType: 'quotation' | 'invoice' | 'receipt',
    payload: {
      prefix?: string;
      yearFormat?: 'YYYY' | 'YY' | 'NONE';
      nextNumber?: number;
      paddingDigits?: number;
    }
  ): Promise<BackendSequence> => {
    return await api.patch<BackendSequence>(
      `/settings/sequences/${documentType}`,
      payload
    );
  },
};
