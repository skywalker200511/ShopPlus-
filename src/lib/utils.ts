import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  if (typeof window === "undefined") {
    return formatDate(date);
  }
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateHealthScore(params: {
  daysSinceLastPurchase: number;
  daysSinceLastActivity: number;
  totalPurchases: number;
  openComplaints: number;
  complaintSeverityAvg: number;
}): { score: number; band: "healthy" | "at-risk" | "critical"; signals: string[] } {
  let score = 100;
  const signals: string[] = [];

  // Purchase recency
  if (params.daysSinceLastPurchase > 90) {
    score -= 20;
    signals.push(`No purchase in ${params.daysSinceLastPurchase} days`);
  } else if (params.daysSinceLastPurchase > 60) {
    score -= 10;
    signals.push(`Last purchase ${params.daysSinceLastPurchase} days ago`);
  }

  // Activity recency
  if (params.daysSinceLastActivity > 30) {
    score -= 25;
    signals.push(`No activity in ${params.daysSinceLastActivity} days`);
  } else if (params.daysSinceLastActivity > 14) {
    score -= 10;
    signals.push(`Last activity ${params.daysSinceLastActivity} days ago`);
  }

  // Purchase volume
  if (params.totalPurchases === 0) {
    score -= 15;
    signals.push("No purchases recorded");
  } else if (params.totalPurchases < 3) {
    score -= 5;
    signals.push("Low purchase volume");
  }

  // Open complaints
  if (params.openComplaints > 0) {
    score -= params.openComplaints * 10;
    signals.push(`${params.openComplaints} open complaint(s)`);
  }

  // Complaint severity
  if (params.complaintSeverityAvg > 3) {
    score -= 15;
    signals.push("High severity complaints");
  }

  score = Math.max(0, Math.min(100, score));
  const band = score >= 70 ? "healthy" : score >= 40 ? "at-risk" : "critical";

  return { score, band, signals };
}

export function calculateComplaintPriority(params: {
  severity: number; // 1-5
  sentiment: "positive" | "neutral" | "negative";
  customerImportance: number; // 1-5
  hoursToSla: number;
}): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Severity (0-30 points)
  score += params.severity * 6;
  if (params.severity >= 4) reasons.push(`High severity (${params.severity}/5)`);

  // Sentiment (0-20 points)
  if (params.sentiment === "negative") {
    score += 20;
    reasons.push("Negative sentiment detected");
  } else if (params.sentiment === "neutral") {
    score += 10;
  }

  // Customer importance (0-25 points)
  score += params.customerImportance * 5;
  if (params.customerImportance >= 4) reasons.push(`High-value customer (${params.customerImportance}/5)`);

  // SLA urgency (0-25 points)
  if (params.hoursToSla <= 0) {
    score += 25;
    reasons.push("SLA overdue");
  } else if (params.hoursToSla <= 4) {
    score += 20;
    reasons.push(`SLA due in ${Math.round(params.hoursToSla)}h`);
  } else if (params.hoursToSla <= 24) {
    score += 10;
    reasons.push(`SLA due in ${Math.round(params.hoursToSla)}h`);
  }

  return { score: Math.min(100, score), reasons };
}
