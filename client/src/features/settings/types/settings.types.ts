export interface BusinessProfile {
  businessName: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  state: string;
  website?: string;
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
  name: string;
  type: 'bank_transfer' | 'upi' | 'international' | 'cash';
  currency: string;
  isDefault: boolean;
  details: string;
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
  name: string;
  description: string;
  defaultUnit: string;
  defaultUnitPrice: number;
  currency: string;
  taxRate: number;
  isActive: boolean;
}

export interface DocumentSnippet {
  id: string;
  title: string;
  category: 'terms' | 'notes' | 'payment_schedule' | 'revision_policy';
  content: string;
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
