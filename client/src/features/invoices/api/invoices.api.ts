import { api } from '@/shared/utils/api-client';
import {
  Invoice,
  InvoiceMetrics,
  PaginatedInvoicesResponse,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  RecordPaymentPayload,
  RecordRefundPayload,
  SendInvoicePayload,
  SendReminderPayload,
  CancelInvoicePayload,
  InvoiceFilterQuery,
  InvoicePayment,
} from '../types/invoice.types';

export const invoicesApi = {
  getInvoices: async (
    query?: InvoiceFilterQuery
  ): Promise<PaginatedInvoicesResponse> => {
    return await api.get<PaginatedInvoicesResponse>('/invoices', query);
  },

  getMetrics: async (): Promise<InvoiceMetrics> => {
    return await api.get<InvoiceMetrics>('/invoices/metrics');
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    return await api.get<Invoice>(`/invoices/${invoiceId}`);
  },

  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    return await api.post<Invoice>('/invoices', payload);
  },

  createFromQuotation: async (
    quotationId: string,
    payload?: {
      billingType?: 'full' | 'percentage' | 'custom';
      percentage?: number;
      customAmount?: number;
      paymentProfileId?: string;
      notes?: string;
      dueDate?: string;
    }
  ): Promise<Invoice> => {
    return await api.post<Invoice>(
      `/invoices/from-quotation/${quotationId}`,
      payload
    );
  },

  updateInvoice: async (
    invoiceId: string,
    payload: UpdateInvoicePayload
  ): Promise<Invoice> => {
    return await api.patch<Invoice>(`/invoices/${invoiceId}`, payload);
  },

  issueInvoice: async (invoiceId: string): Promise<Invoice> => {
    return await api.post<Invoice>(`/invoices/${invoiceId}/issue`);
  },

  sendInvoice: async (
    invoiceId: string,
    payload: SendInvoicePayload
  ): Promise<Invoice> => {
    return await api.post<Invoice>(`/invoices/${invoiceId}/send`, payload);
  },

  recordPayment: async (
    invoiceId: string,
    payload: RecordPaymentPayload
  ): Promise<{ payment: InvoicePayment; invoice: Invoice }> => {
    return await api.post<{ payment: InvoicePayment; invoice: Invoice }>(
      `/invoices/${invoiceId}/payments`,
      payload
    );
  },

  getPayments: async (invoiceId: string): Promise<InvoicePayment[]> => {
    return await api.get<InvoicePayment[]>(`/invoices/${invoiceId}/payments`);
  },

  recordRefund: async (
    invoiceId: string,
    payload: RecordRefundPayload
  ): Promise<Invoice> => {
    return await api.post<Invoice>(`/invoices/${invoiceId}/refund`, payload);
  },

  sendReminder: async (
    invoiceId: string,
    payload: SendReminderPayload
  ): Promise<{ message: string; lastRemindedAt: string; reminderCount: number }> => {
    return await api.post<{
      message: string;
      lastRemindedAt: string;
      reminderCount: number;
    }>(`/invoices/${invoiceId}/remind`, payload);
  },

  cancelInvoice: async (
    invoiceId: string,
    payload: CancelInvoicePayload
  ): Promise<Invoice> => {
    return await api.post<Invoice>(`/invoices/${invoiceId}/cancel`, payload);
  },

  getShareInfo: async (
    invoiceId: string
  ): Promise<{
    invoiceId: string;
    invoiceNumber: string;
    publicUrl: string;
    publicToken: string;
    whatsAppUrl: string;
    shareText: string;
  }> => {
    return await api.get<{
      invoiceId: string;
      invoiceNumber: string;
      publicUrl: string;
      publicToken: string;
      whatsAppUrl: string;
      shareText: string;
    }>(`/invoices/${invoiceId}/share`);
  },

  generateReceipt: async (
    invoiceId: string,
    paymentId: string,
    payload?: { notes?: string }
  ): Promise<any> => {
    return await api.post<any>(
      `/invoices/${invoiceId}/payments/${paymentId}/receipt`,
      payload
    );
  },

  getReceiptsForInvoice: async (invoiceId: string): Promise<any[]> => {
    return await api.get<any[]>(`/invoices/${invoiceId}/receipts`);
  },

  getAllReceipts: async (): Promise<any[]> => {
    return await api.get<any[]>('/receipts');
  },

  getReceiptById: async (receiptId: string): Promise<any> => {
    return await api.get<any>(`/receipts/${receiptId}`);
  },

  // --- Public Portal Methods (No Auth Required) ---

  getPublicInvoice: async (token: string): Promise<Invoice> => {
    return await api.get<Invoice>(`/invoices/public/${token}`, undefined, {
      skipAuth: true,
    });
  },

  getPublicReceipt: async (token: string): Promise<any> => {
    return await api.get<any>(`/receipts/public/${token}`, undefined, {
      skipAuth: true,
    });
  },
};

