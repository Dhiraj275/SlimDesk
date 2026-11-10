import { api } from '@/shared/utils/api-client';
import {
  Quotation,
  QuotationMetrics,
  PaginatedQuotationsResponse,
  CreateQuotationPayload,
  UpdateQuotationPayload,
  SendQuotationPayload,
  ClientAcceptPayload,
  ClientRejectPayload,
  QuotationFilterQuery,
} from '../types/quotation.types';

export const quotationsApi = {
  getQuotations: async (
    query?: QuotationFilterQuery
  ): Promise<PaginatedQuotationsResponse> => {
    return await api.get<PaginatedQuotationsResponse>('/quotations', query);
  },

  getMetrics: async (): Promise<QuotationMetrics> => {
    return await api.get<QuotationMetrics>('/quotations/metrics');
  },

  getQuotationById: async (quotationId: string): Promise<Quotation> => {
    return await api.get<Quotation>(`/quotations/${quotationId}`);
  },

  createQuotation: async (
    payload: CreateQuotationPayload
  ): Promise<Quotation> => {
    return await api.post<Quotation>('/quotations', payload);
  },

  updateQuotation: async (
    quotationId: string,
    payload: UpdateQuotationPayload
  ): Promise<Quotation> => {
    return await api.patch<Quotation>(`/quotations/${quotationId}`, payload);
  },

  sendQuotation: async (
    quotationId: string,
    payload: SendQuotationPayload
  ): Promise<Quotation> => {
    return await api.post<Quotation>(`/quotations/${quotationId}/send`, payload);
  },

  duplicateQuotation: async (quotationId: string): Promise<Quotation> => {
    return await api.post<Quotation>(`/quotations/${quotationId}/duplicate`);
  },

  convertQuotation: async (quotationId: string): Promise<any> => {
    return await api.post<any>(`/invoices/from-quotation/${quotationId}`);
  },

  convertToInvoice: async (
    quotationId: string,
    payload?: {
      billingType?: 'full' | 'percentage' | 'custom';
      percentage?: number;
      customAmount?: number;
      paymentProfileId?: string;
      notes?: string;
      dueDate?: string;
    }
  ): Promise<any> => {
    return await api.post<any>(
      `/invoices/from-quotation/${quotationId}`,
      payload
    );
  },

  getBillingSummary: async (
    quotationId: string
  ): Promise<{
    quotationId: string;
    quotationNumber: string;
    quotationTotal: number;
    totalInvoiced: number;
    remainingBillable: number;
    percentInvoiced: number;
    isFullyInvoiced: boolean;
    invoices: Array<{
      allocationId: string;
      invoiceId: string;
      invoiceNumber: string;
      amountInvoiced: number;
      allocatedAt: string;
      type: string;
      note?: string;
    }>;
  }> => {
    return await api.get<any>(`/quotations/${quotationId}/billing-summary`);
  },

  getShareInfo: async (
    quotationId: string
  ): Promise<{
    quotationId: string;
    quotationNumber: string;
    publicUrl: string;
    publicToken: string;
    whatsAppUrl: string;
    shareText: string;
  }> => {
    return await api.get<any>(`/quotations/${quotationId}/share`);
  },

  deleteQuotation: async (quotationId: string): Promise<void> => {
    return await api.delete<void>(`/quotations/${quotationId}`);
  },

  // --- Public Portal Methods (No Auth Required) ---

  getPublicQuotation: async (token: string): Promise<Quotation> => {
    return await api.get<Quotation>(`/quotations/public/${token}`, undefined, {
      skipAuth: true,
    });
  },

  acceptPublicQuotation: async (
    token: string,
    payload: ClientAcceptPayload
  ): Promise<Quotation> => {
    return await api.post<Quotation>(
      `/quotations/public/${token}/accept`,
      payload,
      { skipAuth: true }
    );
  },

  rejectPublicQuotation: async (
    token: string,
    payload: ClientRejectPayload
  ): Promise<Quotation> => {
    return await api.post<Quotation>(
      `/quotations/public/${token}/reject`,
      payload,
      { skipAuth: true }
    );
  },
};
