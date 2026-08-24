export type Role = 'owner' | 'admin' | 'manager' | 'member' | 'client_viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatarUrl?: string;
  role: Role;
  organizationId: string;
  hourlyRate?: number;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  organizationId: string;
  createdAt: string;

  // 1. Client / Company Information
  companySize?: string;
  headquartersLocation?: string;
  country?: string;
  timezone?: string;
  linkedinCompanyPage?: string;
  companyDescription?: string;

  // Business classification
  clientType?: 'Prospect' | 'Active' | 'Past';
  clientTier?: 'Strategic' | 'Standard' | 'Small';
  leadSource?: string;
  accountOwnerId?: string;

  // Operational
  billingAddress?: string;
  shippingAddress?: string;
  taxNumber?: string;
  legalEntityName?: string;

  // Strategic information
  keyProductsServices?: string;
  targetMarket?: string;
  competitors?: string;
  technologyStack?: string[];

  // 5. Financial Information
  contractValue?: number;
  pricingModel?: 'hourly' | 'fixed' | 'retainer';
  retainerAmount?: number;
  paymentTerms?: string;

  // 7. Marketing Data
  newsletterSubscription?: boolean;
  campaignEngagement?: string;
  websiteVisits?: number;
  contentDownloads?: number;
  eventsAttended?: string[];

  // 8. Relationship Health
  clientSatisfactionScore?: number;
  relationshipHealth?: 'Green' | 'Yellow' | 'Red';
  riskOfChurn?: 'Low' | 'Medium' | 'High';
  upsellOpportunity?: string;

  // 9. Agency-Specific Fields
  serviceInterests?: string[];
  agencyTechStack?: string[];
  digitalMaturity?: 'Low' | 'Medium' | 'High';

  // 10. Internal Agency Notes
  budgetExpectations?: string;
  negotiationNotes?: string;
  internalProjectRisks?: string;
  politicalRelationships?: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  linkedin?: string;

  // Relationship info
  isDecisionMaker?: boolean;
  isInfluencer?: boolean;
  isBudgetOwner?: boolean;
  isTechnicalContact?: boolean;
  isDayToDayContact?: boolean;

  // Communication preferences
  preferredContactMethod?: 'Email' | 'Phone' | 'LinkedIn' | 'Other';
  timezone?: string;
  language?: string;

  // Notes
  personalNotes?: string;
  lastContactDate?: string;
  relationshipStrengthScore?: number;
}

export interface Communication {
  id: string;
  clientId: string;
  contactId?: string;
  type: 'Email' | 'Meeting' | 'Call' | 'Note' | 'Proposal' | 'Contract';
  date: string;
  summary: string;
  nextAction?: string;
}

export type DealStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Deal {
  id: string;
  clientId: string;
  name: string;
  value: number;
  stage: DealStage;
  ownerId: string;
  expectedCloseDate?: string;
  createdAt: string;

  // Deal details
  probability?: number;
  serviceType?: string;

  // Project scope
  description?: string;
  painPoints?: string;
  proposedSolution?: string;

  // Competitors
  competingAgencies?: string[];
  winLossReason?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  budget?: number;
  organizationId: string;
  createdAt: string;

  // Project basics
  projectOwnerId?: string;
  teamMemberIds?: string[];

  // Timeline
  startDate?: string;
  endDate?: string;
  milestones?: string[];
  deliveryStatus?: string;

  // Scope
  servicesDelivered?: string[];
  deliverables?: string[];
  kpis?: string;

  // Documentation
  contractsUrl?: string;
  sowUrl?: string;
  proposalUrl?: string;
  designFilesUrl?: string;
  keyLinks?: { title: string; url: string }[];
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
}

export interface BoardGroup {
  id: string;
  boardId: string;
  name: string;
  color: string;
  order: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  clientId?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId?: string;
  projectId: string;
  userId: string;
  date: string;
  hours: number;
  description?: string;
  billable: boolean;
}

export interface ResourceAllocation {
  id: string;
  userId: string;
  projectId: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceTemplate {
  companyName: string;
  companyAddress: string;
  taxId?: string;
  logoUrl?: string;
  defaultDueDays: number;
  notes: string;
  footer: string;
}

export interface FinanceSettings {
  currency: string;
  taxRate: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  number: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  sentToEmail?: string;
  logoUrl?: string;
  createdAt: string;
}
