import { SettingsState, PaymentProfile, ServiceItem, DocumentSnippet } from '../types/settings.types';

const SETTINGS_STORAGE_KEY = 'slimdesk_document_settings_v1';

export const DEFAULT_PAYMENT_PROFILES: PaymentProfile[] = [
  {
    id: 'pay-1',
    name: 'HDFC Current Account',
    type: 'bank_transfer',
    currency: 'INR',
    isDefault: true,
    bankName: 'HDFC Bank',
    accountNumber: '50200087654321',
    ifscCode: 'HDFC0000123',
    details: 'Bank: HDFC Bank\nA/C No: 50200087654321\nIFSC: HDFC0000123\nBeneficiary: SlimDesk Studio LLP\nBranch: Nariman Point, Mumbai',
  },
  {
    id: 'pay-2',
    name: 'Personal UPI ID',
    type: 'upi',
    currency: 'INR',
    isDefault: false,
    upiId: 'dhiraj@okhdfcbank',
    details: 'UPI ID: dhiraj@okhdfcbank\nPayable via GPay, PhonePe, Paytm, or BHIM',
  },
  {
    id: 'pay-3',
    name: 'Wise USD Wire',
    type: 'international',
    currency: 'USD',
    isDefault: false,
    details: 'Bank: Evolve Bank & Trust\nRouting: 084108966\nAccount No: 9876543210\nCurrency: USD\nBeneficiary: SlimDesk Studio',
  },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'svc-1',
    name: 'UI/UX Design & High-Fidelity Wireframing',
    description: 'Figma design system, high-fidelity prototypes, user research, and developer handoff specs.',
    defaultUnit: 'screen',
    defaultUnitPrice: 3500,
    currency: 'INR',
    taxRate: 18,
    isActive: true,
  },
  {
    id: 'svc-2',
    name: 'Frontend Development & Responsive Web UI',
    description: 'Next.js 15, TypeScript, Tailwind CSS, clean components, fully responsive for all screen sizes.',
    defaultUnit: 'milestone',
    defaultUnitPrice: 25000,
    currency: 'INR',
    taxRate: 18,
    isActive: true,
  },
  {
    id: 'svc-3',
    name: 'Backend API & Database Integration',
    description: 'RESTful/GraphQL API development, PostgreSQL/MySQL database modeling, authentication & security.',
    defaultUnit: 'milestone',
    defaultUnitPrice: 20000,
    currency: 'INR',
    taxRate: 18,
    isActive: true,
  },
  {
    id: 'svc-4',
    name: 'Monthly Retainer & Code Maintenance',
    description: '20 hours per month for bug fixes, performance monitoring, dependency upgrades, and minor features.',
    defaultUnit: 'month',
    defaultUnitPrice: 35000,
    currency: 'INR',
    taxRate: 18,
    isActive: true,
  },
  {
    id: 'svc-5',
    name: 'Consultation & Architecture Advisory',
    description: 'Technical guidance, system architecture review, code audit, and deployment consulting.',
    defaultUnit: 'hrs',
    defaultUnitPrice: 2500,
    currency: 'INR',
    taxRate: 18,
    isActive: true,
  },
];

export const DEFAULT_SNIPPETS: DocumentSnippet[] = [
  {
    id: 'snp-1',
    title: '50/50 Milestone Schedule',
    category: 'terms',
    content: '50% advance deposit upon quotation acceptance prior to project kickoff. Remaining 50% balance upon staging approval and prior to production handover.',
  },
  {
    id: 'snp-2',
    title: 'Net 14 Standard Terms',
    category: 'terms',
    content: 'Payment is due within 14 calendar days of invoice issuance. Late payments incur a 1.5% interest charge per month.',
  },
  {
    id: 'snp-3',
    title: 'Design Revision Scope',
    category: 'revision_policy',
    content: 'Quotation includes up to two (2) iterations of design feedback per deliverable milestone. Additional revisions or major structural deviations will be billed at the standard hourly rate.',
  },
  {
    id: 'snp-4',
    title: 'Warm Professional Thank You',
    category: 'notes',
    content: 'Thank you for your business! Please include the invoice number in your bank/UPI transfer remarks. Reach out anytime if you have questions regarding this bill.',
  },
];

export const INITIAL_SETTINGS: SettingsState = {
  businessProfile: {
    businessName: 'SlimDesk Studio',
    legalName: 'SlimDesk Creative Studio LLP',
    email: 'hello@slimdesk.studio',
    phone: '+91 98765 43210',
    address: '402, High Street Towers, Nariman Point, Mumbai 400021, India',
    gstin: '27AABCU9603R1ZM',
    state: 'Maharashtra',
    website: 'https://slimdesk.studio',
  },
  branding: {
    logoUrl: '',
    signatureUrl: '',
    signatureType: 'text',
    signatureText: 'Dhiraj Patil',
    brandColor: '#2563eb',
  },
  paymentProfiles: DEFAULT_PAYMENT_PROFILES,
  financialDefaults: {
    defaultCurrency: 'INR',
    defaultTaxMode: 'gst',
    defaultTaxRate: 18,
    dateFormat: 'DD/MM/YYYY',
    defaultDueDateDays: 14,
  },
  numbering: {
    quotationPrefix: 'QT',
    invoicePrefix: 'INV',
    receiptPrefix: 'RCT',
    nextQuotationNumber: 1,
    nextInvoiceNumber: 1,
    nextReceiptNumber: 1,
    format: '{PREFIX}-{YEAR}-{NUM}',
  },
  servicesCatalog: DEFAULT_SERVICES,
  snippets: DEFAULT_SNIPPETS,
  quotationAllocations: [],
};

export const loadStoredSettings = (): SettingsState => {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return INITIAL_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_SETTINGS,
      ...parsed,
      businessProfile: { ...INITIAL_SETTINGS.businessProfile, ...parsed.businessProfile },
      branding: { ...INITIAL_SETTINGS.branding, ...parsed.branding },
      financialDefaults: { ...INITIAL_SETTINGS.financialDefaults, ...parsed.financialDefaults },
      numbering: { ...INITIAL_SETTINGS.numbering, ...parsed.numbering },
      paymentProfiles: parsed.paymentProfiles || DEFAULT_PAYMENT_PROFILES,
      servicesCatalog: parsed.servicesCatalog || DEFAULT_SERVICES,
      snippets: parsed.snippets || DEFAULT_SNIPPETS,
      quotationAllocations: parsed.quotationAllocations || [],
    };
  } catch (e) {
    console.error('Failed to parse document settings from localStorage:', e);
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: SettingsState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save document settings to localStorage:', e);
  }
};

