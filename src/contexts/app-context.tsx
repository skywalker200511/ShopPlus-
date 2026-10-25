"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import type {
  AppUser,
  Customer,
  Lead,
  Complaint,
  ComplaintNote,
  Activity,
  Purchase,
  Recommendation,
  WorkspaceMembership,
  DashboardMetrics,
  CustomerGrowthDataPoint,
  RevenueDataPoint,
  PipelineSummary,
  ImportJob,
  LeadStage,
  ComplaintStatus,
  RecommendationStatus,
  UserRole,
} from "@/types/database";
import { generateId, normalizeEmail, calculateHealthScore, calculateComplaintPriority, useIsClient } from "@/lib/utils";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import {
  demoData,
  getDemoDashboardMetrics,
  getDemoCustomerGrowth,
  getDemoRevenueData,
  getDemoPipelineSummary,
  ADMIN_ID,
  MANAGER_ID,
  EMPLOYEE_ID,
  WORKSPACE_ID,
} from "@/lib/demo-data";

interface AppContextType {
  // Current user & role simulation
  user: AppUser;
  switchUserRole: (role: UserRole) => void;
  isDemoMode: boolean;

  // Records
  customers: Customer[];
  leads: Lead[];
  complaints: Complaint[];
  complaintNotes: ComplaintNote[];
  activities: Activity[];
  purchases: Purchase[];
  recommendations: Recommendation[];
  members: WorkspaceMembership[];
  importJobs: ImportJob[];

  // Metrics
  dashboardMetrics: DashboardMetrics;
  customerGrowthData: CustomerGrowthDataPoint[];
  revenueData: RevenueDataPoint[];
  pipelineSummary: PipelineSummary[];

  // Customer actions
  addCustomer: (data: Omit<Customer, "id" | "workspace_id" | "created_at" | "updated_at">) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  checkDuplicateEmail: (email: string, excludeId?: string) => Customer | undefined;

  // Lead actions
  addLead: (data: Omit<Lead, "id" | "workspace_id" | "created_at" | "updated_at">) => Lead;
  updateLead: (id: string, data: Partial<Lead>) => void;
  moveLead: (id: string, stage: LeadStage) => void;
  deleteLead: (id: string) => void;
  getLead: (id: string) => Lead | undefined;

