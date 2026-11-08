export type InvoiceStatus = 'draft' | 'issued' | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'refunded';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'other';

export type PaymentRecordStatus = 'completed' | 'refunded';

export type TaxMode = 'none' | 'gst' | 'flat';

export interface InvoiceItem {
  itemId?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  sortOrder: number;
}

export interface TaxDetails {
  isInterState: boolean;
  placeOfSupply: string | null;
  cgstRate?: number;
  cgstAmount: number;
  sgstRate?: number;
  sgstAmount: number;
  igstRate?: number;
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

export interface InvoicePayment {
  paymentId: string;
  invoiceId: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber: string | null;
  notes: string | null;
  status: PaymentRecordStatus;
  refundReason: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export interface InvoiceEvent {
  eventId: string;
  invoiceId: string;
  eventType: string;
  description: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface Invoice {
  invoiceId: string;
  userId: string;
  contactId: string | null;
  quotationId: string | null;
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxMode: TaxMode;
  taxDetails: TaxDetails | null;
  freelancerInfo: PartyInfo;
  clientInfo: PartyInfo;
  paymentDetails: string | null;
  terms: string | null;
  notes: string | null;
  publicToken: string;
  viewedAt: string | null;
  issuedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  lastRemindedAt: string | null;
  reminderCount: number;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  events: InvoiceEvent[];
  createdAt: string;
  updatedAt: string;

  // Computed fields from InvoiceResponseDto
  paidAmount: number;
  outstandingAmount: number;
  refundedAmount: number;
  paymentStatus: PaymentStatus;
  isOverdue: boolean;
  paymentPercentage: number;
}

export interface InvoiceMetrics {
  totalInvoiced: number;
  totalReceived: number;
  totalOutstanding: number;
  totalOverdue: number;
  totalCount: number;
  draftCount: number;
  issuedCount: number;
  cancelledCount: number;
  overdueCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  unpaidCount: number;
}

export interface PaginatedInvoicesResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceItemPayload {
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountAmount?: number;
  taxRate?: number;
  sortOrder?: number;
}

export interface CreateInvoicePayload {
  title: string;
  contactId?: string;
  quotationId?: string;
  currency?: string;
  issueDate: string;
  dueDate: string;
  taxMode?: TaxMode;
  discountAmount?: number;
  freelancerInfo: PartyInfo;
  clientInfo: PartyInfo;
  paymentDetails?: string;
  terms?: string;
  notes?: string;
  items: InvoiceItemPayload[];
}

export interface UpdateInvoicePayload {
  title?: string;
  contactId?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  taxMode?: TaxMode;
  discountAmount?: number;
  freelancerInfo?: PartyInfo;
  clientInfo?: PartyInfo;
  paymentDetails?: string;
  terms?: string;
  notes?: string;
  items?: InvoiceItemPayload[];
}

export interface RecordPaymentPayload {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface RecordRefundPayload {
  paymentId: string;
  reason: string;
}

export interface SendInvoicePayload {
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}

export interface SendReminderPayload {
  recipientEmail?: string;
  message?: string;
}

export interface CancelInvoicePayload {
  reason: string;
}

export interface InvoiceFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  invoiceStatus?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  contactId?: string;
  startDate?: string;
  endDate?: string;
  isOverdue?: boolean;
}

