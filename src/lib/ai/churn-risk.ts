/**
 * Churn risk analysis for customers.
 * Uses deterministic rule-based scoring as a fallback.
 * Designed so a real ML model can be plugged in later.
 */

export interface ChurnRiskResult {
  score: number; // 0-100
  band: "low" | "medium" | "high" | "critical";
  signals: ChurnSignal[];
  suggestedAction: string;
  method: "rule-based" | "ai-model";
}

export interface ChurnSignal {
  factor: string;
  impact: "positive" | "negative";
  weight: number;
  description: string;
}

export function analyzeChurnRisk(params: {
  daysSinceLastPurchase: number;
  daysSinceLastActivity: number;
  purchaseCount: number;
  avgOrderValue: number;
  totalRevenue: number;
  openComplaints: number;
  resolvedComplaints: number;
  accountAgeDays: number;
  sentimentHistory: ("positive" | "neutral" | "negative")[];
}): ChurnRiskResult {
  const signals: ChurnSignal[] = [];
  let riskScore = 0;

  // Purchase recency
  if (params.daysSinceLastPurchase > 120) {
    riskScore += 25;
    signals.push({
      factor: "Purchase recency",
      impact: "negative",
      weight: 25,
      description: `No purchase in ${params.daysSinceLastPurchase} days (>120 day threshold)`,
    });
  } else if (params.daysSinceLastPurchase > 60) {
    riskScore += 15;
    signals.push({
      factor: "Purchase recency",
      impact: "negative",
      weight: 15,
      description: `Last purchase ${params.daysSinceLastPurchase} days ago (>60 day threshold)`,
    });
  } else {
    signals.push({
      factor: "Purchase recency",
      impact: "positive",
      weight: 0,
      description: `Recent purchase ${params.daysSinceLastPurchase} days ago`,
    });
  }

  // Activity recency
  if (params.daysSinceLastActivity > 45) {
    riskScore += 20;
    signals.push({
      factor: "Engagement",
      impact: "negative",
      weight: 20,
      description: `No activity in ${params.daysSinceLastActivity} days`,
    });
  } else if (params.daysSinceLastActivity > 21) {
    riskScore += 10;
    signals.push({
      factor: "Engagement",
      impact: "negative",
      weight: 10,
      description: `Low engagement — last activity ${params.daysSinceLastActivity} days ago`,
    });
  } else {
    signals.push({
      factor: "Engagement",
      impact: "positive",
      weight: 0,
      description: "Active engagement recently",
    });
  }

  // Complaint ratio
  const totalComplaints = params.openComplaints + params.resolvedComplaints;
  if (params.openComplaints >= 2) {
    riskScore += 20;
    signals.push({
      factor: "Open complaints",
      impact: "negative",
      weight: 20,
      description: `${params.openComplaints} unresolved complaints`,
    });
  } else if (totalComplaints > 3 && params.resolvedComplaints / totalComplaints < 0.7) {
    riskScore += 10;
    signals.push({
      factor: "Complaint resolution",
      impact: "negative",
      weight: 10,
      description: "Low complaint resolution rate",
    });
  }

  // Sentiment trend
  const recentNegative = params.sentimentHistory.filter((s) => s === "negative").length;
  if (recentNegative >= 2) {
    riskScore += 15;
    signals.push({
      factor: "Sentiment trend",
      impact: "negative",
      weight: 15,
      description: `${recentNegative} negative interactions recently`,
    });
  }

  // Purchase frequency
  if (params.accountAgeDays > 90 && params.purchaseCount < 2) {
    riskScore += 10;
    signals.push({
      factor: "Purchase frequency",
      impact: "negative",
      weight: 10,
      description: "Very low purchase frequency for account age",
    });
  }

  // Customer value (high value customers get extra attention)
  if (params.totalRevenue > 5000 && riskScore > 30) {
    riskScore += 10;
    signals.push({
      factor: "Customer value",
      impact: "negative",
      weight: 10,
      description: `High-value customer ($${params.totalRevenue.toFixed(0)}) showing risk signals`,
    });
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  const band: ChurnRiskResult["band"] =
    riskScore >= 75 ? "critical" :
    riskScore >= 50 ? "high" :
    riskScore >= 25 ? "medium" : "low";

  const suggestedAction =
    band === "critical" ? "Schedule an urgent personal check-in call" :
    band === "high" ? "Send a personalized re-engagement email with a special offer" :
    band === "medium" ? "Schedule a routine check-in within the next week" :
    "No immediate action needed — continue monitoring";

  return {
    score: riskScore,
    band,
    signals,
    suggestedAction,
    method: "rule-based",
  };
}
