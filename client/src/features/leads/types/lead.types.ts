export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  REFERRAL = 'referral',
  MARKETPLACE = 'marketplace',
  COLD_OUTREACH = 'cold_outreach',
  OTHER = 'other',
}

export enum ActivityType {
  LEAD_CREATED = 'lead_created',
  NOTE = 'note',
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  STATUS_CHANGE = 'status_change',
  FOLLOW_UP = 'follow_up',
  QUOTATION = 'quotation',
  CONVERSION = 'conversion',
}

export interface Contact {
  contactId: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  isClient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  activityId: string;
  leadId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  performedAt: string;
  createdAt: string;
}

export interface LeadFollowUp {
  followUpId: string;
  leadId: string;
  userId: string;
  dueDate: string;
  notes?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface Lead {
  leadId: string;
  userId: string;
  contactId?: string | null;
  title: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source: LeadSource;
  interestedService?: string | null;
  estimatedBudget?: number | string | null;
  currency: string;
  status: LeadStatus;
  isQualified: boolean;
  description?: string | null;
  lostReason?: string | null;
  nextFollowUpDate?: string | null;
  lastContactedDate?: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: Contact | null;
  activities?: LeadActivity[];
  followUps?: LeadFollowUp[];
}

export interface LeadMetrics {
  totalLeads: number;
  inProgressCount: number;
  followUpsDueCount: number;
  convertedCount: number;
}

export interface PaginatedLeadsResponse {
  items: Lead[];
  total: number;
}

export interface LeadFilterQuery {
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  isQualified?: boolean;
  overdueFollowUp?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateLeadPayload {
  title?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  interestedService?: string;
  estimatedBudget?: number;
  currency?: string;
  description?: string;
  contactId?: string;
  nextFollowUpDate?: string;
  followUpNotes?: string;
}

export interface UpdateLeadPayload {
  title?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  interestedService?: string;
  estimatedBudget?: number;
  currency?: string;
  description?: string;
  isQualified?: boolean;
  nextFollowUpDate?: string;
  lastContactedDate?: string;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
  lostReason?: string;
  note?: string;
}

export interface CreateLeadActivityPayload {
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  performedAt?: string;
}

export interface CreateLeadFollowUpPayload {
  dueDate: string;
  notes?: string;
}
