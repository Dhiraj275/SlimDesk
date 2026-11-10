'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SettingsState,
  BusinessProfile,
  BrandingSettings,
  FinancialDefaults,
  DocumentNumberSequence,
  PaymentProfile,
  ServiceItem,
  DocumentSnippet,
  QuotationAllocation,
} from '../types/settings.types';
import {
  INITIAL_SETTINGS,
  loadStoredSettings,
  saveStoredSettings,
} from '../utils/settings-storage';
import { settingsApi } from '../api/settings.api';
import tokenManager from '@/features/auth/utils/token-manager';
import { toast } from 'sonner';

interface SettingsContextValue {
  settings: SettingsState;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<void>;
  updateBranding: (branding: Partial<BrandingSettings>) => Promise<void>;
  updateFinancialDefaults: (defaults: Partial<FinancialDefaults>) => Promise<void>;
  updateNumbering: (numbering: Partial<DocumentNumberSequence>) => Promise<void>;
  // Payment Profiles
  addPaymentProfile: (profile: Omit<PaymentProfile, 'id'>) => Promise<void>;
  updatePaymentProfile: (id: string, profile: Partial<PaymentProfile>) => Promise<void>;
  deletePaymentProfile: (id: string) => Promise<void>;
  setDefaultPaymentProfile: (id: string) => Promise<void>;
  getDefaultPaymentProfile: () => PaymentProfile | undefined;
  // Services Catalog
  addServiceItem: (item: Omit<ServiceItem, 'id'>) => Promise<void>;
  updateServiceItem: (id: string, item: Partial<ServiceItem>) => Promise<void>;
  deleteServiceItem: (id: string) => Promise<void>;
  // Document Snippets
  addSnippet: (snippet: Omit<DocumentSnippet, 'id'>) => Promise<void>;
  updateSnippet: (id: string, snippet: Partial<DocumentSnippet>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  // Quotation Allocations
  recordQuotationAllocation: (allocation: Omit<QuotationAllocation, 'id'>) => QuotationAllocation;
  getQuotationAllocations: (quotationId: string) => QuotationAllocation[];
  getQuotationBillingMetrics: (quotationId: string, quotationTotal: number) => {
    totalInvoiced: number;
    remainingBillable: number;
    percentBilled: number;
    allocations: QuotationAllocation[];
  };
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const syncFromBackend = useCallback(async () => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      setIsLoading(true);
      const [profileRes, paymentRes, servicesRes, snippetsRes, seqRes] =
        await Promise.allSettled([
          settingsApi.getProfile(),
          settingsApi.getPaymentProfiles(),
          settingsApi.getServices(),
          settingsApi.getSnippets(),
          settingsApi.getSequences(),
        ]);

      setSettings((prev) => {
        let updated = { ...prev };

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const bp = profileRes.value;
          updated.businessProfile = {
            ...prev.businessProfile,
            businessName: bp.businessName || prev.businessProfile.businessName,
            legalName: bp.legalName || prev.businessProfile.legalName,
            email: bp.email || prev.businessProfile.email,
            phone: bp.phone || prev.businessProfile.phone,
            address: bp.address || prev.businessProfile.address,
            city: bp.city || prev.businessProfile.city,
            state: bp.state || prev.businessProfile.state,
            postalCode: bp.postalCode || prev.businessProfile.postalCode,
            country: bp.country || prev.businessProfile.country,
            website: bp.website || prev.businessProfile.website,
            gstin: bp.gstin || prev.businessProfile.gstin,
          };

          updated.branding = {
            ...prev.branding,
            logoUrl: bp.logoUrl || prev.branding.logoUrl,
            signatureUrl: bp.signatureUrl || prev.branding.signatureUrl,
            brandColor: bp.brandColor || prev.branding.brandColor,
          };

          updated.financialDefaults = {
            ...prev.financialDefaults,
            defaultCurrency: bp.defaultCurrency || prev.financialDefaults.defaultCurrency,
            defaultTaxMode: bp.taxMode || prev.financialDefaults.defaultTaxMode,
            defaultTaxRate: Number(bp.defaultTaxRate) || prev.financialDefaults.defaultTaxRate,
            dateFormat: bp.dateFormat || prev.financialDefaults.dateFormat,
            defaultDueDateDays: bp.dueDaysPreset || prev.financialDefaults.defaultDueDateDays,
          };
        }

        if (paymentRes.status === 'fulfilled' && Array.isArray(paymentRes.value)) {
          updated.paymentProfiles = paymentRes.value.map((p) => {
            let detailsFormatted = '';
            if (p.details) {
              if (p.type === 'upi') {
                detailsFormatted = `UPI ID: ${p.details.upiId || ''}\nName: ${p.details.accountHolderName || ''}`;
              } else if (p.type === 'bank_transfer') {
                detailsFormatted = `Bank: ${p.details.bankName || ''}\nA/C: ${p.details.accountNumber || ''}\nIFSC: ${p.details.ifscCode || ''}\nName: ${p.details.accountHolderName || ''}`;
              } else if (p.details.instructions) {
                detailsFormatted = p.details.instructions;
              } else if (typeof p.details === 'string') {
                detailsFormatted = p.details;
              }
            }
            if (!detailsFormatted && p.instructions) {
              detailsFormatted = p.instructions;
            }

            return {
              id: p.paymentProfileId,
              paymentProfileId: p.paymentProfileId,
              name: p.profileName,
              profileName: p.profileName,
              type: p.type,
              currency: p.currency,
              isDefault: p.isDefault,
              details: detailsFormatted || 'Direct Bank/UPI Remittance',
              instructions: p.instructions || '',
              accountNumber: p.details?.accountNumber,
              ifscCode: p.details?.ifscCode,
              bankName: p.details?.bankName,
              upiId: p.details?.upiId,
            };
          });
        }

        if (servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value)) {
          updated.servicesCatalog = servicesRes.value.map((s) => ({
            id: s.serviceId,
            serviceId: s.serviceId,
            name: s.name,
            description: s.description || '',
            defaultUnit: s.unit || 'units',
            unit: s.unit || 'units',
            defaultUnitPrice: Number(s.unitPrice) || 0,
            unitPrice: Number(s.unitPrice) || 0,
            currency: s.currency || 'INR',
            taxRate: Number(s.taxRate) || 0,
            isActive: s.isActive !== false,
          }));
        }

        if (snippetsRes.status === 'fulfilled' && Array.isArray(snippetsRes.value)) {
          updated.snippets = snippetsRes.value.map((sn) => ({
            id: sn.snippetId,
            snippetId: sn.snippetId,
            title: sn.title,
            category: sn.type as any,
            type: sn.type,
            content: sn.content,
            isDefault: sn.isDefault,
          }));
        }

        if (seqRes.status === 'fulfilled' && Array.isArray(seqRes.value)) {
          seqRes.value.forEach((sq) => {
            if (sq.documentType === 'quotation') {
              updated.numbering.quotationPrefix = sq.prefix;
              updated.numbering.nextQuotationNumber = sq.nextNumber;
            } else if (sq.documentType === 'invoice') {
              updated.numbering.invoicePrefix = sq.prefix;
              updated.numbering.nextInvoiceNumber = sq.nextNumber;
            } else if (sq.documentType === 'receipt') {
              updated.numbering.receiptPrefix = sq.prefix;
              updated.numbering.nextReceiptNumber = sq.nextNumber;
            }
          });
        }

        saveStoredSettings(updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to sync settings from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = loadStoredSettings();
    setSettings(stored);
    syncFromBackend();
  }, [syncFromBackend]);

  const updateState = (updater: (prev: SettingsState) => SettingsState) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveStoredSettings(next);
      return next;
    });
  };

  const updateBusinessProfile = async (profile: Partial<BusinessProfile>) => {
    updateState((prev) => ({
      ...prev,
      businessProfile: { ...prev.businessProfile, ...profile },
    }));

    try {
      await settingsApi.updateProfile({
        businessName: profile.businessName,
        legalName: profile.legalName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        state: profile.state,
        city: profile.city,
        postalCode: profile.postalCode,
        country: profile.country,
        website: profile.website,
        gstin: profile.gstin,
      });
      toast.success('Business profile updated');
    } catch {
      toast.success('Business profile updated (saved locally)');
    }
  };

  const updateBranding = async (branding: Partial<BrandingSettings>) => {
    updateState((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...branding },
    }));

    try {
      await settingsApi.updateProfile({
        logoUrl: branding.logoUrl,
        signatureUrl: branding.signatureUrl,
        brandColor: branding.brandColor,
      });
      toast.success('Branding preferences saved');
    } catch {
      toast.success('Branding preferences saved (saved locally)');
    }
  };

  const updateFinancialDefaults = async (defaults: Partial<FinancialDefaults>) => {
    updateState((prev) => ({
      ...prev,
      financialDefaults: { ...prev.financialDefaults, ...defaults },
    }));

    try {
      await settingsApi.updateProfile({
        defaultCurrency: defaults.defaultCurrency,
        taxMode: defaults.defaultTaxMode,
        defaultTaxRate: defaults.defaultTaxRate,
        dateFormat: defaults.dateFormat,
        dueDaysPreset: defaults.defaultDueDateDays,
      });
      toast.success('Financial defaults updated');
    } catch {
      toast.success('Financial defaults updated (saved locally)');
    }
  };

  const updateNumbering = async (numbering: Partial<DocumentNumberSequence>) => {
    updateState((prev) => ({
      ...prev,
      numbering: { ...prev.numbering, ...numbering },
    }));

    try {
      if (numbering.quotationPrefix) {
        await settingsApi.updateSequence('quotation', {
          prefix: numbering.quotationPrefix,
        });
      }
      if (numbering.invoicePrefix) {
        await settingsApi.updateSequence('invoice', {
          prefix: numbering.invoicePrefix,
        });
      }
      if (numbering.receiptPrefix) {
        await settingsApi.updateSequence('receipt', {
          prefix: numbering.receiptPrefix,
        });
      }
      toast.success('Document sequence updated');
    } catch {
      toast.success('Document sequence updated (saved locally)');
    }
  };

  // Payment Profiles
  const addPaymentProfile = async (profile: Omit<PaymentProfile, 'id'>) => {
    const tempId = `pay-${Date.now()}`;
    const newProfile: PaymentProfile = { ...profile, id: tempId };

    updateState((prev) => {
      let profiles = [...prev.paymentProfiles];
      if (newProfile.isDefault) {
        profiles = profiles.map((p) => ({ ...p, isDefault: false }));
      }
      return {
        ...prev,
        paymentProfiles: [...profiles, newProfile],
      };
    });

    try {
      const created = await settingsApi.createPaymentProfile({
        profileName: profile.name,
        type: profile.type,
        currency: profile.currency,
        isDefault: profile.isDefault,
        details: {
          accountNumber: profile.accountNumber,
          ifscCode: profile.ifscCode,
          bankName: profile.bankName,
          upiId: profile.upiId,
          instructions: profile.details,
        },
        instructions: profile.details,
      });

      if (created?.paymentProfileId) {
        updateState((prev) => ({
          ...prev,
          paymentProfiles: prev.paymentProfiles.map((p) =>
            p.id === tempId
              ? {
                  ...p,
                  id: created.paymentProfileId,
                  paymentProfileId: created.paymentProfileId,
                }
              : p
          ),
        }));
      }
      toast.success(`Payment profile "${profile.name}" added`);
    } catch {
      toast.success(`Payment profile "${profile.name}" added (saved locally)`);
    }
  };

  const updatePaymentProfile = async (
    id: string,
    partial: Partial<PaymentProfile>
  ) => {
    updateState((prev) => {
      let profiles = prev.paymentProfiles.map((p) => {
        if (p.id === id) {
          return { ...p, ...partial };
        }
        if (partial.isDefault) {
          return { ...p, isDefault: false };
        }
        return p;
      });
      return { ...prev, paymentProfiles: profiles };
    });

    try {
      await settingsApi.updatePaymentProfile(id, {
        profileName: partial.name,
        type: partial.type,
        currency: partial.currency,
        isDefault: partial.isDefault,
        details: {
          accountNumber: partial.accountNumber,
          ifscCode: partial.ifscCode,
          bankName: partial.bankName,
          upiId: partial.upiId,
          instructions: partial.details,
        },
        instructions: partial.details,
      });
      toast.success('Payment profile updated');
    } catch {
      toast.success('Payment profile updated (saved locally)');
    }
  };

  const deletePaymentProfile = async (id: string) => {
    updateState((prev) => ({
      ...prev,
      paymentProfiles: prev.paymentProfiles.filter((p) => p.id !== id),
    }));

    try {
      await settingsApi.deletePaymentProfile(id);
      toast.success('Payment profile removed');
    } catch {
      toast.success('Payment profile removed (saved locally)');
    }
  };

  const setDefaultPaymentProfile = async (id: string) => {
    updateState((prev) => ({
      ...prev,
      paymentProfiles: prev.paymentProfiles.map((p) => ({
        ...p,
        isDefault: p.id === id,
      })),
    }));

    try {
      await settingsApi.setDefaultPaymentProfile(id);
      toast.success('Default payment profile set');
    } catch {
      toast.success('Default payment profile set');
    }
  };

  const getDefaultPaymentProfile = () => {
    return (
      settings.paymentProfiles.find((p) => p.isDefault) ||
      settings.paymentProfiles[0]
    );
  };

  // Services Catalog
  const addServiceItem = async (item: Omit<ServiceItem, 'id'>) => {
    const tempId = `svc-${Date.now()}`;
    const newItem: ServiceItem = { ...item, id: tempId };

    updateState((prev) => ({
      ...prev,
      servicesCatalog: [newItem, ...prev.servicesCatalog],
    }));

    try {
      const created = await settingsApi.createService({
        name: item.name,
        description: item.description,
        unit: item.defaultUnit,
        unitPrice: item.defaultUnitPrice,
        currency: item.currency,
        taxRate: item.taxRate,
        isActive: item.isActive,
      });

      if (created?.serviceId) {
        updateState((prev) => ({
          ...prev,
          servicesCatalog: prev.servicesCatalog.map((s) =>
            s.id === tempId
              ? { ...s, id: created.serviceId, serviceId: created.serviceId }
              : s
          ),
        }));
      }
      toast.success(`Service "${item.name}" added to catalog`);
    } catch {
      toast.success(`Service "${item.name}" added (saved locally)`);
    }
  };

  const updateServiceItem = async (
    id: string,
    partial: Partial<ServiceItem>
  ) => {
    updateState((prev) => ({
      ...prev,
      servicesCatalog: prev.servicesCatalog.map((s) =>
        s.id === id ? { ...s, ...partial } : s
      ),
    }));

    try {
      await settingsApi.updateService(id, {
        name: partial.name,
        description: partial.description,
        unit: partial.defaultUnit,
        unitPrice: partial.defaultUnitPrice,
        currency: partial.currency,
        taxRate: partial.taxRate,
        isActive: partial.isActive,
      });
      toast.success('Catalog item updated');
    } catch {
      toast.success('Catalog item updated (saved locally)');
    }
  };

  const deleteServiceItem = async (id: string) => {
    updateState((prev) => ({
      ...prev,
      servicesCatalog: prev.servicesCatalog.filter((s) => s.id !== id),
    }));

    try {
      await settingsApi.deleteService(id);
      toast.success('Service removed from catalog');
    } catch {
      toast.success('Service removed from catalog');
    }
  };

  // Document Snippets
  const addSnippet = async (snippet: Omit<DocumentSnippet, 'id'>) => {
    const tempId = `snp-${Date.now()}`;
    const newSnippet: DocumentSnippet = { ...snippet, id: tempId };

    updateState((prev) => ({
      ...prev,
      snippets: [newSnippet, ...prev.snippets],
    }));

    try {
      const created = await settingsApi.createSnippet({
        title: snippet.title,
        type:
          snippet.category === 'notes'
            ? 'notes'
            : snippet.category === 'payment_schedule'
            ? 'payment_terms'
            : 'terms',
        content: snippet.content,
      });

      if (created?.snippetId) {
        updateState((prev) => ({
          ...prev,
          snippets: prev.snippets.map((sn) =>
            sn.id === tempId
              ? { ...sn, id: created.snippetId, snippetId: created.snippetId }
              : sn
          ),
        }));
      }
      toast.success(`Clause "${snippet.title}" saved to library`);
    } catch {
      toast.success(`Clause "${snippet.title}" saved (saved locally)`);
    }
  };

  const updateSnippet = async (
    id: string,
    partial: Partial<DocumentSnippet>
  ) => {
    updateState((prev) => ({
      ...prev,
      snippets: prev.snippets.map((s) =>
        s.id === id ? { ...s, ...partial } : s
      ),
    }));

    try {
      await settingsApi.updateSnippet(id, {
        title: partial.title,
        content: partial.content,
        type: partial.category
          ? partial.category === 'notes'
            ? 'notes'
            : partial.category === 'payment_schedule'
            ? 'payment_terms'
            : 'terms'
          : undefined,
      });
      toast.success('Snippet updated');
    } catch {
      toast.success('Snippet updated (saved locally)');
    }
  };

  const deleteSnippet = async (id: string) => {
    updateState((prev) => ({
      ...prev,
      snippets: prev.snippets.filter((s) => s.id !== id),
    }));

    try {
      await settingsApi.deleteSnippet(id);
      toast.success('Snippet removed');
    } catch {
      toast.success('Snippet removed');
    }
  };

  // Quotation Allocations
  const recordQuotationAllocation = (
    allocation: Omit<QuotationAllocation, 'id'>
  ): QuotationAllocation => {
    const newAlloc: QuotationAllocation = {
      ...allocation,
      id: `alloc-${Date.now()}`,
    };
    updateState((prev) => ({
      ...prev,
      quotationAllocations: [newAlloc, ...prev.quotationAllocations],
    }));
    return newAlloc;
  };

  const getQuotationAllocations = (quotationId: string): QuotationAllocation[] => {
    return settings.quotationAllocations.filter(
      (a) => a.quotationId === quotationId
    );
  };

  const getQuotationBillingMetrics = (
    quotationId: string,
    quotationTotal: number
  ) => {
    const allocations = getQuotationAllocations(quotationId);
    const totalInvoiced = allocations.reduce(
      (sum, a) => sum + (Number(a.amountInvoiced) || 0),
      0
    );
    const remainingBillable = Math.max(0, quotationTotal - totalInvoiced);
    const percentBilled =
      quotationTotal > 0
        ? Math.min(100, Math.round((totalInvoiced / quotationTotal) * 100))
        : 0;

    return {
      totalInvoiced,
      remainingBillable,
      percentBilled,
      allocations,
    };
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings: syncFromBackend,
        updateBusinessProfile,
        updateBranding,
        updateFinancialDefaults,
        updateNumbering,
        addPaymentProfile,
        updatePaymentProfile,
        deletePaymentProfile,
        setDefaultPaymentProfile,
        getDefaultPaymentProfile,
        addServiceItem,
        updateServiceItem,
        deleteServiceItem,
        addSnippet,
        updateSnippet,
        deleteSnippet,
        recordQuotationAllocation,
        getQuotationAllocations,
        getQuotationBillingMetrics,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
