/**
 * Recommendation engine that generates follow-up suggestions
 * based on customer data, complaints, and lead status.
 * Rule-based fallback; designed for AI provider replacement.
 */

import type { Customer, Lead, Complaint, Recommendation, RecommendationType } from "@/types/database";

export interface RecommendationInput {
  customer?: Customer;
  leads?: Lead[];
  complaints?: Complaint[];
  daysSinceLastActivity?: number;
  daysSinceLastPurchase?: number;
}

export interface GeneratedRecommendation {
  type: RecommendationType;
  title: string;
  reason: string;
  priority: "low" | "medium" | "high" | "urgent";
  customer_id?: string;
  lead_id?: string;
  complaint_id?: string;
  method: "rule-based" | "ai-model";
}

export function generateRecommendations(input: RecommendationInput): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = [];

  // Check for unresponded complaints
  if (input.complaints) {
    for (const complaint of input.complaints) {
      if (complaint.status === "new") {
        recommendations.push({
          type: "respond_complaint",
          title: `Respond to complaint: ${complaint.title}`,
          reason: `This complaint has status "New" and needs an initial response. ${complaint.severity >= 4 ? "High severity — prioritize this." : ""}`,
          priority: complaint.severity >= 4 ? "urgent" : "high",
          customer_id: complaint.customer_id,
          complaint_id: complaint.id,
          method: "rule-based",
        });
      }
      if (complaint.status === "waiting" && complaint.sla_due_at) {
        const hoursLeft = (new Date(complaint.sla_due_at).getTime() - Date.now()) / 3600000;
        if (hoursLeft < 8) {
          recommendations.push({
            type: "respond_complaint",
            title: `SLA approaching for: ${complaint.title}`,
            reason: `SLA deadline is in ${Math.max(0, Math.round(hoursLeft))} hours. Follow up to avoid missing the target.`,
            priority: hoursLeft <= 0 ? "urgent" : "high",
            customer_id: complaint.customer_id,
            complaint_id: complaint.id,
            method: "rule-based",
          });
        }
      }
    }
  }

  // Check for stale leads
  if (input.leads) {
    for (const lead of input.leads) {
      if (lead.stage === "qualified" || lead.stage === "proposal") {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(lead.updated_at).getTime()) / 86400000
        );
        if (daysSinceUpdate > 7) {
          recommendations.push({
            type: "follow_up_lead",
            title: `Follow up on ${lead.stage} lead: ${lead.contact_name}`,
            reason: `This lead has been in "${lead.stage}" stage for ${daysSinceUpdate} days without updates. Value: $${lead.value.toLocaleString()}.`,
            priority: lead.value > 10000 ? "high" : "medium",
            lead_id: lead.id,
            customer_id: lead.customer_id || undefined,
            method: "rule-based",
          });
        }
      }
      if (lead.expected_close_date) {
        const daysToClose = Math.floor(
          (new Date(lead.expected_close_date).getTime() - Date.now()) / 86400000
        );
        if (daysToClose <= 7 && daysToClose > 0 && lead.stage !== "won" && lead.stage !== "lost") {
          recommendations.push({
            type: "follow_up_lead",
            title: `Close date approaching for lead: ${lead.contact_name}`,
            reason: `Expected close date is in ${daysToClose} days. Current stage: ${lead.stage}. Take action to advance this deal.`,
            priority: "high",
            lead_id: lead.id,
            method: "rule-based",
          });
        }
      }
    }
  }

  // Check for customer re-engagement
  if (input.customer) {
    if (input.daysSinceLastActivity && input.daysSinceLastActivity > 30) {
      recommendations.push({
        type: "re_engage",
        title: `Re-engage ${input.customer.name}`,
        reason: `No activity from this customer in ${input.daysSinceLastActivity} days. Consider a check-in to maintain the relationship.`,
        priority: input.daysSinceLastActivity > 60 ? "high" : "medium",
        customer_id: input.customer.id,
        method: "rule-based",
      });
    }
    if (input.customer.health_band === "critical") {
      recommendations.push({
        type: "check_in",
        title: `Urgent check-in with ${input.customer.name}`,
        reason: `Health score is critical (${input.customer.health_score}/100). Signals: ${input.customer.health_signals?.join("; ") || "multiple risk factors"}.`,
        priority: "urgent",
        customer_id: input.customer.id,
        method: "rule-based",
      });
    } else if (input.customer.health_band === "at-risk") {
      recommendations.push({
        type: "check_in",
        title: `Schedule check-in with ${input.customer.name}`,
        reason: `Health score is declining (${input.customer.health_score}/100). Early intervention can prevent churn.`,
        priority: "medium",
        customer_id: input.customer.id,
        method: "rule-based",
      });
    }
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}
