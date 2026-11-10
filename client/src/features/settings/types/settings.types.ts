export interface BusinessProfile {
  businessName: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state: string;
  postalCode?: string;
  country?: string;
  website?: string;
  gstin?: string;
}

export interface BrandingSettings {
  logoUrl?: string;
  signatureUrl?: string;
  signatureType: 'upload' | 'text';
  signatureText?: string;
  brandColor?: string;
}

export interface PaymentProfile {
  id: string;
  paymentProfileId?: string;
  name: string;
  profileName?: string;
  type: 'bank_transfer' | 'upi' | 'international' | 'cash' | 'other';
  currency: string;
  isDefault: boolean;
  details: string;
  instructions?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
}

export interface FinancialDefaults {
  defaultCurrency: string;
  defaultTaxMode: 'none' | 'gst' | 'flat';
  defaultTaxRate: number;
  dateFormat: string;
  defaultDueDateDays: number;
}

export interface DocumentNumberSequence {
  quotationPrefix: string;
  invoicePrefix: string;
  receiptPrefix: string;
  nextQuotationNumber: number;
  nextInvoiceNumber: number;
  nextReceiptNumber: number;
  format: string; // e.g. "{PREFIX}-{YEAR}-{NUM}"
}

export interface ServiceItem {
  id: string;
  serviceId?: string;
  name: string;
  description: string;
  defaultUnit: string;
  unit?: string;
  defaultUnitPrice: number;
  unitPrice?: number;
  currency: string;
  taxRate: number;
  isActive: boolean;
}

export interface DocumentSnippet {
  id: string;
  snippetId?: string;
  title: string;
  category: 'terms' | 'notes' | 'payment_schedule' | 'revision_policy' | 'payment_terms';
  type?: 'terms' | 'notes' | 'payment_terms';
  content: string;
  isDefault?: boolean;
}

export interface QuotationAllocation {
  id: string;
  quotationId: string;
  invoiceId: string;
  invoiceNumber: string;
  amountInvoiced: number;
  date: string;
  type: 'full' | 'advance' | 'milestone' | 'custom' | 'final';
  note?: string;
}

export interface SettingsState {
  businessProfile: BusinessProfile;
  branding: BrandingSettings;
  paymentProfiles: PaymentProfile[];
  financialDefaults: FinancialDefaults;
  numbering: DocumentNumberSequence;
  servicesCatalog: ServiceItem[];
  snippets: DocumentSnippet[];
  quotationAllocations: QuotationAllocation[];
}
