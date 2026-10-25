// ============ Enums ============
export type UserRole = "admin" | "manager" | "employee";
export type CustomerStatus = "active" | "inactive" | "churned";
export type LeadStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type ComplaintStatus = "new" | "in_progress" | "waiting" | "resolved";
export type ComplaintSentiment = "positive" | "neutral" | "negative";
export type RecommendationStatus = "pending" | "accepted" | "dismissed" | "completed";
export type RecommendationType = "check_in" | "respond_complaint" | "follow_up_lead" | "re_engage" | "upsell";
export type ActivityType = "email" | "call" | "meeting" | "note" | "purchase" | "complaint" | "lead_update";
export type ImportStatus = "pending" | "processing" | "completed" | "failed";
export type ImportRowStatus = "valid" | "invalid" | "duplicate" | "imported" | "skipped";

// ============ Core Models ============
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  display_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  owner_id?: string;
  tags: string[];
  importance: number; // 1-5
  health_score?: number;
  health_band?: "healthy" | "at-risk" | "critical";
  health_signals?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  owner_name?: string;
  last_activity_at?: string;
  total_purchases?: number;
  total_revenue?: number;
  open_complaints_count?: number;
}

export interface Lead {
  id: string;
  workspace_id: string;
  customer_id?: string;
  contact_name: string;
  contact_email: string;
  company?: string;
  source?: string;
  lead_type?: string;
  value: number;
  stage: LeadStage;
  owner_id?: string;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  owner_name?: string;
  customer_name?: string;
}

export interface LeadHistory {
  id: string;
  lead_id: string;
  from_stage?: LeadStage;
  to_stage: LeadStage;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  workspace_id: string;
  customer_id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  severity: number; // 1-5
  sentiment?: ComplaintSentiment;
  sentiment_confidence?: number;
  sentiment_explanation?: string;
  priority_score?: number;
  priority_reasons?: string[];
  owner_id?: string;
  sla_due_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  owner_name?: string;
  customer_name?: string;
  customer_email?: string;
  notes_count?: number;
}

export interface ComplaintNote {
  id: string;
  complaint_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  // Joined
  author_name?: string;
}

export interface Activity {
  id: string;
  workspace_id: string;
  customer_id: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  performed_by?: string;
  created_at: string;
  // Joined
  performer_name?: string;
}

export interface Purchase {
  id: string;
  workspace_id: string;
  customer_id: string;
  amount: number;
  description: string;
  purchased_at: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  workspace_id: string;
  customer_id?: string;
  lead_id?: string;
  complaint_id?: string;
  type: RecommendationType;
  title: string;
  reason: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: RecommendationStatus;
  action_taken?: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  dismissed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  customer_name?: string;
  assigned_to_name?: string;
}

export interface ImportJob {
  id: string;
  workspace_id: string;
  filename: string;
  status: ImportStatus;
  total_rows: number;
  imported_rows: number;
  skipped_rows: number;
  failed_rows: number;
  duplicate_rows: number;
  errors?: string[];
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface ImportRow {
  id: string;
  import_job_id: string;
  row_number: number;
  status: ImportRowStatus;
  data: Record<string, string>;
  errors?: string[];
  customer_id?: string;
}

export interface AuditEvent {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, unknown>;
  created_at: string;
  // Joined
  user_name?: string;
}

// ============ Dashboard Types ============
export interface DashboardMetrics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  retentionRate: number;
  churnRiskCount: number;
  openPipelineValue: number;
  leadConversionRate: number;
  openComplaints: number;
  overdueComplaints: number;
  avgResolutionTimeHours: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

export interface CustomerGrowthDataPoint {
  date: string;
  customers: number;
  newCustomers: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface PipelineSummary {
  stage: LeadStage;
  count: number;
  value: number;
}

// ============ Form Types ============
export interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  owner_id?: string;
  tags: string[];
  importance: number;
  notes?: string;
}

export interface LeadFormData {
  contact_name: string;
  contact_email: string;
  company?: string;
  source?: string;
  lead_type?: string;
  value: number;
  stage: LeadStage;
  owner_id?: string;
  expected_close_date?: string;
  notes?: string;
  customer_id?: string;
}

export interface ComplaintFormData {
  customer_id: string;
  title: string;
  description: string;
  severity: number;
  owner_id?: string;
  sla_due_at?: string;
}

// ============ Auth Context ============
export interface AppUser {
  id: string;
  email: string;
  workspace_id: string;
  workspace_name: string;
  role: UserRole;
  display_name: string;
  avatar_url?: string;
}
