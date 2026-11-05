export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'cancelled';

export type TaxMode = 'none' | 'gst' | 'flat';

export interface QuotationItem {
  itemId?: string;
  quotationId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  sortOrder: number;
}

export interface QuotationVersion {
  versionId: string;
  quotationId: string;
  versionNumber: number;
  snapshot: any;
  changeSummary: string | null;
  createdAt: string;
}

export interface TaxDetails {
  isInterState: boolean;
  placeOfSupply: string | null;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export interface PartyInfo {
  name: string;
  businessName?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string | null;
  state?: string;
}

export interface Quotation {
  quotationId: string;
  userId: string;
  contactId: string | null;
  leadId: string | null;
  quotationNumber: string;
  title: string;
  version: number;
  status: QuotationStatus;
  currency: string;
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxMode: TaxMode;
  taxDetails: TaxDetails | null;
  freelancerInfo: PartyInfo;
  clientInfo: PartyInfo;
  paymentSchedule: string | null;
  terms: string | null;
  notes: string | null;
  publicToken: string;
  viewedAt: string | null;
  acceptedAt: string | null;
  acceptedByName: string | null;
  acceptedByEmail: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  convertedAt: string | null;
  invoiceId: string | null;
  items: QuotationItem[];
  versions?: QuotationVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationMetrics {
  total: number;
  draft: number;
  sent: number;
  viewed: number;
  accepted: number;
  rejected: number;
  converted: number;
  expired: number;
  acceptedValue: number;
  totalPipelineValue: number;
}

export interface CreateQuotationPayload {
  title: string;
  contactId?: string;
  leadId?: string;
  currency?: string;
  issueDate: string;
  expiryDate: string;
  taxMode?: TaxMode;
  discountAmount?: number;
  freelancerInfo: PartyInfo;
  clientInfo: PartyInfo;
  paymentSchedule?: string;
  terms?: string;
  notes?: string;
  items: Omit<QuotationItem, 'itemId' | 'quotationId' | 'taxAmount' | 'totalAmount'>[];
}

export interface UpdateQuotationPayload extends Partial<CreateQuotationPayload> {}

export interface SendQuotationPayload {
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}

export interface ClientAcceptPayload {
  name: string;
  email: string;
  comments?: string;
}

export interface ClientRejectPayload {
  reason: string;
}

export interface QuotationFilterQuery {
  page?: number;
  limit?: number;
  status?: QuotationStatus | 'all';
  search?: string;
  contactId?: string;
  leadId?: string;
}

export interface PaginatedQuotationsResponse {
  data: Quotation[];
  total: number;
  page: number;
  limit: number;
}