  // Complaint actions
  addComplaint: (data: Omit<Complaint, "id" | "workspace_id" | "created_at" | "updated_at">) => Complaint;
  updateComplaint: (id: string, data: Partial<Complaint>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  deleteComplaint: (id: string) => void;
  getComplaint: (id: string) => Complaint | undefined;
  addComplaintNote: (complaintId: string, content: string, isInternal: boolean) => void;
  getComplaintNotes: (complaintId: string) => ComplaintNote[];

  // Recommendations
  updateRecommendation: (id: string, status: RecommendationStatus, actionTaken?: string) => void;

  // Activities
  addActivity: (data: Omit<Activity, "id" | "workspace_id" | "created_at">) => void;

  // Import
  addImportJob: (job: ImportJob) => void;

  // Global search
  globalSearch: (query: string) => { type: "customer" | "lead" | "complaint"; id: string; title: string; subtitle: string }[];
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const isDemoMode = true;

  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [customers, setCustomers] = useState<Customer[]>(demoData.customers);
  const [leads, setLeads] = useState<Lead[]>(demoData.leads);
  const [complaints, setComplaints] = useState<Complaint[]>(demoData.complaints);
  const [complaintNotes, setComplaintNotes] = useState<ComplaintNote[]>(demoData.complaintNotes);
  const [activities, setActivities] = useState<Activity[]>(demoData.activities);
  const [purchases, setPurchases] = useState<Purchase[]>(demoData.purchases);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(demoData.recommendations);
  const [members, setMembers] = useState<WorkspaceMembership[]>(demoData.members);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const isClient = useIsClient();
  const currentTimestamp = isClient ? 1750000000000 : 1700000000000;

  const userProfiles: Record<UserRole, AppUser> = {
    admin: {
      id: ADMIN_ID,
      email: "sarah@solez.store",
      workspace_id: WORKSPACE_ID,
      workspace_name: "Solez",
      role: "admin",
      display_name: "Sarah Chen",
    },
    manager: {
      id: MANAGER_ID,
      email: "marcus@solez.store",
      workspace_id: WORKSPACE_ID,
      workspace_name: "Solez",
      role: "manager",
      display_name: "Marcus Vance (Manager)",
    },
    employee: {
      id: EMPLOYEE_ID,
      email: "elena@solez.store",
      workspace_id: WORKSPACE_ID,
      workspace_name: "Solez",
      role: "employee",
      display_name: "Elena Rostova (Employee)",
    },
  };

  const user = userProfiles[currentRole];

  const switchUserRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
  }, []);

  // Customer actions
  const addCustomer = useCallback((data: Omit<Customer, "id" | "workspace_id" | "created_at" | "updated_at">) => {
    const health = calculateHealthScore({
      daysSinceLastPurchase: 10,
      daysSinceLastActivity: 1,
      totalPurchases: 1,
      openComplaints: 0,
      complaintSeverityAvg: 0,
    });

    const newCust: Customer = {
      ...data,
      id: generateId(),
      workspace_id: WORKSPACE_ID,
      health_score: health.score,
      health_band: health.band,
      health_signals: health.signals,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  }, []);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCustomer = useCallback((id: string) => {
    return customers.find((c) => c.id === id);
  }, [customers]);

  const checkDuplicateEmail = useCallback((email: string, excludeId?: string) => {
    const normalized = normalizeEmail(email);
    return customers.find((c) => normalizeEmail(c.email) === normalized && c.id !== excludeId);
  }, [customers]);

  // Lead actions
  const addLead = useCallback((data: Omit<Lead, "id" | "workspace_id" | "created_at" | "updated_at">) => {
    const newLead: Lead = {
      ...data,
      id: generateId(),
      workspace_id: WORKSPACE_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l))
    );
  }, []);

  const moveLead = useCallback((id: string, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage, updated_at: new Date().toISOString() } : l))
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getLead = useCallback((id: string) => {
    return leads.find((l) => l.id === id);
  }, [leads]);

  // Complaint actions
  const addComplaint = useCallback((data: Omit<Complaint, "id" | "workspace_id" | "created_at" | "updated_at">) => {
    const sentiment = analyzeSentiment(data.description);
    const cust = customers.find((c) => c.id === data.customer_id);
    const priority = calculateComplaintPriority({
      severity: data.severity,
      sentiment: sentiment.sentiment,
      customerImportance: cust?.importance || 3,
      hoursToSla: 24,
    });

    const newComplaint: Complaint = {
      ...data,
      id: generateId(),
      workspace_id: WORKSPACE_ID,
      customer_name: cust?.name,
      customer_email: cust?.email,
      sentiment: sentiment.sentiment,
      sentiment_confidence: sentiment.confidence,
      sentiment_explanation: sentiment.explanation,
      priority_score: priority.score,
      priority_reasons: priority.reasons,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  }, [customers]);

  const updateComplaint = useCallback((id: string, data: Partial<Complaint>) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const updateComplaintStatus = useCallback((id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              resolved_at: status === "resolved" ? new Date().toISOString() : c.resolved_at,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  const deleteComplaint = useCallback((id: string) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getComplaint = useCallback((id: string) => {
    return complaints.find((c) => c.id === id);
  }, [complaints]);

  const addComplaintNote = useCallback((complaintId: string, content: string, isInternal: boolean) => {
    const newNote: ComplaintNote = {
      id: generateId(),
      complaint_id: complaintId,
      author_id: user.id,
      author_name: user.display_name,
      content,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };
    setComplaintNotes((prev) => [...prev, newNote]);
  }, [user]);

  const getComplaintNotes = useCallback((complaintId: string) => {
    return complaintNotes.filter((n) => n.complaint_id === complaintId);
  }, [complaintNotes]);

  // Recommendations
  const updateRecommendation = useCallback((id: string, status: RecommendationStatus, actionTaken?: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              action_taken: actionTaken || r.action_taken,
              completed_at: status === "completed" ? new Date().toISOString() : r.completed_at,
              dismissed_at: status === "dismissed" ? new Date().toISOString() : r.dismissed_at,
              updated_at: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  // Activities
  const addActivity = useCallback((data: Omit<Activity, "id" | "workspace_id" | "created_at">) => {
    const act: Activity = {
      ...data,
      id: generateId(),
      workspace_id: WORKSPACE_ID,
      performed_by: user.id,
      performer_name: user.display_name,
      created_at: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);
  }, [user]);

  // Import
  const addImportJob = useCallback((job: ImportJob) => {
    setImportJobs((prev) => [job, ...prev]);
  }, []);

  // Global search
  const globalSearch = useCallback((query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const results: { type: "customer" | "lead" | "complaint"; id: string; title: string; subtitle: string }[] = [];

    customers.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q))) {
        results.push({ type: "customer", id: c.id, title: c.name, subtitle: `Customer · ${c.email}` });
      }
    });

    leads.forEach((l) => {
      if (l.contact_name.toLowerCase().includes(q) || l.contact_email.toLowerCase().includes(q) || (l.company && l.company.toLowerCase().includes(q))) {
        results.push({ type: "lead", id: l.id, title: l.contact_name, subtitle: `Lead · ${l.stage} · $${l.value.toLocaleString()}` });
      }
    });

    complaints.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({ type: "complaint", id: c.id, title: c.title, subtitle: `Complaint · ${c.status} · ${c.customer_name || "Customer"}` });
      }
    });

    return results.slice(0, 15);
  }, [customers, leads, complaints]);

  // Metrics computed dynamically from current state
  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
    const activeCusts = customers.filter((c) => c.status === "active");
    const churnedCusts = customers.filter((c) => c.status === "churned");
    const churnRisk = customers.filter((c) => c.health_band === "at-risk" || c.health_band === "critical");
    const openLeads = leads.filter((l) => !["won", "lost"].includes(l.stage));
    const wonLeads = leads.filter((l) => l.stage === "won");
    const closedLeads = leads.filter((l) => ["won", "lost"].includes(l.stage));
    const openComplaints = complaints.filter((c) => c.status !== "resolved");
    const nowMs = currentTimestamp || 1700000000000;
    const overdueComplaints = complaints.filter(
      (c) => c.status !== "resolved" && c.sla_due_at && new Date(c.sla_due_at).getTime() < nowMs
    );
    const totalRev = purchases.reduce((sum, p) => sum + p.amount, 0);
    const thirtyDaysAgo = new Date(nowMs - 30 * 86_400_000);
    const revThisMonth = purchases
      .filter((p) => new Date(p.purchased_at) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalCustomers: customers.length,
      newCustomersThisMonth: customers.filter((c) => new Date(c.created_at) >= thirtyDaysAgo).length,
      retentionRate: customers.length > 0 ? Math.round(((customers.length - churnedCusts.length) / customers.length) * 100) : 100,
      churnRiskCount: churnRisk.length,
      openPipelineValue: openLeads.reduce((sum, l) => sum + l.value, 0),
      leadConversionRate: closedLeads.length > 0 ? Math.round((wonLeads.length / closedLeads.length) * 100) : 50,
      openComplaints: openComplaints.length,
      overdueComplaints: overdueComplaints.length,
      avgResolutionTimeHours: 18,
      totalRevenue: totalRev,
      revenueThisMonth: revThisMonth,
    };
  }, [customers, leads, complaints, purchases, currentTimestamp]);

  const customerGrowthData = useMemo<CustomerGrowthDataPoint[]>(() => {
    return getDemoCustomerGrowth();
  }, []);

  const revenueData = useMemo<RevenueDataPoint[]>(() => {
    return getDemoRevenueData();
  }, []);

  const pipelineSummary = useMemo<PipelineSummary[]>(() => {
    const stages: LeadStage[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
    return stages.map((stage) => {
      const stageLeads = leads.filter((l) => l.stage === stage);
      return {
        stage,
        count: stageLeads.length,
        value: stageLeads.reduce((sum, l) => sum + l.value, 0),
      };
    });
  }, [leads]);

  return (
    <AppContext.Provider
      value={{
        user,
        switchUserRole,
        isDemoMode,
        customers,
        leads,
        complaints,
        complaintNotes,
        activities,
        purchases,
        recommendations,
        members,
        importJobs,
        dashboardMetrics,
        customerGrowthData,
        revenueData,
        pipelineSummary,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
        checkDuplicateEmail,
        addLead,
        updateLead,
        moveLead,
        deleteLead,
        getLead,
        addComplaint,
        updateComplaint,
        updateComplaintStatus,
        deleteComplaint,
        getComplaint,
        addComplaintNote,
        getComplaintNotes,
        updateRecommendation,
        addActivity,
        addImportJob,
        globalSearch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
