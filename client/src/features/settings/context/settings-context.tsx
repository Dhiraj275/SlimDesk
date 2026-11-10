'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { toast } from 'sonner';

interface SettingsContextValue {
  settings: SettingsState;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  updateBranding: (branding: Partial<BrandingSettings>) => void;
  updateFinancialDefaults: (defaults: Partial<FinancialDefaults>) => void;
  updateNumbering: (numbering: Partial<DocumentNumberSequence>) => void;
  // Payment Profiles
  addPaymentProfile: (profile: Omit<PaymentProfile, 'id'>) => void;
  updatePaymentProfile: (id: string, profile: Partial<PaymentProfile>) => void;
  deletePaymentProfile: (id: string) => void;
  setDefaultPaymentProfile: (id: string) => void;
  getDefaultPaymentProfile: () => PaymentProfile | undefined;
  // Services Catalog
  addServiceItem: (item: Omit<ServiceItem, 'id'>) => void;
  updateServiceItem: (id: string, item: Partial<ServiceItem>) => void;
  deleteServiceItem: (id: string) => void;
  // Document Snippets
  addSnippet: (snippet: Omit<DocumentSnippet, 'id'>) => void;
  updateSnippet: (id: string, snippet: Partial<DocumentSnippet>) => void;
  deleteSnippet: (id: string) => void;
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = loadStoredSettings();
    setSettings(stored);
    setIsLoaded(true);
  }, []);

  const updateState = (updater: (prev: SettingsState) => SettingsState) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveStoredSettings(next);
      return next;
    });
  };

  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    updateState((prev) => ({
      ...prev,
      businessProfile: { ...prev.businessProfile, ...profile },
    }));
    toast.success('Business profile updated');
  };

  const updateBranding = (branding: Partial<BrandingSettings>) => {
    updateState((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...branding },
    }));
    toast.success('Branding preferences saved');
  };

  const updateFinancialDefaults = (defaults: Partial<FinancialDefaults>) => {
    updateState((prev) => ({
      ...prev,
      financialDefaults: { ...prev.financialDefaults, ...defaults },
    }));
    toast.success('Financial defaults updated');
  };

  const updateNumbering = (numbering: Partial<DocumentNumberSequence>) => {
    updateState((prev) => ({
      ...prev,
      numbering: { ...prev.numbering, ...numbering },
    }));
    toast.success('Document sequence updated');
  };

  // Payment Profiles
  const addPaymentProfile = (profile: Omit<PaymentProfile, 'id'>) => {
    const newProfile: PaymentProfile = {
      ...profile,
      id: `pay-${Date.now()}`,
    };
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
    toast.success(`Payment profile "${newProfile.name}" added`);
  };

  const updatePaymentProfile = (id: string, partial: Partial<PaymentProfile>) => {
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
    toast.success('Payment profile updated');
  };

  const deletePaymentProfile = (id: string) => {
    updateState((prev) => ({
      ...prev,
      paymentProfiles: prev.paymentProfiles.filter((p) => p.id !== id),
    }));
    toast.success('Payment profile removed');
  };

  const setDefaultPaymentProfile = (id: string) => {
    updateState((prev) => ({
      ...prev,
      paymentProfiles: prev.paymentProfiles.map((p) => ({
        ...p,
        isDefault: p.id === id,
      })),
    }));
    toast.success('Default payment profile set');
  };

  const getDefaultPaymentProfile = () => {
    return (
      settings.paymentProfiles.find((p) => p.isDefault) ||
      settings.paymentProfiles[0]
    );
  };

  // Services Catalog
  const addServiceItem = (item: Omit<ServiceItem, 'id'>) => {
    const newItem: ServiceItem = {
      ...item,
      id: `svc-${Date.now()}`,
    };
    updateState((prev) => ({
      ...prev,
      servicesCatalog: [newItem, ...prev.servicesCatalog],
    }));
    toast.success(`Service "${newItem.name}" added to catalog`);
  };

  const updateServiceItem = (id: string, partial: Partial<ServiceItem>) => {
    updateState((prev) => ({
      ...prev,
      servicesCatalog: prev.servicesCatalog.map((s) =>
        s.id === id ? { ...s, ...partial } : s
      ),
    }));
    toast.success('Catalog item updated');
  };

  const deleteServiceItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      servicesCatalog: prev.servicesCatalog.filter((s) => s.id !== id),
    }));
    toast.success('Service removed from catalog');
  };

  // Document Snippets
  const addSnippet = (snippet: Omit<DocumentSnippet, 'id'>) => {
    const newSnippet: DocumentSnippet = {
      ...snippet,
      id: `snp-${Date.now()}`,
    };
    updateState((prev) => ({
      ...prev,
      snippets: [newSnippet, ...prev.snippets],
    }));
    toast.success(`Clause "${newSnippet.title}" saved to library`);
  };

  const updateSnippet = (id: string, partial: Partial<DocumentSnippet>) => {
    updateState((prev) => ({
      ...prev,
      snippets: prev.snippets.map((s) =>
        s.id === id ? { ...s, ...partial } : s
      ),
    }));
    toast.success('Snippet updated');
  };

  const deleteSnippet = (id: string) => {
    updateState((prev) => ({
      ...prev,
      snippets: prev.snippets.filter((s) => s.id !== id),
    }));
    toast.success('Snippet removed');
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
      (sum, a) => sum + Number(a.amountInvoiced || 0),
      0
    );
    const remainingBillable = Math.max(0, quotationTotal - totalInvoiced);
    const percentBilled =
      quotationTotal > 0
        ? Math.min(100, (totalInvoiced / quotationTotal) * 100)
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
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};
