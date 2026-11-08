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

  createFromQuotation: async (quotationId: string): Promise<Invoice> => {
    return await api.post<Invoice>(`/invoices/from-quotation/${quotationId}`);
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

  // --- Public Portal Methods (No Auth Required) ---

  getPublicInvoice: async (token: string): Promise<Invoice> => {
    return await api.get<Invoice>(`/invoices/public/${token}`, undefined, {
      skipAuth: true,
    });
  },
};
