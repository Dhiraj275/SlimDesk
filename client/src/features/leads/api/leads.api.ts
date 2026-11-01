import { api } from '@/shared/utils/api-client';
import {
  CreateLeadActivityPayload,
  CreateLeadFollowUpPayload,
  CreateLeadPayload,
  Lead,
  LeadActivity,
  LeadFilterQuery,
  LeadFollowUp,
  LeadMetrics,
  PaginatedLeadsResponse,
  UpdateLeadPayload,
  UpdateLeadStatusPayload,
} from '../types/lead.types';

export const leadsApi = {
  getLeads: async (query?: LeadFilterQuery): Promise<PaginatedLeadsResponse> => {
    return await api.get<PaginatedLeadsResponse>('/leads', query);
  },

  getMetrics: async (): Promise<LeadMetrics> => {
    return await api.get<LeadMetrics>('/leads/metrics');
  },

  getLeadById: async (leadId: string): Promise<Lead> => {
    return await api.get<Lead>(`/leads/${leadId}`);
  },

  createLead: async (payload: CreateLeadPayload): Promise<Lead> => {
    return await api.post<Lead>('/leads', payload);
  },

  updateLead: async (leadId: string, payload: UpdateLeadPayload): Promise<Lead> => {
    return await api.patch<Lead>(`/leads/${leadId}`, payload);
  },

  updateStatus: async (
    leadId: string,
    payload: UpdateLeadStatusPayload
  ): Promise<Lead> => {
    return await api.patch<Lead>(`/leads/${leadId}/status`, payload);
  },

  convertLead: async (leadId: string): Promise<Lead> => {
    return await api.post<Lead>(`/leads/${leadId}/convert`);
  },

  deleteLead: async (leadId: string): Promise<void> => {
    return await api.delete<void>(`/leads/${leadId}`);
  },

  getActivities: async (leadId: string): Promise<LeadActivity[]> => {
    return await api.get<LeadActivity[]>(`/leads/${leadId}/activities`);
  },

  addActivity: async (
    leadId: string,
    payload: CreateLeadActivityPayload
  ): Promise<LeadActivity> => {
    return await api.post<LeadActivity>(`/leads/${leadId}/activities`, payload);
  },

  addFollowUp: async (
    leadId: string,
    payload: CreateLeadFollowUpPayload
  ): Promise<LeadFollowUp> => {
    return await api.post<LeadFollowUp>(`/leads/${leadId}/followups`, payload);
  },

  completeFollowUp: async (
    leadId: string,
    followUpId: string
  ): Promise<LeadFollowUp> => {
    return await api.patch<LeadFollowUp>(
      `/leads/${leadId}/followups/${followUpId}/complete`
    );
  },
};
